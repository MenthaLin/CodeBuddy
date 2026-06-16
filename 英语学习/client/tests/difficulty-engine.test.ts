/**
 * tests/difficulty-engine.test.ts - 自适应难度引擎测试
 * English Fun Zone
 */
import { describe, it, expect } from 'vitest';
import {
  calculateNewLevel,
  placementScoreToLevel,
  getLevelIndex,
  compareLevel,
  maxLevel,
} from '@/lib/difficulty-engine';
import type { Level } from '@/types/game';

describe('difficulty-engine - calculateNewLevel', () => {
  // ===== 升级场景 =====
  describe('升级逻辑 (accuracy >= 80%)', () => {
    it('正确率 85% 且已在当前等级完成 2 局 → 升一级', () => {
      const result = calculateNewLevel('A2', 0.85, 2);
      expect(result.newLevel).toBe('B1');
      expect(result.changed).toBe(true);
      expect(result.direction).toBe('up');
    });

    it('正确率 80% 且已在当前等级完成 2 局 → 升一级', () => {
      const result = calculateNewLevel('B1', 0.80, 2);
      expect(result.newLevel).toBe('B2');
      expect(result.changed).toBe(true);
      expect(result.direction).toBe('up');
    });

    it('正确率 95% (>=90%) 仅需1局 → 快速升级', () => {
      const result = calculateNewLevel('A2', 0.95, 1);
      expect(result.newLevel).toBe('B1');
      expect(result.changed).toBe(true);
      expect(result.direction).toBe('up');
    });

    it('正确率 90% 仅需1局 → 快速升级', () => {
      const result = calculateNewLevel('B1', 0.90, 1);
      expect(result.newLevel).toBe('B2');
      expect(result.changed).toBe(true);
      expect(result.direction).toBe('up');
    });

    it('正确率 85% 但仅完成1局 → 不升级（防抖动）', () => {
      const result = calculateNewLevel('A2', 0.85, 1);
      expect(result.newLevel).toBe('A2');
      expect(result.changed).toBe(false);
      expect(result.direction).toBe('none');
    });

    it('正确率 100% → 升级', () => {
      const result = calculateNewLevel('B2', 1.0, 1);
      expect(result.newLevel).toBe('C1');
      expect(result.changed).toBe(true);
      expect(result.direction).toBe('up');
    });
  });

  // ===== 降级场景 =====
  describe('降级逻辑 (accuracy <= 40%)', () => {
    it('正确率 30% → 降一级', () => {
      const result = calculateNewLevel('B1', 0.30, 1);
      expect(result.newLevel).toBe('A2');
      expect(result.changed).toBe(true);
      expect(result.direction).toBe('down');
    });

    it('正确率 40% → 降一级', () => {
      const result = calculateNewLevel('B2', 0.40, 1);
      expect(result.newLevel).toBe('B1');
      expect(result.changed).toBe(true);
      expect(result.direction).toBe('down');
    });

    it('正确率 0% → 降一级', () => {
      const result = calculateNewLevel('C1', 0.0, 1);
      expect(result.newLevel).toBe('B2');
      expect(result.changed).toBe(true);
      expect(result.direction).toBe('down');
    });

    it('降级不受 gamesInCurrentLevel 防抖动限制', () => {
      const result = calculateNewLevel('B2', 0.35, 1);
      expect(result.newLevel).toBe('B1');
      expect(result.changed).toBe(true);
    });
  });

  // ===== 保持场景 =====
  describe('保持等级 (40% < accuracy < 80%)', () => {
    it('正确率 50% → 保持', () => {
      const result = calculateNewLevel('B1', 0.50, 1);
      expect(result.newLevel).toBe('B1');
      expect(result.changed).toBe(false);
      expect(result.direction).toBe('none');
    });

    it('正确率 60% → 保持', () => {
      const result = calculateNewLevel('B2', 0.60, 2);
      expect(result.newLevel).toBe('B2');
      expect(result.changed).toBe(false);
    });

    it('正确率 70% → 保持', () => {
      const result = calculateNewLevel('A2', 0.70, 3);
      expect(result.newLevel).toBe('A2');
      expect(result.changed).toBe(false);
    });

    it('正确率 79% → 保持（未到80%阈值）', () => {
      const result = calculateNewLevel('B1', 0.79, 2);
      expect(result.newLevel).toBe('B1');
      expect(result.changed).toBe(false);
    });
  });

  // ===== 边界测试 =====
  describe('边界测试', () => {
    it('A1 等级正确率 <= 40% → 不降级（已是最高低）', () => {
      const result = calculateNewLevel('A1', 0.20, 1);
      expect(result.newLevel).toBe('A1');
      expect(result.changed).toBe(false);
      expect(result.direction).toBe('none');
    });

    it('A1 等级正确率 0% → 不降级', () => {
      const result = calculateNewLevel('A1', 0.0, 1);
      expect(result.newLevel).toBe('A1');
      expect(result.changed).toBe(false);
    });

    it('C2 等级正确率 >= 80% → 不升级（已是最高级）', () => {
      const result = calculateNewLevel('C2', 0.90, 2);
      expect(result.newLevel).toBe('C2');
      expect(result.changed).toBe(false);
      expect(result.direction).toBe('none');
    });

    it('C2 等级正确率 100% → 不升级', () => {
      const result = calculateNewLevel('C2', 1.0, 1);
      expect(result.newLevel).toBe('C2');
      expect(result.changed).toBe(false);
    });

    it('gamesInCurrentLevel = 0 默认值不影响降级', () => {
      const result = calculateNewLevel('B1', 0.35);
      expect(result.newLevel).toBe('A2');
      expect(result.changed).toBe(true);
    });

    it('gamesInCurrentLevel = 0 默认值下正确率85%不升级', () => {
      const result = calculateNewLevel('B1', 0.85);
      expect(result.newLevel).toBe('B1');
      expect(result.changed).toBe(false);
    });
  });

  // ===== 等级顺序完整性 =====
  describe('等级顺序遍历', () => {
    it('从 A1 连续升级到 C2', () => {
      let level: Level = 'A1';
      const path: string[] = ['A1'];
      for (let i = 0; i < 5; i++) {
        const result = calculateNewLevel(level, 0.85, 2);
        level = result.newLevel;
        path.push(level);
      }
      expect(path).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
    });

    it('从 C2 连续降级到 A1', () => {
      let level: Level = 'C2';
      const path: string[] = ['C2'];
      for (let i = 0; i < 5; i++) {
        const result = calculateNewLevel(level, 0.35, 1);
        level = result.newLevel;
        path.push(level);
      }
      expect(path).toEqual(['C2', 'C1', 'B2', 'B1', 'A2', 'A1']);
    });
  });
});

