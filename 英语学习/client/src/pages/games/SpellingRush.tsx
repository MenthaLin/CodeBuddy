/**
 * pages/games/SpellingRush.tsx - 拼词大作战 [P0]
 * English Fun Zone
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import GameHeader from '@/components/game/GameHeader';
import ResultPanel from '@/components/game/ResultPanel';
import ScorePopup from '@/components/common/ScorePopup';
import { useGameStore } from '@/stores/useGameStore';
import { useTimer } from '@/hooks/useTimer';
import { useCombo } from '@/hooks/useCombo';
import { useScoring } from '@/hooks/useScoring';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useGameEngine } from '@/hooks/useGameEngine';
import { shuffleLetters } from '@/lib/word-utils';
import { playErrorSound } from '@/lib/audio-manager';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { SPELLING_PENALTY, GAME_CONFIGS } from '@/config/constants';
import type { GameResult, AnswerLogEntry } from '@/types/game';
import type { AchievementDefinition } from '@/types/achievement';
import type { ScorePopupItem } from '@/components/common/ScorePopup';

export default function SpellingRush() {
  return (
    <ErrorBoundary type="game">
      <SpellingRushInner />
    </ErrorBoundary>
  );
}

function SpellingRushInner() {
  const { getSpellingWord } = useQuestionBank();
  const { startGame, finishGame, handleCorrect: engineCorrect, handleWrong: engineWrong } = useGameEngine();
  const { combo, maxCombo, onCorrect, onWrong } = useCombo();
  const { calcScore, calcTimeBonus, addScore } = useScoring({ gameType: 'spelling' });
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const score = useGameStore(s => s.activeGame?.score || 0);
  const correctCount = useGameStore(s => s.activeGame?.correctCount || 0);
  const totalCount = useGameStore(s => s.activeGame?.totalCount || 0);

  const [currentWord, setCurrentWord] = useState<{ word: string; chinese: string } | null>(null);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [levelChanged, setLevelChanged] = useState(false);
  const [newAchievements, setNewAchievements] = useState<AchievementDefinition[]>([]);
  const [shake, setShake] = useState(false);
  const [popups, setPopups] = useState<ScorePopupItem[]>([]);
  const [started, setStarted] = useState(false);

  const popupIdRef = useRef(0);

  const showPopup = (text: string, type: 'correct' | 'combo' | 'bonus') => {
    const id = String(++popupIdRef.current);
    setPopups(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 1500);
  };

  const { timeLeft, isRunning, start: startTimer, reset: resetTimer, deductTime } = useTimer({
    duration: GAME_CONFIGS.spelling.duration,
    autoStart: false,
    onEnd: handleGameEnd,
  });

  // 加载新单词
  const loadWord = useCallback(() => {
    const entry = getSpellingWord();
    if (!entry) return;
    setCurrentWord({ word: entry.word, chinese: entry.chinese });
    const letters = shuffleLetters(entry.word);
    setShuffledLetters(letters);
    setUserLetters([]);
  }, [getSpellingWord]);

  // 开始游戏
  const handleStart = () => {
    setStarted(true);
    startGame('spelling');
    loadWord();
    startTimer();
  };

  // 提交答案
  const handleSubmit = useCallback(() => {
    if (!currentWord || userLetters.length === 0) return;

    const userWord = userLetters.join('');
    const isCorrect = userWord.toLowerCase() === currentWord.word.toLowerCase();

    if (isCorrect) {
      const points = onCorrect();
      const timeBonus = calcTimeBonus(timeLeft);
      const totalPoints = points + timeBonus;

      const entry: AnswerLogEntry = {
        questionId: currentWord.word,
        correct: true,
        timeSpent: 0,
        userAnswer: userWord,
        correctAnswer: currentWord.word,
      };
      engineCorrect(entry, totalPoints);
      addScore(totalPoints);

      showPopup(`+${totalPoints}`, 'correct');
      if (combo >= 3) showPopup(`${combo}x Combo!`, 'combo');
      if (timeBonus > 0) showPopup(`时间+${timeBonus}`, 'bonus');

      loadWord();
    } else {
      onWrong();
      engineWrong({
        questionId: currentWord.word,
        correct: false,
        timeSpent: 0,
        userAnswer: userWord,
        correctAnswer: currentWord.word,
      });
      deductTime(SPELLING_PENALTY.wrong);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (soundEnabled) playErrorSound();

      // 重新打乱
      setUserLetters([]);
      setShuffledLetters(shuffleLetters(currentWord.word));
    }
  }, [currentWord, userLetters, combo, timeLeft, onCorrect, onWrong, loadWord]);

  // 跳过
  const handleSkip = () => {
    onWrong();
    engineWrong({
      questionId: currentWord?.word || '',
      correct: false,
      timeSpent: 0,
      userAnswer: '(跳过)',
      correctAnswer: currentWord?.word || '',
    });
    deductTime(SPELLING_PENALTY.skip);
    loadWord();
  };

  // 字母块操作
  const handleLetterClick = (letter: string, index: number) => {
    setUserLetters(prev => [...prev, letter]);
    setShuffledLetters(prev => prev.filter((_, i) => i !== index));
  };

  const handleLetterRemove = (index: number) => {
    const letter = userLetters[index];
    setShuffledLetters(prev => [...prev, letter]);
    setUserLetters(prev => prev.filter((_, i) => i !== index));
  };

  // 键盘快捷键
  useKeyboard({
    bindings: [
      { key: 'Enter', handler: handleSubmit, enabled: started && !gameOver },
      { key: 'Escape', handler: handleSkip, enabled: started && !gameOver },
    ],
    enabled: started && !gameOver,
  });

  async function handleGameEnd() {
    setGameOver(true);
    const res = await finishGame();
    if (res) {
      setResult(res.result);
      setLevelChanged(res.levelChanged);
      setNewAchievements(res.newAchievements);
    }
  }

  // 未开始
  if (!started) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-6">🧩</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">拼词大作战</h1>
        <p className="text-gray-500 mb-4">60秒内用乱序字母拼出正确单词</p>
        <div className="bg-blue-50 rounded-xl p-4 mb-8 text-left text-sm text-gray-600">
          <p>🎯 正确拼写得分，连击加成</p>
          <p>⏱️ 答错扣3秒，跳过扣5秒</p>
          <p>⌨️ Enter提交，Esc跳过</p>
        </div>
        <button onClick={handleStart} className="btn-primary text-lg px-8">
          开始游戏
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <GameHeader
        score={score}
        combo={combo}
        timeLeft={timeLeft}
        maxCombo={maxCombo}
      />

      {/* 提示 */}
      {currentWord && (
        <motion.div
          key={currentWord.word}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <p className="text-sm text-gray-400 mb-1">中文释义</p>
          <p className="text-xl font-bold text-gray-600">{currentWord.chinese}</p>
        </motion.div>
      )}

      {/* 用户拼写区 */}
      <motion.div
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-primary-300 min-h-[60px] p-4 mb-6 flex items-center justify-center flex-wrap gap-2"
      >
        {userLetters.length === 0 && (
          <span className="text-gray-300 text-sm">点击下方字母拼写...</span>
        )}
        {userLetters.map((letter, idx) => (
          <motion.button
            key={`user-${idx}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleLetterRemove(idx)}
            className="w-11 h-11 bg-primary-500 text-white rounded-xl font-bold text-lg shadow-sm hover:bg-primary-600"
          >
            {letter}
          </motion.button>
        ))}
      </motion.div>

      {/* 乱序字母区 */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {shuffledLetters.map((letter, idx) => (
          <motion.button
            key={`pool-${idx}`}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleLetterClick(letter, idx)}
            className="w-12 h-12 bg-white border-2 border-gray-200 rounded-xl font-bold text-lg text-gray-700 shadow-sm hover:border-primary-400 hover:shadow-md transition-all"
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 justify-center">
        <button onClick={handleSubmit} className="btn-primary">
          提交 (Enter)
        </button>
        <button onClick={handleSkip} className="btn-secondary">
          跳过 (Esc)
        </button>
      </div>

      {/* 飘字 */}
      <ScorePopup popups={popups} />

      {/* 结算 */}
      {result && (
        <ResultPanel
          open={gameOver}
          result={result}
          levelChanged={levelChanged}
          newAchievements={newAchievements}
          onClose={() => {
            setGameOver(false);
            setStarted(false);
            setResult(null);
          }}
        />
      )}
    </div>
  );
}
