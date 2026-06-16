/**
 * components/game/ResultPanel.tsx - 结算面板
 * English Fun Zone
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Modal from '@/components/common/Modal';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import ProgressBar from '@/components/common/ProgressBar';
import LevelChangeAnimation from './LevelChangeAnimation';
import { GAME_NAMES, GAME_ICONS } from '@/config/constants';
import { formatTime, formatPercent } from '@/lib/utils';
import type { GameResult, AchievementDefinition } from '@/types';

interface Props {
  open: boolean;
  result: GameResult;
  levelChanged: boolean;
  newAchievements: AchievementDefinition[];
  onClose: () => void;
}

export default function ResultPanel({
  open,
  result,
  levelChanged,
  newAchievements,
  onClose,
}: Props) {
  const navigate = useNavigate();

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-lg" showClose={false}>
      <div className="text-center">
        {/* 标题 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-4xl mb-2"
        >
          {result.accuracy >= 0.8 ? '🎉' : result.accuracy >= 0.5 ? '👍' : '💪'}
        </motion.div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {GAME_ICONS[result.gameType]} {GAME_NAMES[result.gameType]}
        </h2>
        <p className="text-sm text-gray-500 mb-6">游戏结束</p>

        {/* 等级变化 */}
        {levelChanged && result.newLevel && (
          <LevelChangeAnimation
            oldLevel={result.difficulty}
            newLevel={result.newLevel}
            direction={result.accuracy >= 0.8 ? 'up' : 'down'}
          />
        )}

        {/* 核心数据 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-blue-600">{result.score}</div>
            <div className="text-xs text-blue-400">得分</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-amber-600">{result.maxCombo}</div>
            <div className="text-xs text-amber-400">最大连击</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-green-600">{formatPercent(result.accuracy)}</div>
            <div className="text-xs text-green-400">正确率</div>
          </div>
        </div>

        {/* 详情 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">正确/总数</span>
            <span className="font-medium">{result.correctCount} / {result.totalCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">用时</span>
            <span className="font-medium">{formatTime(result.duration)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">难度</span>
            <DifficultyBadge level={result.difficulty} size="sm" />
          </div>
        </div>

        {/* 新成就 */}
        {newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <h3 className="text-sm font-semibold text-gray-600 mb-2">🎊 新成就解锁！</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {newAchievements.map(a => (
                <div
                  key={a.key}
                  className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5"
                >
                  <span>{a.icon}</span>
                  <span className="text-sm font-medium text-amber-700">{a.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-primary"
          >
            再来一局
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 btn-secondary"
          >
            返回大厅
          </button>
        </div>
      </div>
    </Modal>
  );
}
