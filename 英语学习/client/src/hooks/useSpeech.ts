/**
 * hooks/useSpeech.ts - Web Speech API Hook（含降级）
 * English Fun Zone
 */
import { useCallback, useRef, useState } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { speak } from '@/lib/audio-manager';

interface UseSpeechReturn {
  /** 是否支持语音 */
  supported: boolean;
  /** 是否正在播放 */
  playing: boolean;
  /** 已播放次数 */
  playCount: number;
  /** 播放单词发音 */
  speakWord: (word: string) => Promise<void>;
  /** 重置播放计数 */
  resetCount: () => void;
}

export function useSpeech(): UseSpeechReturn {
  const [playing, setPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const accent = useSettingsStore(s => s.accent);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speakWord = useCallback(async (word: string) => {
    setPlaying(true);
    try {
      await speak(word, accent);
    } finally {
      setPlaying(false);
      setPlayCount(prev => prev + 1);
    }
  }, [accent]);

  const resetCount = useCallback(() => {
    setPlayCount(0);
  }, []);

  return { supported, playing, playCount, speakWord, resetCount };
}
