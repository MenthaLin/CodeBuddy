/**
 * hooks/useKeyboard.ts - 键盘快捷键 Hook
 * English Fun Zone
 */
import { useEffect, useCallback } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface KeyBinding {
  key: string;
  handler: KeyHandler;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  enabled?: boolean;
}

interface UseKeyboardOptions {
  bindings: KeyBinding[];
  enabled?: boolean;
}

/**
 * 键盘快捷键管理 Hook
 */
export function useKeyboard({ bindings, enabled = true }: UseKeyboardOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const binding of bindings) {
        if (!binding.enabled && binding.enabled !== undefined) continue;

        const keyMatch = e.key === binding.key;
        const ctrlMatch = binding.ctrlKey ? (e.ctrlKey || e.metaKey) : true;
        const shiftMatch = binding.shiftKey ? e.shiftKey : true;

        if (keyMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          binding.handler(e);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bindings, enabled]);
}
