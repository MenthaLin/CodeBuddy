/**
 * components/common/DifficultyBadge.tsx - 难度等级徽章
 * English Fun Zone
 */
import React from 'react';
import { LEVEL_NAMES, LEVEL_COLORS } from '@/config/constants';
import type { Level } from '@/types/game';

interface Props {
  level: Level;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export default function DifficultyBadge({ level, size = 'md', showLabel = true }: Props) {
  const colorClass = LEVEL_COLORS[level] || 'bg-gray-500';

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClasses[size]} ${colorClass} text-white rounded-full font-bold shadow-sm`}
      title={`${level} - ${LEVEL_NAMES[level] || ''}`}
    >
      {level}
      {showLabel && size !== 'sm' && (
        <span className="opacity-80 font-normal text-xs">
          {LEVEL_NAMES[level]}
        </span>
      )}
    </span>
  );
}
