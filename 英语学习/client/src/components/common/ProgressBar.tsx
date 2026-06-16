/**
 * components/common/ProgressBar.tsx - 进度条
 * English Fun Zone
 */
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  value: number;
  max: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export default function ProgressBar({
  value,
  max,
  label,
  showPercent = true,
  color = 'bg-primary-500',
  height = 'md',
  animated = true,
}: Props) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-gray-500">{label}</span>}
          {showPercent && <span className="text-xs text-gray-400">{percent}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[height]}`}>
        <motion.div
          className={`${color} ${heights[height]} rounded-full`}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
