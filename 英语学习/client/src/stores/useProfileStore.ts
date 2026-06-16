/**
 * stores/useProfileStore.ts - 用户档案状态管理（等级/分数/成就）
 * English Fun Zone
 */
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { calculateNewLevel } from '@/lib/difficulty-engine';
import {
  getGuestData,
  saveGuestData,
  saveGameRecord,
  updateUserLevel,
  unlockAchievement,
} from '@/lib/storage-adapter';
import { checkNewAchievements } from '@/lib/achievement-checker';
import { useAuthStore } from './useAuthStore';
import type { Level, GameResult } from '@/types/game';
import type { AchievementDefinition } from '@/types/achievement';
import { ACHIEVEMENT_DEFINITIONS } from '@/config/achievements';

interface ProfileState {
  /** 已解锁成就 key 列表 */
  unlockedAchievements: string[];
  /** 最近解锁的成就 */
  recentAchievements: AchievementDefinition[];
  /** 当前等级已完成局数（用于防抖） */
  gamesInCurrentLevel: number;
  /** 最近游戏结果 */
  lastGameResult: GameResult | null;

  /** 加载已解锁成就 */
  loadAchievements: () => Promise<void>;
  /** 处理游戏结算 */
  handleGameResult: (result: GameResult) => Promise<{
    levelChanged: boolean;
    newLevel: Level;
    direction: 'up' | 'down' | 'none';
    newAchievements: AchievementDefinition[];
  }>;
  /** 清除最近解锁成就 */
  clearRecentAchievements: () => void;
  /** 更新定级状态 */
  setPlacementDone: (level: Level) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  unlockedAchievements: [],
  recentAchievements: [],
  gamesInCurrentLevel: 0,
  lastGameResult: null,

  loadAchievements: async () => {
    const { user, isGuest } = useAuthStore.getState();

    if (isGuest) {
      const guestData = getGuestData();
      set({ unlockedAchievements: guestData.achievements || [] });
      return;
    }

    if (!user) return;

    try {
      if (!supabase) {
        // 无 Supabase，回退到游客成就
        const guestData = getGuestData();
        set({ unlockedAchievements: guestData.achievements || [] });
        return;
      }
      const { data, error } = await supabase
        .from('achievements')
        .select('achievement_key')
        .eq('user_id', user.id);

      if (error) {
        console.error('加载成就失败:', error);
        return;
      }

      set({ unlockedAchievements: (data || []).map(a => a.achievement_key) });
    } catch (err) {
      console.error('加载成就异常:', err);
    }
  },

  handleGameResult: async (result: GameResult) => {
    const { user, isGuest, profile } = useAuthStore.getState();
    const { unlockedAchievements, gamesInCurrentLevel } = get();

    // 1. 计算等级变化
    const { newLevel, changed, direction } = calculateNewLevel(
      result.difficulty,
      result.accuracy,
      gamesInCurrentLevel + 1,
    );

    // 2. 更新等级完成局数
    const newGamesCount = changed ? 0 : gamesInCurrentLevel + 1;
    set({ gamesInCurrentLevel: newGamesCount });

    // 3. 检测成就
    const currentLevel = profile?.level || result.difficulty;
    const totalScore = profile?.totalScore || 0;
    const totalGamesPlayed = profile?.totalGamesPlayed || 0;

    const newAchievements = checkNewAchievements(
      result,
      unlockedAchievements,
      totalGamesPlayed + 1,
      totalScore + result.score,
      changed ? newLevel : currentLevel,
    );

    // 4. 保存数据
    if (isGuest) {
      // 游客模式：存 localStorage
      saveGuestData({
        level: changed ? newLevel : currentLevel,
        totalScore: totalScore + result.score,
        totalGamesPlayed: totalGamesPlayed + 1,
        achievements: [
          ...unlockedAchievements,
          ...newAchievements.map(a => a.key),
        ],
      });

      // 更新 authStore 中的 profile
      useAuthStore.getState().updateGuestLevel(changed ? newLevel : currentLevel);
    } else if (user) {
      // 登录模式：存 Supabase
      await saveGameRecord(user.id, result);

      if (changed) {
        await updateUserLevel(user.id, newLevel);
      }

      // 解锁新成就
      for (const achievement of newAchievements) {
        await unlockAchievement(user.id, achievement.key);
      }

      // 刷新档案
      await useAuthStore.getState().refreshProfile();
    }

    // 5. 更新状态
    set({
      unlockedAchievements: [
        ...unlockedAchievements,
        ...newAchievements.map(a => a.key),
      ],
      recentAchievements: newAchievements,
      lastGameResult: {
        ...result,
        levelChanged: changed,
        oldLevel: changed ? result.difficulty : undefined,
        newLevel: changed ? newLevel : undefined,
      },
    });

    return {
      levelChanged: changed,
      newLevel,
      direction,
      newAchievements,
    };
  },

  clearRecentAchievements: () => {
    set({ recentAchievements: [] });
  },

  setPlacementDone: async (level: Level) => {
    const { isGuest, user } = useAuthStore.getState();

    if (isGuest) {
      saveGuestData({ isPlacementDone: true, level });
      useAuthStore.getState().updateGuestLevel(level);
    } else if (user && supabase) {
      await supabase
        .from('profiles')
        .update({ is_placement_done: true, level, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      await useAuthStore.getState().refreshProfile();
    }
  },
}));
