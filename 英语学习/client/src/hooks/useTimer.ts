/**
 * hooks/useTimer.ts - 倒计时 Hook
 * English Fun Zone
 */
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  /** 总时间（秒） */
  duration: number;
  /** 倒计时结束回调 */
  onEnd?: () => void;
  /** 是否自动开始 */
  autoStart?: boolean;
}

interface UseTimerReturn {
  /** 剩余时间（秒） */
  timeLeft: number;
  /** 是否正在运行 */
  isRunning: boolean;
  /** 是否已结束 */
  isFinished: boolean;
  /** 已过时间（秒） */
  elapsed: number;
  /** 进度 (0-1) */
  progress: number;
  /** 开始计时 */
  start: () => void;
  /** 暂停计时 */
  pause: () => void;
  /** 恢复计时 */
  resume: () => void;
  /** 重置计时 */
  reset: (newDuration?: number) => void;
  /** 增加时间 */
  addTime: (seconds: number) => void;
  /** 减少时间 */
  deductTime: (seconds: number) => void;
}

export function useTimer({
  duration,
  onEnd,
  autoStart = true,
}: UseTimerOptions): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  // 清理定时器
  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 主计时逻辑
  useEffect(() => {
    if (!isRunning || isFinished) {
      clearTimer();
      return;
    }

    const startTime = Date.now();
    const initialLeft = timeLeft;

    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const left = Math.max(0, initialLeft - elapsed);

      setTimeLeft(left);

      if (left <= 0) {
        clearTimer();
        setIsRunning(false);
        setIsFinished(true);
        onEndRef.current?.();
      }
    }, 100); // 100ms 更新一次，保证精度

    return clearTimer;
  }, [isRunning, isFinished, clearTimer, timeLeft]);

  const start = useCallback(() => {
    setTimeLeft(duration);
    setIsFinished(false);
    setIsRunning(true);
  }, [duration]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (!isFinished && timeLeft > 0) {
      setIsRunning(true);
    }
  }, [isFinished, timeLeft]);

  const reset = useCallback((newDuration?: number) => {
    const d = newDuration ?? duration;
    setTimeLeft(d);
    setIsFinished(false);
    setIsRunning(autoStart);
  }, [duration, autoStart]);

  const addTime = useCallback((seconds: number) => {
    setTimeLeft(prev => prev + seconds);
  }, []);

  const deductTime = useCallback((seconds: number) => {
    setTimeLeft(prev => {
      const newVal = Math.max(0, prev - seconds);
      if (newVal <= 0) {
        setIsRunning(false);
        setIsFinished(true);
        onEndRef.current?.();
      }
      return newVal;
    });
  }, []);

  return {
    timeLeft,
    isRunning,
    isFinished,
    elapsed: duration - timeLeft,
    progress: duration > 0 ? (duration - timeLeft) / duration : 0,
    start,
    pause,
    resume,
    reset,
    addTime,
    deductTime,
  };
}
