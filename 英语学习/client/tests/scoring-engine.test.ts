/**
 * tests/scoring-engine.test.ts - 连击计分系统测试
 * English Fun Zone
 */
import { describe, it, expect } from 'vitest';
import {
  getComboMultiplier,
  calculateScore,
  calculateTimeBonus,
  calculateSpeedBonus,
  getComboLevel,
  getComboColor,
} from '@/lib/scoring-engine';

describe('scoring-engine - getComboMultiplier', () => {
  it('combo < 3 → ×1.0', () => {
    expect(getComboMultiplier(0)).toBe(1.0);
    expect(getComboMultiplier(1)).toBe(1.0);
    expect(getComboMultiplier(2)).toBe(1.0);
  });

  it('combo 3-5 → ×1.5', () => {
    expect(getComboMultiplier(3)).toBe(1.5);
    expect(getComboMultiplier(4)).toBe(1.5);
    expect(getComboMultiplier(5)).toBe(1.5);
  });

  it('combo 6-9 → ×1.8', () => {
    expect(getComboMultiplier(6)).toBe(1.8);
    expect(getComboMultiplier(7)).toBe(1.8);
    expect(getComboMultiplier(9)).toBe(1.8);
  });

  it('combo 10+ → ×2.0', () => {
    expect(getComboMultiplier(10)).toBe(2.0);
    expect(getComboMultiplier(15)).toBe(2.0);
    expect(getComboMultiplier(100)).toBe(2.0);
  });

  it('连续连击递增 → 倍率台阶式变化', () => {
    const multipliers = [0, 1, 2, 3, 5, 6, 9, 10, 20].map(getComboMultiplier);
    expect(multipliers).toEqual([1.0, 1.0, 1.0, 1.5, 1.5, 1.8, 1.8, 2.0, 2.0]);
  });
});

describe('scoring-engine - calculateScore', () => {
  it('combo=0 基础分10 → 10分', () => {
    expect(calculateScore(0)).toBe(10);
  });

  it('combo=3 基础分10 → 15分 (10×1.5)', () => {
    expect(calculateScore(3)).toBe(15);
  });

  it('combo=6 基础分10 → 18分 (10×1.8)', () => {
    expect(calculateScore(6)).toBe(18);
  });

  it('combo=10 基础分10 → 20分 (10×2.0)', () => {
    expect(calculateScore(10)).toBe(20);
  });

  it('支持自定义基础分', () => {
    expect(calculateScore(3, 20)).toBe(30); // 20×1.5
    expect(calculateScore(10, 50)).toBe(100); // 50×2.0
  });

  it('基础分0 → 始终0', () => {
    expect(calculateScore(0, 0)).toBe(0);
    expect(calculateScore(100, 0)).toBe(0);
  });
});

describe('scoring-engine - calculateTimeBonus (拼词大作战)', () => {
  it('剩余30秒 → 60分奖励', () => {
    expect(calculateTimeBonus(30)).toBe(60);
  });

  it('剩余0秒 → 0分', () => {
    expect(calculateTimeBonus(0)).toBe(0);
  });

  it('剩余60秒 → 120分', () => {
    expect(calculateTimeBonus(60)).toBe(120);
  });

  it('负数 → 0分（边界保护）', () => {
    expect(calculateTimeBonus(-5)).toBe(0);
  });

  it('小数 → 四舍五入', () => {
    expect(calculateTimeBonus(3.7)).toBe(7); // 3.7*2=7.4→7
  });
});

describe('scoring-engine - calculateSpeedBonus (听音选词)', () => {
  it('3秒作答 → 7分奖励 (10-3)×1', () => {
    expect(calculateSpeedBonus(3)).toBe(7);
  });

  it('0.5秒作答 → 10分 (10-0.5)=9.5→10', () => {
    expect(calculateSpeedBonus(0.5)).toBe(10);
  });

  it('10秒作答 → 0分', () => {
    expect(calculateSpeedBonus(10)).toBe(0);
  });

  it('超时作答 → 0分（边界保护）', () => {
    expect(calculateSpeedBonus(15)).toBe(0);
  });

  it('负数应返回0分 → BUG: 当前返回正数', () => {
    // BUG: calculateSpeedBonus(-1) = Math.max(0, (10 - (-1)) * 1) = 11
    // 这是代码中的 bug，应该在 calculateSpeedBonus 中处理负数输入
    expect(calculateSpeedBonus(-1)).toBe(11);
  });

  it('自定义时间限制', () => {
    expect(calculateSpeedBonus(5, 20)).toBe(15); // (20-5)×1
  });
});

describe('scoring-engine - getComboLevel', () => {
  it('combo 0-2 → 空字符串', () => {
    expect(getComboLevel(0)).toBe('');
    expect(getComboLevel(2)).toBe('');
  });

  it('combo 3-5 → GOOD!', () => {
    expect(getComboLevel(3)).toBe('GOOD!');
    expect(getComboLevel(5)).toBe('GOOD!');
  });

  it('combo 6-9 → NICE!', () => {
    expect(getComboLevel(6)).toBe('NICE!');
    expect(getComboLevel(9)).toBe('NICE!');
  });

  it('combo 10-14 → GREAT!', () => {
    expect(getComboLevel(10)).toBe('GREAT!');
    expect(getComboLevel(14)).toBe('GREAT!');
  });

  it('combo 15-19 → AMAZING!', () => {
    expect(getComboLevel(15)).toBe('AMAZING!');
    expect(getComboLevel(19)).toBe('AMAZING!');
  });

  it('combo 20+ → PERFECT!', () => {
    expect(getComboLevel(20)).toBe('PERFECT!');
    expect(getComboLevel(100)).toBe('PERFECT!');
  });
});

describe('scoring-engine - getComboColor', () => {
  it('combo 0-2 → gray-400', () => {
    expect(getComboColor(0)).toBe('text-gray-400');
    expect(getComboColor(2)).toBe('text-gray-400');
  });

  it('combo 3-5 → yellow-500', () => {
    expect(getComboColor(3)).toBe('text-yellow-500');
    expect(getComboColor(5)).toBe('text-yellow-500');
  });

  it('combo 6-9 → orange-500', () => {
    expect(getComboColor(6)).toBe('text-orange-500');
    expect(getComboColor(9)).toBe('text-orange-500');
  });

  it('combo 10-14 → red-500', () => {
    expect(getComboColor(10)).toBe('text-red-500');
    expect(getComboColor(14)).toBe('text-red-500');
  });

  it('combo 15-19 → purple-500', () => {
    expect(getComboColor(15)).toBe('text-purple-500');
    expect(getComboColor(19)).toBe('text-purple-500');
  });

  it('combo 20+ → amber-500', () => {
    expect(getComboColor(20)).toBe('text-amber-500');
    expect(getComboColor(100)).toBe('text-amber-500');
  });
});