describe('difficulty-engine - placementScoreToLevel', () => {
  it('总分 >= 270 (90%) → C2', () => {
    expect(placementScoreToLevel({ vocab: 90, grammar: 90, listen: 90 })).toBe('C2');
  });

  it('总分 >= 240 (80%) → C1', () => {
    expect(placementScoreToLevel({ vocab: 80, grammar: 80, listen: 80 })).toBe('C1');
    expect(placementScoreToLevel({ vocab: 100, grammar: 70, listen: 70 })).toBe('C1');
  });

  it('总分 >= 195 (65%) → B2', () => {
    expect(placementScoreToLevel({ vocab: 70, grammar: 65, listen: 60 })).toBe('B2');
  });

  it('总分 >= 150 (50%) → B1', () => {
    expect(placementScoreToLevel({ vocab: 50, grammar: 50, listen: 50 })).toBe('B1');
  });

  it('总分 >= 90 (30%) → A2', () => {
    expect(placementScoreToLevel({ vocab: 30, grammar: 30, listen: 30 })).toBe('A2');
  });

  it('总分 < 90 (30%) → A1', () => {
    expect(placementScoreToLevel({ vocab: 10, grammar: 10, listen: 10 })).toBe('A1');
    expect(placementScoreToLevel({ vocab: 0, grammar: 0, listen: 0 })).toBe('A1');
  });
});

describe('difficulty-engine - getLevelIndex', () => {
  it('返回正确的索引', () => {
    expect(getLevelIndex('A1')).toBe(0);
    expect(getLevelIndex('A2')).toBe(1);
    expect(getLevelIndex('B1')).toBe(2);
    expect(getLevelIndex('B2')).toBe(3);
    expect(getLevelIndex('C1')).toBe(4);
    expect(getLevelIndex('C2')).toBe(5);
  });
});

describe('difficulty-engine - compareLevel', () => {
  it('A2 > A1 → 正数', () => {
    expect(compareLevel('A2', 'A1')).toBe(1);
  });

  it('A1 < A2 → 负数', () => {
    expect(compareLevel('A1', 'A2')).toBe(-1);
  });

  it('B1 === B1 → 0', () => {
    expect(compareLevel('B1', 'B1')).toBe(0);
  });
});

describe('difficulty-engine - maxLevel', () => {
  it('取较高等级', () => {
    expect(maxLevel('A1', 'B2')).toBe('B2');
    expect(maxLevel('C1', 'A2')).toBe('C1');
    expect(maxLevel('B1', 'B1')).toBe('B1');
  });
});
