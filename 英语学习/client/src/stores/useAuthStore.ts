/**
 * stores/useAuthStore.ts - 认证状态管理（游客/登录）
 * English Fun Zone
 */
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { migrateGuestToCloud, getGuestData, saveGuestData } from '@/lib/storage-adapter';
import type { AuthUser, UserProfile, UserSession } from '@/types/user';
import type { Level } from '@/types/game';

interface AuthState extends UserSession {
  /** 加载中 */
  loading: boolean;
  /** 初始化认证监听 */
  initialize: () => void;
  /** 邮箱注册 */
  signUp: (email: string, password: string, nickname?: string) => Promise<{ error?: string }>;
  /** 邮箱登录 */
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  /** Google OAuth 登录 */
  signInWithGoogle: () => Promise<void>;
  /** 登出 */
  signOut: () => Promise<void>;
  /** 刷新用户档案 */
  refreshProfile: () => Promise<void>;
  /** 以游客身份初始化 */
  initGuest: () => void;
  /** 更新游客等级 */
  updateGuestLevel: (level: Level) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isGuest: true,
  loading: true,

  initialize: () => {
    // 监听 Supabase Auth 状态变化
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email,
          createdAt: session.user.created_at,
        };

        set({ user: authUser, isGuest: false, loading: true });

        // 加载用户档案
        await get().refreshProfile();

        // 如果是刚登录（非 token 刷新），执行游客数据迁移
        if (event === 'SIGNED_IN') {
          await migrateGuestToCloud(session.user.id);
          await get().refreshProfile();
        }
      } else {
        // 未登录 → 游客模式
        set({ user: null, profile: null, isGuest: true });
        get().initGuest();
      }

      set({ loading: false });
    });

    // 检查当前 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // 无 session → 游客模式
        get().initGuest();
        set({ loading: false });
      }
    });
  },

  initGuest: () => {
    const guestData = getGuestData();
    set({
      isGuest: true,
      user: null,
      profile: {
        id: 'guest',
        level: guestData.level,
        totalScore: guestData.totalScore,
        totalGamesPlayed: guestData.totalGamesPlayed,
        isPlacementDone: guestData.isPlacementDone,
      },
    });
  },

  updateGuestLevel: (level: Level) => {
    const { profile } = get();
    if (profile && get().isGuest) {
      set({ profile: { ...profile, level } });
      saveGuestData({ level });
    }
  },

  signUp: async (email, password, nickname) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
      },
    });

    if (error) return { error: error.message };
    return {};
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };
    return {};
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, isGuest: true });
    get().initGuest();
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // 用户档案可能还没创建（触发器延迟）
        if (error.code === 'PGRST116') {
          console.log('用户档案尚未创建，等待触发器...');
          // 稍后重试
          setTimeout(() => get().refreshProfile(), 2000);
          return;
        }
        console.error('获取用户档案失败:', error);
        return;
      }

      if (data) {
        set({
          profile: {
            id: data.id,
            nickname: data.nickname || undefined,
            avatarUrl: data.avatar_url || undefined,
            level: data.level as Level,
            totalScore: data.total_score,
            totalGamesPlayed: data.total_games_played,
            isPlacementDone: data.is_placement_done,
          },
        });
      }
    } catch (err) {
      console.error('刷新档案异常:', err);
    }
  },
}));
