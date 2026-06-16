/**
 * lib/scoring-engine.ts - 连击计分系统
 * English Fun Zone
 */
import { COMBO_THRESHOLDS, BASE_SCORE } from '@/config/constants';

/**
 * 根据当前连击数获取分数倍率
 * @param combo 当前连击数
 * @returns 倍率
 */
export function getComboMultiplier(combo: number): number {
  let multiplier = 1.0;
  for (const threshold of COMBO_THRESHOLDS) {
    if (combo >= threshold.minCombo) {
      multiplier = threshold.multiplier;
    }
  }
  return multiplier;
}

/**
 * 计算单次答题得分
 * @param combo 当前连击数
 * @param baseScore 基础分（可选，默认10）
 * @returns 实际得分
 */
export function calculateScore(combo: number, baseScore: number = BASE_SCORE): number {
  const multiplier = getComboMultiplier(combo);
  return Math.round(baseScore * multiplier);
}

/**
 * 计算拼词大作战时间奖励
 * @param remainingSeconds 剩余秒数
 * @returns 奖励分数
 */
export function calculateTimeBonus(remainingSeconds: number): number {
  return Math.max(0, Math.round(remainingSeconds * 2));
}

/**
 * 计算听音选词速度奖励
 * @param answerTime 答题用时（秒）
 * @param timeLimit 每题限时（秒）
 * @returns 奖励分数
 */
export function calculateSpeedBonus(answerTime: number, timeLimit: number = 10): number {
  if (answerTime < 0) return 0;
  return Math.max(0, Math.round((timeLimit - answerTime) * 1));
}

/**
 * 获取连击显示等级
 * @param combo 当前连击数
 * @returns 连击等级文字
 */
export function getComboLevel(combo: number): string {
  if (combo >= 20) return 'PERFECT!';
  if (combo >= 15) return 'AMAZING!';
  if (combo >= 10) return 'GREAT!';
  if (combo >= 6) return 'NICE!';
  if (combo >= 3) return 'GOOD!';
  return '';
}

/**
 * 获取连击等级颜色
 */
export function getComboColor(combo: number): string {
  if (combo >= 20) return 'text-amber-500';
  if (combo >= 15) return 'text-purple-500';
  if (combo >= 10) return 'text-red-500';
  if (combo >= 6) return 'text-orange-500';
  if (combo >= 3) return 'text-yellow-500';
  return 'text-gray-400';
}
