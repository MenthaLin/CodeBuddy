/**
 * hooks/useScoring.ts - 自适应难度计分引擎 Hook
 * English Fun Zone
 */
import { useCallback } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { calculateScore, calculateTimeBonus, calculateSpeedBonus } from '@/lib/scoring-engine';
import type { GameType } from '@/types/game';

interface UseScoringOptions {
  gameType: GameType;
}

interface UseScoringReturn {
  /** 计算标准得分 */
  calcScore: () => number;
  /** 计算时间奖励 */
  calcTimeBonus: (remainingSeconds: number) => number;
  /** 计算速度奖励 */
  calcSpeedBonus: (answerTime: number, timeLimit?: number) => number;
  /** 添加得分 */
  addScore: (points: number) => void;
}

export function useScoring({ gameType }: UseScoringOptions): UseScoringReturn {
  const calcScore = useCallback(() => {
    const combo = useGameStore.getState().getCombo();
    return calculateScore(combo);
  }, []);

  const calcTimeBonus = useCallback((remainingSeconds: number) => {
    if (gameType === 'spelling') {
      return calculateTimeBonus(remainingSeconds);
    }
    return 0;
  }, [gameType]);

  const calcSpeedBonus = useCallback((answerTime: number, timeLimit: number = 10) => {
    if (gameType === 'listen') {
      return calculateSpeedBonus(answerTime, timeLimit);
    }
    return 0;
  }, [gameType]);

  const addScore = useCallback((points: number) => {
    useGameStore.getState().addScore(points);
  }, []);

  return { calcScore, calcTimeBonus, calcSpeedBonus, addScore };
}
