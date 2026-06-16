/**
 * pages/games/WordMatch.tsx - 单词连连看 [P0]
 * English Fun Zone
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import GameHeader from '@/components/game/GameHeader';
import ResultPanel from '@/components/game/ResultPanel';
import { useGameStore } from '@/stores/useGameStore';
import { useTimer } from '@/hooks/useTimer';
import { useCombo } from '@/hooks/useCombo';
import { useScoring } from '@/hooks/useScoring';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { useGameEngine } from '@/hooks/useGameEngine';
import { LEVEL_MAPPING, MATCH_LEVEL_TIMES } from '@/config/constants';
import { playErrorSound } from '@/lib/audio-manager';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { GameResult, MatchCell, WordEntry, Level, PathPoint } from '@/types/game';
import type { AchievementDefinition } from '@/types/achievement';

interface Point { row: number; col: number; }

export default function WordMatch() {
  return (
    <ErrorBoundary type="game">
      <WordMatchInner />
    </ErrorBoundary>
  );
}

function WordMatchInner() {
  const { getMatchPairs } = useQuestionBank();
  const { startGame, finishGame, handleCorrect: engineCorrect, handleWrong: engineWrong } = useGameEngine();
  const { combo, maxCombo, onCorrect, onWrong } = useCombo();
  const { calcScore, addScore } = useScoring({ gameType: 'match' });
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const score = useGameStore(s => s.activeGame?.score || 0);
  const correctCount = useGameStore(s => s.activeGame?.correctCount || 0);

  const [grid, setGrid] = useState<MatchCell[][]>([]);
  const [selected, setSelected] = useState<Point | null>(null);
  const [connectionPath, setConnectionPath] = useState<Point[]>([]);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [levelChanged, setLevelChanged] = useState(false);
  const [newAchievements, setNewAchievements] = useState<AchievementDefinition[]>([]);
  const [started, setStarted] = useState(false);
  const [noHint, setNoHint] = useState(true);

  const gridSize = useRef(6);

  const { timeLeft, start: startTimer, reset: resetTimer } = useTimer({
    duration: 120,
    autoStart: false,
    onEnd: () => handleGameEnd(),
  });

  // 生成网格
  const generateGrid = useCallback(() => {
    const { pairs, gridSize: gs } = getMatchPairs();
    gridSize.current = gs;
    const levelTime = MATCH_LEVEL_TIMES[gs] || 120;
    resetTimer(levelTime);

    const totalCells = gs * gs;
    const cells: MatchCell[] = [];

    // 英文和中文成对放置
    pairs.forEach((word, i) => {
      cells.push({
        id: `en-${i}`,
        row: 0, col: 0,
        text: word.word,
        type: 'english',
        pairId: String(i),
        eliminated: false,
        wordEntry: word,
      });
      cells.push({
        id: `cn-${i}`,
        row: 0, col: 0,
        text: word.chinese,
        type: 'chinese',
        pairId: String(i),
        eliminated: false,
        wordEntry: word,
      });
    });

    // Fisher-Yates 洗牌
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    // 分配到网格
    const newGrid: MatchCell[][] = [];
    for (let r = 0; r < gs; r++) {
      newGrid[r] = [];
      for (let c = 0; c < gs; c++) {
        const idx = r * gs + c;
        if (idx < cells.length) {
          newGrid[r][c] = { ...cells[idx], row: r, col: c };
        }
      }
    }

    setGrid(newGrid);
  }, [getMatchPairs, resetTimer]);

  // BFS 路径连通检测（≤2拐弯）
  const canConnect = useCallback((p1: Point, p2: Point, grid: MatchCell[][]): Point[] | null => {
    if (p1.row === p2.row && p1.col === p2.col) return null;

    const size = grid.length;

    // 检查直线连通
    const checkLine = (from: Point, to: Point): boolean => {
      if (from.row === to.row) {
        const minC = Math.min(from.col, to.col);
        const maxC = Math.max(from.col, to.col);
        for (let c = minC + 1; c < maxC; c++) {
          if (grid[from.row][c] && !grid[from.row][c].eliminated) return false;
        }
        return true;
      }
      if (from.col === to.col) {
        const minR = Math.min(from.row, to.row);
        const maxR = Math.max(from.row, to.row);
        for (let r = minR + 1; r < maxR; r++) {
          if (grid[r] && grid[r][from.col] && !grid[r][from.col].eliminated) return false;
        }
        return true;
      }
      return false;
    };

    // 0 拐弯：直线
    if (checkLine(p1, p2)) {
      return [p1, p2];
    }

    // 1 拐弯：拐角点
    const corner1: Point = { row: p1.row, col: p2.col };
    if (!grid[p1.row]?.[p2.col] || grid[p1.row][p2.col].eliminated) {
      if (checkLine(p1, corner1) && checkLine(corner1, p2)) {
        return [p1, corner1, p2];
      }
    }
    const corner2: Point = { row: p2.row, col: p1.col };
    if (!grid[p2.row]?.[p1.col] || grid[p2.row][p1.col].eliminated) {
      if (checkLine(p1, corner2) && checkLine(corner2, p2)) {
        return [p1, corner2, p2];
      }
    }

    // 2 拐弯：扫描行
    for (let r = 0; r < size; r++) {
      const c1: Point = { row: r, col: p1.col };
      const c2: Point = { row: r, col: p2.col };
      const c1Blocked = grid[r]?.[p1.col] && !grid[r][p1.col].eliminated && r !== p1.row;
      const c2Blocked = grid[r]?.[p2.col] && !grid[r][p2.col].eliminated && r !== p2.row;
      if (!c1Blocked && !c2Blocked && checkLine(p1, c1) && checkLine(c1, c2) && checkLine(c2, p2)) {
        return [p1, c1, c2, p2];
      }
    }

    // 2 拐弯：扫描列
    for (let c = 0; c < size; c++) {
      const c1: Point = { row: p1.row, col: c };
      const c2: Point = { row: p2.row, col: c };
      const c1Blocked = grid[p1.row]?.[c] && !grid[p1.row][c].eliminated && c !== p1.col;
      const c2Blocked = grid[p2.row]?.[c] && !grid[p2.row][c].eliminated && c !== p2.col;
      if (!c1Blocked && !c2Blocked && checkLine(p1, c1) && checkLine(c1, c2) && checkLine(c2, p2)) {
        return [p1, c1, c2, p2];
      }
    }

    return null;
  }, []);

  // 点击格子
  const handleCellClick = useCallback((cell: MatchCell) => {
    if (cell.eliminated) return;

    if (!selected) {
      setSelected({ row: cell.row, col: cell.col });
      return;
    }

    // 同一格
    if (selected.row === cell.row && selected.col === cell.col) {
      setSelected(null);
      setConnectionPath([]);
      return;
    }

    const prevCell = grid[selected.row]?.[selected.col];
    if (!prevCell) return;

    // 检查是否英-中配对
    const isValidPair =
      prevCell.pairId === cell.pairId &&
      prevCell.type !== cell.type;

    if (!isValidPair) {
      setSelected({ row: cell.row, col: cell.col });
      setConnectionPath([]);
      return;
    }

    // 路径检测
    const path = canConnect(selected, { row: cell.row, col: cell.col }, grid);

    if (path) {
      // 连通！消除
      setConnectionPath(path);
      const points = onCorrect();
      addScore(points);
      engineCorrect({
        questionId: cell.pairId,
        correct: true,
        timeSpent: 0,
        userAnswer: `${prevCell.text}-${cell.text}`,
        correctAnswer: `${prevCell.text}-${cell.text}`,
      }, points);

      // 更新网格
      setGrid(prev => {
        const newGrid = prev.map(r => [...r]);
        newGrid[selected.row][selected.col] = { ...newGrid[selected.row][selected.col], eliminated: true };
        newGrid[cell.row][cell.col] = { ...newGrid[cell.row][cell.col], eliminated: true };
        return newGrid;
      });

      setSelected(null);

      // 检查是否全部消除
      setTimeout(() => {
        setConnectionPath([]);
        setGrid(prev => {
          const allEliminated = prev.flat().every(c => c.eliminated);
          if (allEliminated) {
            // 过关！生成新关卡
            setCurrentLevel(l => l + 1);
            setTimeout(() => generateGrid(), 500);
          }
          return prev;
        });
      }, 300);
    } else {
      // 不连通
      if (soundEnabled) playErrorSound();
      onWrong();
      engineWrong({
        questionId: cell.pairId,
        correct: false,
        timeSpent: 0,
        userAnswer: '不连通',
        correctAnswer: '',
      });
      setSelected(null);
    }
  }, [selected, grid, canConnect, onCorrect, onWrong]);

  // 提示
  const handleHint = () => {
    if (hintsLeft <= 0) return;
    setNoHint(false);

    // 查找可消除的配对
    const cells = grid.flat().filter(c => !c.eliminated);
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        if (cells[i].pairId === cells[j].pairId && cells[i].type !== cells[j].type) {
          const path = canConnect(
            { row: cells[i].row, col: cells[i].col },
            { row: cells[j].row, col: cells[j].col },
            grid,
          );
          if (path) {
            setConnectionPath(path);
            setHintsLeft(h => h - 1);
            setTimeout(() => setConnectionPath([]), 2000);
            return;
          }
        }
      }
    }
  };

  async function handleGameEnd() {
    setGameOver(true);
    const res = await finishGame();
    if (res) {
      // 附加 noHint 信息
      res.result.details = { ...res.result.details, noHint };
      setResult(res.result);
      setLevelChanged(res.levelChanged);
      setNewAchievements(res.newAchievements);
    }
  }

  const handleStart = () => {
    setStarted(true);
    startGame('match');
    setCurrentLevel(1);
    setHintsLeft(3);
    setNoHint(true);
    generateGrid();
  };

  if (!started) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-6">🔗</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">单词连连看</h1>
        <p className="text-gray-500 mb-4">配对英文单词和中文释义，消除所有配对过关</p>
        <div className="bg-emerald-50 rounded-xl p-4 mb-8 text-left text-sm text-gray-600">
          <p>🎯 点击两个格子配对消除</p>
          <p>🔗 路径最多2个拐弯才能连通</p>
          <p>💡 每关可用3次提示</p>
        </div>
        <button onClick={handleStart} className="btn-primary text-lg px-8">
          开始游戏
        </button>
      </div>
    );
  }

  const gs = gridSize.current;
  const cellSize = gs <= 6 ? 'w-14 h-14 text-sm' : gs <= 8 ? 'w-12 h-12 text-xs' : 'w-10 h-10 text-xs';

  return (
    <div className="max-w-3xl mx-auto">
      <GameHeader
        score={score}
        combo={combo}
        timeLeft={timeLeft}
        maxCombo={maxCombo}
      />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">第 {currentLevel} 关</span>
        <button
          onClick={handleHint}
          disabled={hintsLeft <= 0}
          className="text-sm px-3 py-1 bg-amber-100 text-amber-700 rounded-lg disabled:opacity-50"
        >
          💡 提示 ({hintsLeft})
        </button>
      </div>

      {/* 网格 */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-6 overflow-auto">
        <div
          className="grid gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${gs}, minmax(0, 1fr))`,
            width: `${gs * 52}px`,
            maxWidth: '100%',
          }}
        >
          {grid.flat().map(cell => (
            <motion.button
              key={cell.id}
              initial={{ scale: 0 }}
              animate={{ scale: cell.eliminated ? 0 : 1 }}
              whileHover={!cell.eliminated ? { scale: 1.05 } : {}}
              onClick={() => handleCellClick(cell)}
              className={`
                ${cellSize} rounded-lg font-medium border-2 transition-all
                ${cell.eliminated ? 'opacity-0 pointer-events-none' : ''}
                ${selected?.row === cell.row && selected?.col === cell.col
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : cell.type === 'english'
                    ? 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-400'
                    : 'border-green-200 bg-green-50 text-green-700 hover:border-green-400'
                }
              `}
              style={{ aspectRatio: '1' }}
            >
              <span className="line-clamp-2 text-center leading-tight">
                {cell.text}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 结算 */}
      {result && (
        <ResultPanel
          open={gameOver}
          result={result}
          levelChanged={levelChanged}
          newAchievements={newAchievements}
          onClose={() => {
            setGameOver(false);
            setStarted(false);
            setResult(null);
          }}
        />
      )}
    </div>
  );
}
