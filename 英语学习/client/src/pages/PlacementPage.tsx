/**
 * pages/PlacementPage.tsx - 定级测试 [P0]
 * English Fun Zone
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { useSpeech } from '@/hooks/useSpeech';
import { placementScoreToLevel } from '@/lib/difficulty-engine';
import { savePlacementResult } from '@/lib/storage-adapter';
import { addGuestGameRecord, saveGuestData } from '@/lib/storage-adapter';
import ProgressBar from '@/components/common/ProgressBar';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import { PLACEMENT_QUESTION_COUNT } from '@/config/constants';
import placementQuestions from '@/data/placement-questions.json';
import type { PlacementQuestion, Level } from '@/types/game';

export default function PlacementPage() {
  const navigate = useNavigate();
  const { user, isGuest, profile } = useAuthStore();
  const { setPlacementDone } = useProfileStore();
  const { speakWord } = useSpeech();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [started, setStarted] = useState(false);

  const questions = placementQuestions as PlacementQuestion[];
  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + (showResult ? 1 : 0)) / PLACEMENT_QUESTION_COUNT;

  // 开始测试
  const handleStart = () => setStarted(true);

  // 选择答案
  const handleSelect = useCallback(async (optionIndex: number) => {
    if (selectedOption !== null) return; // 已选择，等待过渡

    setSelectedOption(optionIndex);
    const correct = optionIndex === currentQuestion.correctIndex;
    setIsCorrect(correct);

    // 如果是听力题，自动播放
    if (currentQuestion.type === 'listen') {
      const word = currentQuestion.question.match(/\(([^)]+)\)/)?.[1];
      if (word) {
        try { await speakWord(word); } catch { /* ignore */ }
      }
    }

    // 延迟进入下一题
    await new Promise(r => setTimeout(r, 800));

    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentIndex < PLACEMENT_QUESTION_COUNT - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      // 完成所有题目
      setShowResult(true);
      calculateResult(newAnswers);
    }
  }, [currentIndex, selectedOption, answers, currentQuestion]);

  // 计算定级结果
  const calculateResult = async (finalAnswers: number[]) => {
    const vocabScore = questions
      .filter((q, i) => q.type === 'vocab' && finalAnswers[i] === q.correctIndex)
      .length / questions.filter(q => q.type === 'vocab').length * 100;
    const grammarScore = questions
      .filter((q, i) => q.type === 'grammar' && finalAnswers[i] === q.correctIndex)
      .length / questions.filter(q => q.type === 'grammar').length * 100;
    const listenScore = questions
      .filter((q, i) => q.type === 'listen' && finalAnswers[i] === q.correctIndex)
      .length / questions.filter(q => q.type === 'listen').length * 100;

    const resultLevel = placementScoreToLevel({
      vocab: Math.round(vocabScore),
      grammar: Math.round(grammarScore),
      listen: Math.round(listenScore),
    });

    // 保存结果
    await setPlacementDone(resultLevel);

    // 如果是登录用户，保存到 Supabase
    if (!isGuest && user) {
      await savePlacementResult(
        user.id,
        resultLevel,
        Math.round(vocabScore),
        Math.round(grammarScore),
        Math.round(listenScore),
        Math.round((vocabScore + grammarScore + listenScore) / 3),
      );
    }
  };

  // 已定级 → 返回首页
  if (profile?.isPlacementDone && !showResult) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">已完成定级</h2>
        <p className="text-gray-500 mb-6">你的当前等级</p>
        <DifficultyBadge level={profile.level} size="lg" />
        <div className="mt-6">
          <button onClick={() => navigate('/')} className="btn-primary">
            开始游戏
          </button>
        </div>
      </div>
    );
  }

  // 开始界面
  if (!started) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">
          📋
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">英语水平定级测试</h1>
        <p className="text-gray-500 mb-4">
          共 {PLACEMENT_QUESTION_COUNT} 道题目，覆盖词汇、语法和听力
        </p>
        <div className="bg-blue-50 rounded-xl p-4 mb-8 text-left">
          <ul className="text-sm text-gray-600 space-y-2">
            <li>📝 词汇题：选择正确的含义或拼写</li>
            <li>📖 语法题：选择正确的语法形式</li>
            <li>🎧 听力题：听发音选择正确单词</li>
          </ul>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={handleStart} className="btn-primary text-lg px-8">
            开始测试
          </button>
          <button
            onClick={async () => {
              await setPlacementDone('A2');
              navigate('/');
            }}
            className="btn-secondary"
          >
            跳过（默认A2）
          </button>
        </div>
      </div>
    );
  }

  // 结果界面
  if (showResult) {
    const correctCount = questions.filter((q, i) => answers[i] === q.correctIndex).length;
    const accuracy = correctCount / PLACEMENT_QUESTION_COUNT;

    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
          {accuracy >= 0.8 ? '🎉' : accuracy >= 0.5 ? '👍' : '📚'}
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">定级结果</h1>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">你的英语等级</p>
            <DifficultyBadge level={profile?.level || 'A2'} size="lg" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="text-lg font-bold text-blue-600">
                {Math.round(questions.filter((q, i) => q.type === 'vocab' && answers[i] === q.correctIndex).length / questions.filter(q => q.type === 'vocab').length * 100)}%
              </div>
              <div className="text-xs text-blue-400">词汇</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <div className="text-lg font-bold text-purple-600">
                {Math.round(questions.filter((q, i) => q.type === 'grammar' && answers[i] === q.correctIndex).length / questions.filter(q => q.type === 'grammar').length * 100)}%
              </div>
              <div className="text-xs text-purple-400">语法</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <div className="text-lg font-bold text-green-600">
                {Math.round(questions.filter((q, i) => q.type === 'listen' && answers[i] === q.correctIndex).length / questions.filter(q => q.type === 'listen').length * 100)}%
              </div>
              <div className="text-xs text-green-400">听力</div>
            </div>
          </div>
        </div>

        <button onClick={() => navigate('/')} className="btn-primary text-lg px-8">
          开始游戏
        </button>
      </div>
    );
  }

  // 答题界面
  return (
    <div className="max-w-2xl mx-auto">
      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>题目 {currentIndex + 1}/{PLACEMENT_QUESTION_COUNT}</span>
          <span>
            {currentQuestion.type === 'vocab' ? '📝 词汇' : currentQuestion.type === 'grammar' ? '📖 语法' : '🎧 听力'}
          </span>
        </div>
        <ProgressBar value={currentIndex} max={PLACEMENT_QUESTION_COUNT} showPercent={false} />
      </div>

      {/* 题目 */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        className="bg-white rounded-2xl shadow-md p-6"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          {currentQuestion.question}
        </h2>

        {/* 听力题播放按钮 */}
        {currentQuestion.type === 'listen' && (
          <div className="mb-4 text-center">
            <button
              onClick={() => {
                const word = currentQuestion.question.match(/\(([^)]+)\)/)?.[1];
                if (word) speakWord(word);
              }}
              className="btn-accent text-lg px-8"
            >
              🔊 播放发音
            </button>
          </div>
        )}

        {/* 选项 */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let buttonStyle = 'border-gray-200 hover:border-primary-400 hover:bg-primary-50';
            if (selectedOption === idx) {
              buttonStyle = isCorrect
                ? 'border-green-400 bg-green-50 text-green-700'
                : 'border-red-400 bg-red-50 text-red-700';
            } else if (selectedOption !== null && idx === currentQuestion.correctIndex) {
              buttonStyle = 'border-green-400 bg-green-50 text-green-700';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selectedOption !== null}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all duration-200 ${buttonStyle} ${
                  selectedOption !== null ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm font-bold mr-3">
                  {String.fromCharCode(65 + idx)}
                </span>
                {option}
                {selectedOption === idx && (
                  <span className="float-right">{isCorrect ? '✅' : '❌'}</span>
                )}
                {selectedOption !== null && selectedOption !== idx && idx === currentQuestion.correctIndex && (
                  <span className="float-right">✅</span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
