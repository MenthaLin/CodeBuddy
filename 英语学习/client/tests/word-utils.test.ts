/**
 * tests/word-utils.test.ts - 词库加载/筛选工具测试
 * English Fun Zone
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getWordBank,
  getWordsByLevel,
  pickRandomWords,
  shuffleArray,
  shuffleLetters,
  getGrammarBank,
  getGrammarByLevel,
  generateDistractors,
} from '@/lib/word-utils';
import type { Level, WordEntry } from '@/types/game';

// 清除缓存，让每个测试重新加载数据
beforeEach(() => {
  vi.resetModules();
});

describe('word-utils - getWordBank', () => {
  it('返回词库数组', () => {
    const words = getWordBank();
    expect(Array.isArray(words)).toBe(true);
    expect(words.length).toBeGreaterThan(0);
  });

  it('每条数据包含必要字段', () => {
    const words = getWordBank();
    words.forEach(w => {
      expect(w).toHaveProperty('id');
      expect(w).toHaveProperty('word');
      expect(w).toHaveProperty('chinese');
      expect(w).toHaveProperty('level');
      expect(typeof w.word).toBe('string');
      expect(w.word.length).toBeGreaterThan(0);
    });
  });

  it('缓存机制：第二次调用返回相同引用', () => {
    const a = getWordBank();
    const b = getWordBank();
    expect(a).toBe(b);
  });
});

describe('word-utils - getWordsByLevel', () => {
  it('筛选 A1 等级单词', () => {
    const words = getWordsByLevel('A1');
    expect(words.length).toBeGreaterThan(0);
    words.forEach(w => expect(w.level).toBe('A1'));
  });

  it('筛选 C2 等级单词', () => {
    const words = getWordsByLevel('C2');
    expect(words.length).toBeGreaterThan(0);
    words.forEach(w => expect(w.level).toBe('C2'));
  });

  it('不存在的等级应返回空数组', () => {
    const words = getWordsByLevel('Z9' as Level);
    expect(words).toEqual([]);
  });

  it('每个等级都有单词', () => {
    const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    levels.forEach(l => {
      expect(getWordsByLevel(l).length).toBeGreaterThan(0);
    });
  });
});

describe('word-utils - pickRandomWords', () => {
  it('抽取指定数量的单词', () => {
    const words = pickRandomWords('A2', 5);
    expect(words.length).toBe(5);
  });

  it('抽取数量超出词库 → 返回实际数量', () => {
    const allA1 = getWordsByLevel('A1');
    const words = pickRandomWords('A1', allA1.length + 100);
    expect(words.length).toBeLessThanOrEqual(getWordBank().length);
  });

  it('allowLower=true 包含更低等级', () => {
    const words = pickRandomWords('B2', 20, true);
    words.forEach(w => {
      const levels: Level[] = ['A1', 'A2', 'B1', 'B2'];
      expect(levels).toContain(w.level);
    });
  });

  it('allowLower=false 仅当前等级', () => {
    const words = pickRandomWords('A1', 5, false);
    words.forEach(w => expect(w.level).toBe('A1'));
  });

  it('抽取0个 → 空数组', () => {
    const words = pickRandomWords('B1', 0);
    expect(words).toEqual([]);
  });
});

describe('word-utils - shuffleArray', () => {
  it('长度不变', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleArray(arr);
    expect(shuffled).toHaveLength(arr.length);
  });

  it('包含所有元素', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it('不修改原数组', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(copy);
  });

  it('空数组 → 空数组', () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it('单元素 → 单元素', () => {
    expect(shuffleArray([42])).toEqual([42]);
  });
});

describe('word-utils - shuffleLetters', () => {
  it('返回数组长度与单词长度相同', () => {
    const letters = shuffleLetters('hello');
    expect(letters).toHaveLength(5);
  });

  it('包含所有字母（集合一致）', () => {
    const word = 'english';
    const letters = shuffleLetters(word);
    expect(letters.sort()).toEqual(word.split('').sort());
  });

  it('长度>1时确保与原词不同', () => {
    const word = 'ab';
    // 运行多次确保逻辑有效
    for (let i = 0; i < 10; i++) {
      const letters = shuffleLetters(word);
      if (letters.join('') !== word) {
        return; // 通过了
      }
    }
    // 如果10次都是原序（概率极低），但至少要有一次不同
    const letters = shuffleLetters(word);
    expect(letters.join('')).not.toBe(word);
  });

  it('单字母单词保持不变', () => {
    const letters = shuffleLetters('a');
    expect(letters).toEqual(['a']);
  });
});

describe('word-utils - getGrammarBank', () => {
  it('返回语法题库数组', () => {
    const questions = getGrammarBank();
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThan(0);
  });

  it('每条数据包含必要字段', () => {
    const questions = getGrammarBank();
    questions.forEach(q => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('incorrectSentence');
      expect(q).toHaveProperty('correctSentence');
      expect(q).toHaveProperty('errorWord');
      expect(q).toHaveProperty('correction');
      expect(q).toHaveProperty('errorType');
      expect(q).toHaveProperty('level');
      expect(q).toHaveProperty('distractors');
      expect(q.distractors.length).toBeGreaterThan(0);
    });
  });
});

describe('word-utils - getGrammarByLevel', () => {
  it('按等级筛选语法题', () => {
    const questions = getGrammarByLevel('A1', 5);
    expect(questions.length).toBeLessThanOrEqual(5);
    // 可能包含更低等级（allowLower=true 是默认值）
    questions.forEach(q => {
      const levels: Level[] = ['A1'];
      expect(levels).toContain(q.level);
    });
  });

  it('数量超过题库 → 返回实际数量', () => {
    const questions = getGrammarByLevel('C2', 100);
    const bank = getGrammarBank();
    expect(questions.length).toBeLessThanOrEqual(bank.length);
  });
});

describe('word-utils - generateDistractors', () => {
  it('生成指定数量的干扰项', () => {
    const bank = getWordBank();
    const distractors = generateDistractors('apple', bank, 3);
    expect(distractors).toHaveLength(3);
  });

  it('干扰项不包含正确单词', () => {
    const bank = getWordBank();
    const distractors = generateDistractors('cat', bank, 3);
    distractors.forEach(d => expect(d.toLowerCase()).not.toBe('cat'));
  });

  it('干扰项来自词库', () => {
    const bank = getWordBank();
    const allWords = bank.map(w => w.word);
    const distractors = generateDistractors('hello', bank, 3);
    distractors.forEach(d => expect(allWords).toContain(d));
  });

  it('词库不够 → 返回实际数量', () => {
    const smallBank: WordEntry[] = [
      { id: '1', word: 'test', chinese: '测试', level: 'A1' },
    ];
    const distractors = generateDistractors('test', smallBank, 3);
    expect(distractors.length).toBeLessThanOrEqual(0);
  });

  it('空词库 → 空数组', () => {
    const distractors = generateDistractors('hello', [], 3);
    expect(distractors).toEqual([]);
  });
});
