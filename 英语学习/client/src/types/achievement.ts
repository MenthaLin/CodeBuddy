/**
 * types/achievement.ts - 成就相关类型定义
 * English Fun Zone
 */

/** 成就定义 */
export interface AchievementDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'game' | 'combo' | 'score' | 'level' | 'streak' | 'special';
  condition: AchievementCondition;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/** 成就条件 */
export interface AchievementCondition {
  type: string;
  target: number;
  gameType?: string;
}

/** 用户已解锁成就 */
export interface UserAchievement {
  id?: number;
  userId?: string;
  achievementKey: string;
  unlockedAt?: string;
}

/** 成就状态（用于展示） */
export interface AchievementStatus {
  definition: AchievementDefinition;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;        // 当前进度
  target?: number;          // 目标值
}
