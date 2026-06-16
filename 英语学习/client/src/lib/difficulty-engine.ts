/**
 * lib/difficulty-engine.ts - 自适应难度核心算法
 * English Fun Zone
 */
import type { Level } from '@/types/game';
import { LEVEL_ORDER, ACCURACY_THRESHOLDS } from '@/config/constants';

/**
 * 计算新等级
 * @param currentLevel 当前等级
 * @param accuracy 正确率 (0-1)
 * @param gamesInCurrentLevel 当前等级已完成局数（防抖动）
 * @returns 新等级及变化信息
 */
export function calculateNewLevel(
  currentLevel: Level,
  accuracy: number,
  gamesInCurrentLevel: number = 1,
): { newLevel: Level; changed: boolean; direction: 'up' | 'down' | 'none' } {
  const currentIndex = LEVEL_ORDER.indexOf(currentLevel);

  // 升级判断：正确率 ≥ 80%
  if (accuracy >= ACCURACY_THRESHOLDS.LEVEL_UP && currentIndex < LEVEL_ORDER.length - 1) {
    // 需要连续2局 ≥80% 才升级（防抖动），或单局 ≥90% 快速升级
    if (gamesInCurrentLevel >= ACCURACY_THRESHOLDS.LEVEL_UP_GAMES_NEEDED
        || accuracy >= ACCURACY_THRESHOLDS.LEVEL_UP_FAST) {
      return {
        newLevel: LEVEL_ORDER[currentIndex + 1],
        changed: true,
        direction: 'up',
      };
    }
  }

  // 降级判断：正确率 ≤ 40%
  if (accuracy <= ACCURACY_THRESHOLDS.LEVEL_DOWN && currentIndex > 0) {
    return {
      newLevel: LEVEL_ORDER[currentIndex - 1],
      changed: true,
      direction: 'down',
    };
  }

  return { newLevel: currentLevel, changed: false, direction: 'none' };
}

/**
 * 定级测试分数 → 等级映射
 * @param scores 各维度得分
 * @returns 建议等级
 */
export function placementScoreToLevel(scores: {
  vocab: number;
  grammar: number;
  listen: number;
}): Level {
  const total = scores.vocab + scores.grammar + scores.listen;
  const maxPerSection = 100;
  const maxTotal = maxPerSection * 3;
  const percentage = total / maxTotal;

  if (percentage >= 0.90) return 'C2';
  if (percentage >= 0.80) return 'C1';
  if (percentage >= 0.65) return 'B2';
  if (percentage >= 0.50) return 'B1';
  if (percentage >= 0.30) return 'A2';
  return 'A1';
}

/**
 * 获取等级索引
 */
export function getLevelIndex(level: Level): number {
  return LEVEL_ORDER.indexOf(level);
}

/**
 * 比较两个等级高低
 * @returns 正数表示 a > b，负数表示 a < b
 */
export function compareLevel(a: Level, b: Level): number {
  return getLevelIndex(a) - getLevelIndex(b);
}

/**
 * 取两个等级中较高的
 */
export function maxLevel(a: Level, b: Level): Level {
  return compareLevel(a, b) >= 0 ? a : b;
}
