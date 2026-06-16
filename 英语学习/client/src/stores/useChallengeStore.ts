/**
 * stores/useChallengeStore.ts - 每日挑战状态管理
 * English Fun Zone
 */
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';
import { pickDailyChallenges, getDailySeed } from '@/config/challenges';
import type { ChallengeDefinition, DailyChallenge } from '@/types/game';

interface ChallengeState {
  /** 今日挑战列表 */
  challenges: DailyChallenge[];
  /** 挑战定义列表 */
  definitions: ChallengeDefinition[];
  /** 是否已加载 */
  loaded: boolean;

  /** 加载今日挑战 */
  loadDailyChallenges: () => Promise<void>;
  /** 更新挑战进度 */
  updateProgress: (challengeKey: string, progress: number) => Promise<void>;
  /** 检查并更新所有挑战 */
  checkAndUpdate: (gameType: string, stats: {
    combo: number;
    score: number;
    accuracy: number;
    avgTime: number;
    noHint: boolean;
  }) => Promise<void>;
}

const today = new Date().toISOString().slice(0, 10);
const seed = getDailySeed(today);

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  definitions: [],
  loaded: false,

  loadDailyChallenges: async () => {
    const { isGuest, user } = useAuthStore.getState();
    const picked = pickDailyChallenges(seed);
    set({ definitions: picked });

    if (isGuest) {
      // 游客模式：创建空的挑战列表
      const challenges: DailyChallenge[] = picked.map(def => ({
        challengeDate: today,
        challengeKey: def.key,
        progress: 0,
        target: def.target,
        completed: false,
      }));
      set({ challenges, loaded: true });
      return;
    }

    if (!user) {
      set({ loaded: true });
      return;
    }

    // 登录模式：从 Supabase 加载
    try {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_date', today);

      if (error) {
        console.error('加载每日挑战失败:', error);
        // 创建默认挑战
        const challenges: DailyChallenge[] = picked.map(def => ({
          challengeDate: today,
          challengeKey: def.key,
          progress: 0,
          target: def.target,
          completed: false,
        }));
        set({ challenges, loaded: true });
        return;
      }

      if (data && data.length > 0) {
        set({
          challenges: data.map(d => ({
            id: d.id,
            challengeDate: d.challenge_date,
            challengeKey: d.challenge_key,
            progress: d.progress,
            target: d.target,
            completed: d.completed,
          })),
          loaded: true,
        });
      } else {
        // 创建新挑战
        const challenges: DailyChallenge[] = picked.map(def => ({
          challengeDate: today,
          challengeKey: def.key,
          progress: 0,
          target: def.target,
          completed: false,
        }));
        set({ challenges, loaded: true });
      }
    } catch (err) {
      console.error('加载每日挑战异常:', err);
      set({ loaded: true });
    }
  },

  updateProgress: async (challengeKey: string, progress: number) => {
    const { isGuest, user } = useAuthStore.getState();

    set(state => ({
      challenges: state.challenges.map(c =>
        c.challengeKey === challengeKey
          ? { ...c, progress, completed: progress >= c.target }
          : c,
      ),
    }));

    if (!isGuest && user) {
      const challenge = get().challenges.find(c => c.challengeKey === challengeKey);
      if (challenge) {
        await supabase.from('daily_challenges').upsert({
          user_id: user.id,
          challenge_date: today,
          challenge_key: challengeKey,
          progress,
          target: challenge.target,
          completed: progress >= challenge.target,
        }, {
          onConflict: 'user_id,challenge_date,challenge_key',
        });
      }
    }
  },

  checkAndUpdate: async (gameType, stats) => {
    const { definitions } = get();

    for (const def of definitions) {
      let progress = 0;

      switch (def.key) {
        case 'spelling_combo_10':
          if (gameType === 'spelling') progress = stats.combo;
          break;
        case 'grammar_perfect':
          if (gameType === 'grammar' && stats.accuracy >= 1) progress = 100;
          break;
        case 'listen_speed':
          if (gameType === 'listen' && stats.avgTime <= 3) progress = 3;
          break;
        case 'match_no_hint':
          if (gameType === 'match' && stats.noHint) progress = 1;
          break;
        case 'total_score_500':
          progress = Math.min(stats.score, 500);
          break;
        case 'total_score_1000':
          progress = Math.min(stats.score, 1000);
          break;
        case 'play_all_games':
          progress = 1; // 至少完成了一款
          break;
        case 'combo_any_15':
          progress = stats.combo;
          break;
        case 'spelling_score_200':
          if (gameType === 'spelling') progress = Math.min(stats.score, 200);
          break;
        case 'games_5':
          progress = 1;
          break;
        default:
          break;
      }

      if (progress > 0) {
        await get().updateProgress(def.key, progress);
      }
    }
  },
}));
