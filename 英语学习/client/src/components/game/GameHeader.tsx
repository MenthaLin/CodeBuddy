/**
 * components/game/GameHeader.tsx - 游戏顶部栏（分数/连击/计时）
 * English Fun Zone
 */
import React from 'react';
import { motion } from 'framer-motion';
import ComboIndicator from '@/components/common/ComboIndicator';
import { formatTime } from '@/lib/utils';

interface Props {
  score: number;
  combo: number;
  timeLeft: number;
  maxCombo?: number;
  questionIndex?: number;
  totalQuestions?: number;
}

export default function GameHeader({
  score,
  combo,
  timeLeft,
  maxCombo,
  questionIndex,
  totalQuestions,
}: Props) {
  const isLowTime = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 mb-4">
      {/* 分数 */}
      <div className="flex items-center gap-1">
        <span className="text-amber-500 text-lg">⭐</span>
        <motion.span
          key={score}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="font-bold text-lg text-gray-800"
        >
          {score}
        </motion.span>
      </div>

      {/* 连击 */}
      <ComboIndicator combo={combo} />

      {/* 进度（如果有） */}
      {questionIndex !== undefined && totalQuestions !== undefined && (
        <div className="text-sm text-gray-400">
          {questionIndex}/{totalQuestions}
        </div>
      )}

      {/* 倒计时 */}
      <motion.div
        animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
        className={`font-mono font-bold text-lg tabular-nums px-3 py-1 rounded-lg ${
          isCritical
            ? 'bg-red-100 text-red-600'
            : isLowTime
            ? 'bg-amber-100 text-amber-600'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        ⏱️ {formatTime(timeLeft)}
      </motion.div>
    </div>
  );
}
