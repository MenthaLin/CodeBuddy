/**
 * components/common/GameCard.tsx - 游戏入口卡片
 * English Fun Zone
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAME_NAMES, GAME_ICONS, GAME_DESCRIPTIONS, GAME_THEME_COLORS } from '@/config/constants';
import type { GameType } from '@/types/game';

interface Props {
  gameType: GameType;
  bestScore?: number;
  totalPlayed?: number;
  delay?: number;
}

export default function GameCard({ gameType, bestScore, totalPlayed, delay = 0 }: Props) {
  const navigate = useNavigate();
  const name = GAME_NAMES[gameType] || gameType;
  const icon = GAME_ICONS[gameType] || '🎮';
  const description = GAME_DESCRIPTIONS[gameType] || '';
  const gradient = GAME_THEME_COLORS[gameType] || 'from-blue-500 to-cyan-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/game/${gameType}`)}
      className="cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      {/* 顶部渐变色条 */}
      <div className={`h-2 bg-gradient-to-r ${gradient}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <h3 className="text-lg font-bold text-gray-800">{name}</h3>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>

        {/* 统计数据 */}
        {(bestScore !== undefined || totalPlayed !== undefined) && (
          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            {totalPlayed !== undefined && (
              <div className="text-xs text-gray-400">
                <span className="font-medium text-gray-600">{totalPlayed}</span> 局
              </div>
            )}
            {bestScore !== undefined && bestScore > 0 && (
              <div className="text-xs text-gray-400">
                最高 <span className="font-medium text-amber-500">{bestScore}</span> 分
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
