/**
 * components/common/ComboIndicator.tsx - 连击指示器
 * English Fun Zone
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getComboLevel, getComboColor } from '@/lib/scoring-engine';

interface Props {
  combo: number;
  className?: string;
}

export default function ComboIndicator({ combo, className = '' }: Props) {
  const level = getComboLevel(combo);
  const colorClass = getComboColor(combo);

  if (combo < 2) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={combo}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          className={`flex items-center gap-1 ${colorClass}`}
        >
          <span className="text-lg">🔥</span>
          <span className="font-bold text-lg">{combo}x</span>
          {level && (
            <motion.span
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-xs font-semibold uppercase tracking-wider"
            >
              {level}
            </motion.span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
