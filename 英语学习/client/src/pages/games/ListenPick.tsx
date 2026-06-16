/**
 * pages/games/ListenPick.tsx - 听音选词 [P0]
 * English Fun Zone
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import GameHeader from '@/components/game/GameHeader';
import ResultPanel from '@/components/game/ResultPanel';
import ProgressBar from '@/components/common/ProgressBar';
import { useGameStore } from '@/stores/useGameStore';
import { useTimer } from '@/hooks/useTimer';
import { useCombo } from '@/hooks/useCombo';
import { useScoring } from '@/hooks/useScoring';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { useSpeech } from '@/hooks/useSpeech';
import { useGameEngine } from '@/hooks/useGameEngine';
import { playCorrectSound, playErrorSound } from '@/lib/audio-manager';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { GAME_CONFIGS, LISTEN_QUESTION_TIME, LISTEN_MAX_REPLAY } from '@/config/constants';
import type { GameResult } from '@/types/game';
import type { AchievementDefinition } from '@/types/achievement';

interface ListenQuestion {
  word: string;
  chinese: string;
  options: string[];
  correctIndex: number;
}

export default function ListenPick() {
  return (
    <ErrorBoundary type="game">
      <ListenPickInner />
    </ErrorBoundary>
  );
}

function ListenPickInner() {
  const { getListenQuestion } = useQuestionBank();
  const { startGame, finishGame, handleCorrect: engineCorrect, handleWrong: engineWrong } = useGameEngine();
  const { combo, maxCombo, onCorrect, onWrong } = useCombo();
  const { calcScore, calcSpeedBonus, addScore } = useScoring({ gameType: 'listen' });
  const { speakWord, supported, resetCount } = useSpeech();
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const score = useGameStore(s => s.activeGame?.score || 0);

  const [questions, setQuestions] = useState<ListenQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [levelChanged, setLevelChanged] = useState(false);
  const [newAchievements, setNewAchievements] = useState<AchievementDefinition[]>([]);
  const [started, setStarted] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const questionStartTime = useRef(0);

  const totalQuestions = GAME_CONFIGS.listen.questionsPerRound;
  const currentQuestion = questions[currentIndex];

  const { timeLeft, start: startQuestionTimer, reset: resetQuestionTimer } = useTimer({
    duration: LISTEN_QUESTION_TIME,
    autoStart: false,
    onEnd: () => handleTimeout(),
  });

  const handleStart = () => {
    setStarted(true);
    startGame('listen');

    // 生成所有题目
    const qs: ListenQuestion[] = [];
    for (let i = 0; i < totalQuestions; i++) {
      const question = getListenQuestion();
      if (question) {
        const correctIndex = question.options.indexOf(question.word.word);
        qs.push({
          word: question.word.word,
          chinese: question.word.chinese,
          options: question.options,
          correctIndex: correctIndex >= 0 ? correctIndex : 0,
        });
      }
    }
    setQuestions(qs);
    setCurrentIndex(0);

    // 播放第一题
    if (qs.length > 0) {
      setTimeout(() => {
        speakWord(qs[0].word);
        questionStartTime.current = Date.now();
        startQuestionTimer();
      }, 500);
    }
  };

  // 播放当前单词
  const handlePlay = () => {
    if (!currentQuestion || replayCount >= LISTEN_MAX_REPLAY) return;
    speakWord(currentQuestion.word);
    setReplayCount(r => r + 1);
  };

  // 选择选项
  const handleSelect = (optionIndex: number) => {
    if (answered || !currentQuestion) return;

    const timeSpent = (Date.now() - questionStartTime.current) / 1000;
    const correct = optionIndex === currentQuestion.correctIndex;

    setSelected(optionIndex);
    setIsCorrect(correct);
    setAnswered(true);

    if (correct) {
      const points = onCorrect();
      const speedBonus = calcSpeedBonus(timeSpent, LISTEN_QUESTION_TIME);
      const totalPoints = points + speedBonus;
      addScore(totalPoints);
      engineCorrect({
        questionId: `listen-${currentIndex}`,
        correct: true,
        timeSpent,
        userAnswer: currentQuestion.options[optionIndex],
        correctAnswer: currentQuestion.word,
      }, totalPoints);
      if (soundEnabled) playCorrectSound();
    } else {
      onWrong();
      engineWrong({
        questionId: `listen-${currentIndex}`,
        correct: false,
        timeSpent,
        userAnswer: currentQuestion.options[optionIndex],
        correctAnswer: currentQuestion.word,
      });
      if (soundEnabled) playErrorSound();
    }
  };

  // 超时
  const handleTimeout = () => {
    if (answered) return;
    onWrong();
    engineWrong({
      questionId: `listen-${currentIndex}`,
      correct: false,
      timeSpent: LISTEN_QUESTION_TIME,
      userAnswer: '(超时)',
      correctAnswer: currentQuestion?.word || '',
    });
    setAnswered(true);
    setIsCorrect(false);
  };

  // 下一题
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelected(null);
      setIsCorrect(null);
      setAnswered(false);
      setReplayCount(0);
      resetCount();

      // 播放下一题
      const nextQuestion = questions[nextIdx];
      if (nextQuestion) {
        setTimeout(() => {
          speakWord(nextQuestion.word);
          questionStartTime.current = Date.now();
          resetQuestionTimer(LISTEN_QUESTION_TIME);
        }, 300);
      }
    } else {
      handleGameEnd();
    }
  };

  async function handleGameEnd() {
    setGameOver(true);
    const res = await finishGame();
    if (res) {
      setResult(res.result);
      setLevelChanged(res.levelChanged);
      setNewAchievements(res.newAchievements);
    }
  }

  if (!started) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-6">🎧</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">听音选词</h1>
        <p className="text-gray-500 mb-4">听发音选择正确的单词，训练听力辨别能力</p>
        <div className="bg-rose-50 rounded-xl p-4 mb-8 text-left text-sm text-gray-600">
          <p>🔊 自动播放单词发音</p>
          <p>🎯 从4个选项中选出正确单词</p>
          <p>⚡ 答题越快加分越多</p>
          <p>🔄 每题可重播最多{LISTEN_MAX_REPLAY}次</p>
          <p>⏱️ 每题限时{LISTEN_QUESTION_TIME}秒</p>
        </div>
        {!supported && (
          <p className="text-amber-600 text-sm mb-4">
            ⚠️ 你的浏览器不支持语音合成，将使用降级方案
          </p>
        )}
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
        questionIndex={currentIndex + 1}
        totalQuestions={totalQuestions}
      />

      <ProgressBar value={currentIndex + (answered ? 1 : 0)} max={totalQuestions} label="进度" />

      {/* 播放区 */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-md p-8 my-6 text-center"
      >
        <button
          onClick={handlePlay}
          disabled={replayCount >= LISTEN_MAX_REPLAY || !supported}
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${
            replayCount >= LISTEN_MAX_REPLAY
              ? 'bg-gray-200 text-gray-400'
              : 'bg-primary-500 text-white hover:bg-primary-600 hover:scale-110 active:scale-95 shadow-lg'
          }`}
        >
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <p className="text-sm text-gray-400">
          已播放 {replayCount}/{LISTEN_MAX_REPLAY} 次
          {replayCount >= LISTEN_MAX_REPLAY && ' (已达上限)'}
        </p>
      </motion.div>

      {/* 选项 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {currentQuestion?.options.map((option, idx) => {
          let btnStyle = 'border-gray-200 hover:border-primary-400 hover:bg-primary-50';
          if (selected === idx) {
            btnStyle = isCorrect
              ? 'border-green-400 bg-green-50 text-green-700'
              : 'border-red-400 bg-red-50 text-red-700';
          } else if (answered && idx === currentQuestion.correctIndex) {
            btnStyle = 'border-green-400 bg-green-50 text-green-700';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`px-4 py-4 rounded-xl border-2 font-semibold text-lg transition-all ${btnStyle} ${
                answered ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              {option}
              {selected === idx && (
                <span className="ml-2">{isCorrect ? '✅' : '❌'}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 下一题 */}
      {answered && (
        <div className="text-center">
          <button onClick={handleNext} className="btn-primary">
            {currentIndex < totalQuestions - 1 ? '下一题 →' : '查看结果'}
          </button>
        </div>
      )}

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
