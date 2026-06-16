/**
 * components/common/ScorePopup.tsx - 得分飘字动画
 * English Fun Zone
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ScorePopupItem {
  id: string;
  text: string;
  type: 'correct' | 'combo' | 'bonus';
}

interface Props {
  popups: ScorePopupItem[];
}

const typeColors = {
  correct: 'text-green-500',
  combo: 'text-amber-500',
  bonus: 'text-purple-500',
};

const typeIcons = {
  correct: '✅',
  combo: '🔥',
  bonus: '⭐',
};

export default function ScorePopup({ popups }: Props) {
  return (
    <div className="fixed top-20 right-8 z-50 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {popups.map(popup => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, x: 50, scale: 0.5 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-gray-100 ${typeColors[popup.type]}`}
          >
            <span className="text-sm">{typeIcons[popup.type]}</span>
            <span className="font-bold text-sm">{popup.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
