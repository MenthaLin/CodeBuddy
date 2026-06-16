/**
 * lib/audio-manager.ts - 音频管理（Web Speech API + 降级方案）
 * English Fun Zone
 */

/** 检测 Web Speech API 是否可用 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** 检测 Audio API 是否可用 */
export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && 'Audio' in window;
}

/**
 * 使用 Web Speech API 朗读单词
 * @param word 要朗读的单词
 * @param accent 发音类型 'us' | 'uk'
 * @param rate 语速（默认 0.9）
 * @returns Promise，朗读完成后 resolve
 */
export function speakWord(
  word: string,
  accent: 'us' | 'uk' = 'us',
  rate: number = 0.9,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSupported()) {
      reject(new Error('Web Speech API 不可用'));
      return;
    }

    // 取消之前的语音
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = accent === 'us' ? 'en-US' : 'en-GB';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    speechSynthesis.speak(utterance);
  });
}

/**
 * 使用降级音频文件播放
 * @param word 单词
 * @param accent 发音类型
 * @returns Promise
 */
export function playFallbackAudio(
  word: string,
  accent: 'us' | 'uk' = 'us',
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isAudioSupported()) {
      reject(new Error('Audio API 不可用'));
      return;
    }

    const audio = new Audio(`/audio/${accent}/${word.toLowerCase()}.mp3`);

    audio.onended = () => resolve();
    audio.onerror = () => {
      // 音频文件不存在，静默失败
      console.warn(`音频文件不可用: ${word}`);
      resolve(); // 不阻塞游戏流程
    };

    audio.play().catch((err) => {
      console.warn('音频播放失败:', err);
      resolve();
    });
  });
}

/**
 * 智能播放：优先 Web Speech API，降级到预录音频
 * @param word 单词
 * @param accent 发音类型
 */
export async function speak(
  word: string,
  accent: 'us' | 'uk' = 'us',
): Promise<{ method: 'speech' | 'fallback' | 'none' }> {
  if (isSpeechSupported()) {
    try {
      await speakWord(word, accent);
      return { method: 'speech' };
    } catch {
      // Web Speech API 失败，尝试降级
    }
  }

  try {
    await playFallbackAudio(word, accent);
    return { method: 'fallback' };
  } catch {
    return { method: 'none' };
  }
}

/**
 * 播放音效（使用 Web Audio API 生成简单音效）
 */
const audioContextRef: { current: AudioContext | null } = { current: null };

function getAudioContext(): AudioContext | null {
  if (!audioContextRef.current && typeof window !== 'undefined') {
    try {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioContextRef.current;
}

/** 播放正确音效（短促上升音） */
export function playCorrectSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523, ctx.currentTime);      // C5
  osc.frequency.linearRampToValueAtTime(784, ctx.currentTime + 0.1); // G5

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

/** 播放错误音效（低沉下降音） */
export function playErrorSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'square';
  osc.frequency.setValueAtTime(330, ctx.currentTime);      // E4
  osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.15); // A3

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

/** 播放连击音效 */
export function playComboSound(combo: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseFreq = 400 + combo * 20;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

/** 播放等级升级音效（上升琶音） */
export function playLevelUpSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);

    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.3);
  });
}
