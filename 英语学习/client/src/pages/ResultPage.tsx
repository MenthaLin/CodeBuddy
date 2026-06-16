/**
 * pages/ResultPage.tsx - 游戏结算页 [P0]
 * English Fun Zone
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import ProgressBar from '@/components/common/ProgressBar';
import LevelChangeAnimation from '@/components/game/LevelChangeAnimation';
import { useProfileStore } from '@/stores/useProfileStore';
import { GAME_NAMES, GAME_ICONS } from '@/config/constants';
import { formatTime, formatPercent } from '@/lib/utils';

export default function ResultPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const lastGameResult = useProfileStore(s => s.lastGameResult);

  if (!lastGameResult) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">没有游戏记录</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          返回首页
        </button>
      </div>
    );
  }

  const result = lastGameResult;

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-5xl mb-4">
          {result.accuracy >= 0.8 ? '🎉' : result.accuracy >= 0.5 ? '👍' : '💪'}
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          {GAME_ICONS[result.gameType]} {GAME_NAMES[result.gameType]}
        </h1>
        <p className="text-gray-500 mb-6">游戏结算</p>
      </motion.div>

      {/* 等级变化 */}
      {result.levelChanged && result.newLevel && (
        <LevelChangeAnimation
          oldLevel={result.difficulty}
          newLevel={result.newLevel}
          direction={result.accuracy >= 0.8 ? 'up' : 'down'}
        />
      )}

      {/* 得分卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-3xl font-bold text-blue-600">{result.score}</div>
          <div className="text-xs text-blue-400 mt-1">得分</div>
        </div>
        <div className="card text-center bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="text-3xl font-bold text-amber-600">{result.maxCombo}</div>
          <div className="text-xs text-amber-400 mt-1">最大连击</div>
        </div>
        <div className="card text-center bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-3xl font-bold text-green-600">{formatPercent(result.accuracy)}</div>
          <div className="text-xs text-green-400 mt-1">正确率</div>
        </div>
      </div>

      {/* 详情 */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">游戏详情</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">正确/总数</span>
            <span className="font-medium">{result.correctCount}/{result.totalCount}</span>
          </div>
          <ProgressBar value={result.correctCount} max={result.totalCount} label="正确率" color="bg-green-500" />
          <div className="flex justify-between">
            <span className="text-gray-500">用时</span>
            <span className="font-medium">{formatTime(result.duration)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">难度</span>
            <DifficultyBadge level={result.difficulty} size="sm" />
          </div>
        </div>
      </div>

      {/* 答题记录 */}
      {result.answerLog.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">答题记录</h3>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {result.answerLog.map((log, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  log.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                <span className="truncate flex-1">
                  {log.userAnswer || '(空)'}
                </span>
                <span>{log.correct ? '✅' : '❌'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="flex-1 btn-primary">
          再来一局
        </button>
        <button onClick={() => navigate('/')} className="flex-1 btn-secondary">
          返回大厅
        </button>
      </div>
    </div>
  );
}
