/**
 * lib/utils.ts - 通用工具函数
 * English Fun Zone
 */

/** 生成简单唯一ID */
export function v4Id(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/** 格式化时间 mm:ss */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** 格式化百分比 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** 数字缩写（1000 → 1K） */
export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

/** 延迟函数 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** 随机整数 [min, max] */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 截断文本 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
