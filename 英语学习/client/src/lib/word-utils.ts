/**
 * lib/word-utils.ts - 词库加载/筛选工具
 * English Fun Zone
 */
import type { Level, WordEntry, GrammarQuestion } from '@/types/game';
import wordsData from '@/data/words.json';
import grammarData from '@/data/grammar-questions.json';

/** 缓存已加载的词库 */
let wordCache: WordEntry[] | null = null;
let grammarCache: GrammarQuestion[] | null = null;

/**
 * 获取词库（带缓存）
 */
export function getWordBank(): WordEntry[] {
  if (!wordCache) {
    wordCache = wordsData as WordEntry[];
  }
  return wordCache;
}

/**
 * 按等级筛选单词
 */
export function getWordsByLevel(level: Level): WordEntry[] {
  return getWordBank().filter(w => w.level === level);
}

/**
 * 按等级范围和数量随机抽取单词
 * @param level 当前等级
 * @param count 数量
 * @param allowLower 是否允许包含更低等级的词
 * @returns 随机单词列表
 */
export function pickRandomWords(
  level: Level,
  count: number,
  allowLower: boolean = true,
): WordEntry[] {
  const bank = getWordBank();
  const levels = getLevelRange(level, allowLower);

  // 筛选符合等级的单词
  const pool = bank.filter(w => levels.includes(w.level));

  // Fisher-Yates 部分洗牌
  return shuffleAndPick(pool, count);
}

/**
 * 获取等级范围（当前等级及以下）
 */
function getLevelRange(level: Level, allowLower: boolean): Level[] {
  const allLevels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const idx = allLevels.indexOf(level);
  if (allowLower) {
    return allLevels.slice(0, idx + 1);
  }
  return [level];
}

/**
 * Fisher-Yates 洗牌并取前 N 个
 */
function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const pool = [...arr];
  const n = Math.min(count, pool.length);
  for (let i = pool.length - 1; i > 0 && n > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

/**
 * Fisher-Yates 完整洗牌
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 获取语法题库（带缓存）
 */
export function getGrammarBank(): GrammarQuestion[] {
  if (!grammarCache) {
    grammarCache = grammarData as GrammarQuestion[];
  }
  return grammarCache;
}

/**
 * 按等级筛选语法题
 */
export function getGrammarByLevel(level: Level, count: number = 10): GrammarQuestion[] {
  const bank = getGrammarBank();
  const levels = getLevelRange(level, true);
  const pool = bank.filter(q => levels.includes(q.level));

  // 优先匹配当前等级，不够再补充低等级
  const exactMatch = pool.filter(q => q.level === level);
  const lowerMatch = pool.filter(q => q.level !== level);

  const result = shuffleAndPick(exactMatch, count);
  if (result.length < count) {
    result.push(...shuffleAndPick(lowerMatch, count - result.length));
  }

  return shuffleArray(result).slice(0, count);
}

/**
 * 打乱字母顺序（用于拼词大作战）
 */
export function shuffleLetters(word: string): string[] {
  const letters = word.split('');
  // Fisher-Yates 洗牌
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  // 确保打乱后和原词不同（如果长度>1）
  if (letters.length > 1 && letters.join('') === word) {
    // 交换前两个字符
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }
  return letters;
}

/**
 * 生成近音干扰项（简化版：基于长度和首字母相似度）
 */
export function generateDistractors(
  correctWord: string,
  wordBank: WordEntry[],
  count: number = 3,
): string[] {
  const correctLower = correctWord.toLowerCase();
  const candidates = wordBank
    .filter(w => w.word.toLowerCase() !== correctLower)
    .map(w => ({
      word: w.word,
      score: similarityScore(correctLower, w.word.toLowerCase()),
    }))
    .sort((a, b) => b.score - a.score);

  // 取相似度最高的几个作为干扰项
  const distractors = candidates.slice(0, count * 3);
  return shuffleAndPick(distractors, count).map(d => d.word);
}

/**
 * 简单相似度评分（基于长度、首字母、字符重叠）
 */
function similarityScore(a: string, b: string): number {
  let score = 0;
  // 长度接近加分
  const lenDiff = Math.abs(a.length - b.length);
  score += Math.max(0, 5 - lenDiff) * 2;
  // 首字母相同加分
  if (a[0] === b[0]) score += 3;
  // 共同字符数
  const aSet = new Set(a);
  const bSet = new Set(b);
  const intersection = new Set([...aSet].filter(x => bSet.has(x)));
  score += intersection.size;
  return score;
}
