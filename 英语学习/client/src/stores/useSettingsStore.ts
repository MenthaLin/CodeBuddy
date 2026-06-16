/**
 * stores/useSettingsStore.ts - 用户设置状态管理（发音/音效偏好）
 * English Fun Zone
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings } from '@/types/user';
import { STORAGE_KEYS } from '@/config/constants';

interface SettingsState extends UserSettings {
  /** 切换发音 */
  toggleAccent: () => void;
  /** 设置发音 */
  setAccent: (accent: 'us' | 'uk') => void;
  /** 切换音效 */
  toggleSound: () => void;
  /** 切换动画 */
  toggleAnimation: () => void;
  /** 切换音乐 */
  toggleMusic: () => void;
  /** 重置设置 */
  reset: () => void;
}

const defaultSettings: UserSettings = {
  accent: 'us',
  soundEnabled: true,
  animationEnabled: true,
  musicEnabled: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      toggleAccent: () => {
        const current = get().accent;
        set({ accent: current === 'us' ? 'uk' : 'us' });
      },

      setAccent: (accent) => set({ accent }),

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleAnimation: () => set((s) => ({ animationEnabled: !s.animationEnabled })),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),

      reset: () => set(defaultSettings),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
    },
  ),
);
