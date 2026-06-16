/**
 * pages/games/GrammarFix.tsx - 语法改错 [P0]
 * English Fun Zone
 */
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import GameHeader from '@/components/game/GameHeader';
import ResultPanel from '@/components/game/ResultPanel';
import Modal from '@/components/common/Modal';
import ProgressBar from '@/components/common/ProgressBar';
import { useGameStore } from '@/stores/useGameStore';
import { useCombo } from '@/hooks/useCombo';
import { useScoring } from '@/hooks/useScoring';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { useGameEngine } from '@/hooks/useGameEngine';
import { playCorrectSound, playErrorSound } from '@/lib/audio-manager';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { GAME_CONFIGS } from '@/config/constants';
import type { GameResult, GrammarQuestion } from '@/types/game';
import type { AchievementDefinition } from '@/types/achievement';

export default function GrammarFix() {
  return (
    <ErrorBoundary type="game">
      <GrammarFixInner />
    </ErrorBoundary>
  );
}

function GrammarFixInner() {
  const { getGrammarQuestions } = useQuestionBank();
  const { startGame, finishGame, handleCorrect: engineCorrect, handleWrong: engineWrong } = useGameEngine();
  const { combo, maxCombo, onCorrect, onWrong } = useCombo();
  const { calcScore, addScore } = useScoring({ gameType: 'grammar' });
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const score = useGameStore(s => s.activeGame?.score || 0);

  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedCorrect, setSelectedCorrect] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [levelChanged, setLevelChanged] = useState(false);
  const [newAchievements, setNewAchievements] = useState<AchievementDefinition[]>([]);
  const [started, setStarted] = useState(false);

  const totalQuestions = GAME_CONFIGS.grammar.questionsPerRound;
  const currentQuestion = questions[currentIndex];

  const handleStart = () => {
    setStarted(true);
    startGame('grammar');
    const qs = getGrammarQuestions(totalQuestions);
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswered(false);
  };

  // 点击错误处
  const handleErrorClick = () => {
    if (answered) return;
    setShowOptions(true);
  };

  // 选择修正选项
  const handleOptionSelect = (option: string) => {
    if (answered || !currentQuestion) return;

    const isCorrect = option === currentQuestion.correction;
    setSelectedCorrect(isCorrect);
    setAnswered(true);
    setShowOptions(false);

    if (isCorrect) {
      const points = onCorrect();
      addScore(points);
      engineCorrect({
        questionId: currentQuestion.id,
        correct: true,
        timeSpent: 0,
        userAnswer: option,
        correctAnswer: currentQuestion.correction,
      }, points);
      if (soundEnabled) playCorrectSound();
    } else {
      onWrong();
      engineWrong({
        questionId: currentQuestion.id,
        correct: false,
        timeSpent: 0,
        userAnswer: option,
        correctAnswer: currentQuestion.correction,
      });
      if (soundEnabled) playErrorSound();
    }
  };

  // 下一题
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(i => i + 1);
      setAnswered(false);
      setSelectedCorrect(null);
    } else {
      handleGameEnd();
    }
  };

  // 跳过
  const handleSkip = () => {
    if (answered) return;
    onWrong();
    engineWrong({
      questionId: currentQuestion?.id || '',
      correct: false,
      timeSpent: 0,
      userAnswer: '(跳过)',
      correctAnswer: currentQuestion?.correction || '',
    });
    handleNext();
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
        <div className="text-6xl mb-6">✏️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">语法改错</h1>
        <p className="text-gray-500 mb-4">找出句子中的语法错误并选择正确修正</p>
        <div className="bg-violet-50 rounded-xl p-4 mb-8 text-left text-sm text-gray-600">
          <p>🔍 点击句子中高亮的错误处</p>
          <p>📝 从4个选项中选出正确修正</p>
          <p>📊 共 {totalQuestions} 题，答对加分，可跳过</p>
        </div>
        <button onClick={handleStart} className="btn-primary text-lg px-8">
          开始游戏
        </button>
      </div>
    );
  }

  // 生成带错误高亮的句子显示
  const renderSentence = () => {
    if (!currentQuestion) return null;
    const { incorrectSentence, errorWord, errorIndex, errorLength } = currentQuestion;

    const before = incorrectSentence.slice(0, errorIndex);
    const error = incorrectSentence.slice(errorIndex, errorIndex + errorLength);
    const after = incorrectSentence.slice(errorIndex + errorLength);

    return (
      <div className="text-lg leading-relaxed text-gray-700">
        {before}
        <button
          onClick={handleErrorClick}
          className={`inline font-bold border-b-2 border-dashed px-1 rounded transition-colors ${
            answered
              ? selectedCorrect
                ? 'text-green-600 border-green-400 bg-green-50'
                : 'text-red-600 border-red-400 bg-red-50'
              : 'text-red-500 border-red-400 bg-red-50 hover:bg-red-100 cursor-pointer'
          }`}
          disabled={answered}
        >
          {error}
        </button>
        {after}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <GameHeader
        score={score}
        combo={combo}
        timeLeft={0}
        maxCombo={maxCombo}
        questionIndex={currentIndex + 1}
        totalQuestions={totalQuestions}
      />

      <ProgressBar value={currentIndex + (answered ? 1 : 0)} max={totalQuestions} label="进度" />

      {/* 句子显示 */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md p-6 my-6"
      >
        <div className="text-sm text-gray-400 mb-3">找出错误并点击修正：</div>
        {renderSentence()}

        {/* 正确答案显示 */}
        {answered && currentQuestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <p className="text-sm text-gray-500">正确句子：</p>
            <p className="text-green-700 font-medium">{currentQuestion.correctSentence}</p>
          </motion.div>
        )}
      </motion.div>

      {/* 操作按钮 */}
      <div className="flex gap-3 justify-center">
        {answered ? (
          <button onClick={handleNext} className="btn-primary">
            {currentIndex < totalQuestions - 1 ? '下一题 →' : '查看结果'}
          </button>
        ) : (
          <button onClick={handleSkip} className="btn-secondary">
            跳过此题
          </button>
        )}
      </div>

      {/* 修正选项弹窗 */}
      <Modal
        open={showOptions}
        onClose={() => setShowOptions(false)}
        title="选择正确修正"
        maxWidth="max-w-sm"
      >
        <div className="space-y-2">
          {currentQuestion && [currentQuestion.correction, ...currentQuestion.distractors]
            .sort(() => Math.random() - 0.5)
            .map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(option)}
                className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 font-medium transition-all"
              >
                {option}
              </button>
            ))}
        </div>
      </Modal>

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
