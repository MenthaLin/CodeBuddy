/**
 * components/game/LevelChangeAnimation.tsx - 等级升降动画
 * English Fun Zone
 */
import React from 'react';
import { motion } from 'framer-motion';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import type { Level } from '@/types/game';

interface Props {
  oldLevel: Level;
  newLevel: Level;
  direction: 'up' | 'down';
}

export default function LevelChangeAnimation({ oldLevel, newLevel, direction }: Props) {
  const isUp = direction === 'up';

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className={`mb-6 p-4 rounded-2xl ${
        isUp ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
             : 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
      }`}
    >
      <div className="flex items-center justify-center gap-4">
        <DifficultyBadge level={oldLevel} size="md" />
        <div className="flex flex-col items-center">
          <motion.span
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className={`text-2xl ${isUp ? 'text-green-500' : 'text-orange-500'}`}
          >
            {isUp ? '⬆️' : '⬇️'}
          </motion.span>
          <span className={`text-xs font-bold ${isUp ? 'text-green-600' : 'text-orange-600'}`}>
            {isUp ? '升级' : '降级'}
          </span>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <DifficultyBadge level={newLevel} size="md" />
        </motion.div>
      </div>
    </motion.div>
  );
}
