/**
 * 扫雷游戏 - Game 类核心逻辑测试
 * 
 * 测试方式：直接加载 Game 类的核心逻辑进行测试
 * 使用轻量级测试框架，无需额外依赖
 * 
 * 运行方式：node tests/game.test.js
 */

// ============================================
// 轻量级测试框架
// ============================================
const tests = [];
let passed = 0;
let failed = 0;
let startTime = Date.now();

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) throw new Error(message || '断言失败');
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`);
  }
}

function assertDeepEquals(actual, expected, message) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error(message || `期望 ${b}，实际 ${a}`);
  }
}

function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(message || '值不应为 null/undefined');
  }
}

function assertTrue(condition, message) {
  if (!condition) throw new Error(message || '期望为 true');
}

function assertFalse(condition, message) {
  if (condition) throw new Error(message || '期望为 false');
}

// ============================================
// Game 类核心实现（复制自 game.js，使用 CommonJS 兼容格式）
// ============================================

class Game {
  constructor(difficulty = 'easy') {
    this.difficulty = difficulty;
    this.setDifficulty(difficulty);
    this.board = [];
    this.state = 'idle';
    this.flagsPlaced = 0;
    this.firstClickDone = false;
    this.startTime = null;
    this.elapsedTime = 0;
    // 回调
    this.onGameStart = null;
    this.onGameOver = null;
    this.onFlagChange = null;
    this.onCellUpdate = null;
  }

  setDifficulty(difficulty) {
    const configs = {
      easy:   { rows: 9,  cols: 9,  mines: 10 },
      medium: { rows: 16, cols: 16, mines: 40 },
      hard:   { rows: 30, cols: 16, mines: 99 }
    };
    const config = configs[difficulty] || configs.easy;
    this.difficulty = difficulty;
    this.rows = config.rows;
    this.cols = config.cols;
    this.mineCount = config.mines;
    this.flagsPlaced = 0;
  }

  initBoard() {
    this.board = [];
    for (let r = 0; r < this.rows; r++) {
      this.board[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.board[r][c] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0
        };
      }
    }
    this.state = 'idle';
    this.flagsPlaced = 0;
    this.firstClickDone = false;
    this.elapsedTime = 0;
  }

  placeMines(safeRow, safeCol) {
    const safeZone = new Set();
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = safeRow + dr;
        const nc = safeCol + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          safeZone.add(`${nr},${nc}`);
        }
      }
    }

    const available = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!safeZone.has(`${r},${c}`)) {
          available.push({ r, c });
        }
      }
    }

    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }

    const mineCount = Math.min(this.mineCount, available.length);
    for (let i = 0; i < mineCount; i++) {
      const { r, c } = available[i];
      this.board[r][c].isMine = true;
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.board[r][c].isMine) {
          this.board[r][c].adjacentMines = this._countAdjacentMines(r, c);
        }
      }
    }

    this.firstClickDone = true;
  }

  handleReveal(row, col) {
    if (this.state === 'won' || this.state === 'lost' || this.state === 'paused') return;

    const cell = this.board[row]?.[col];
    if (!cell || cell.isRevealed || cell.isFlagged) return;

    if (!this.firstClickDone) {
      this.placeMines(row, col);
      this.state = 'playing';
      if (this.onGameStart) this.onGameStart();
    }

    if (this.state === 'idle') {
      this.state = 'playing';
      if (this.onGameStart) this.onGameStart();
    }

    if (cell.isMine) {
      this.state = 'lost';
      if (this.onGameOver) this.onGameOver('lost', row, col);
      return;
    }

    this._floodFill(row, col);

    if (this._checkWin()) {
      this.state = 'won';
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.board[r][c].isMine && !this.board[r][c].isFlagged) {
            this.board[r][c].isFlagged = true;
            this.flagsPlaced++;
          }
        }
      }
      if (this.onGameOver) this.onGameOver('won');
    }
  }

  handleFlag(row, col) {
    if (this.state === 'won' || this.state === 'lost' || this.state === 'paused') return;
    if (this.state === 'idle') return;

    const cell = this.board[row]?.[col];
    if (!cell || cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    this.flagsPlaced += cell.isFlagged ? 1 : -1;

    if (this.onFlagChange) this.onFlagChange(this.flagsPlaced);
    if (this.onCellUpdate) this.onCellUpdate(row, col, cell);
  }

  handleChord(row, col) {
    if (this.state !== 'playing') return;

    const cell = this.board[row]?.[col];
    if (!cell || !cell.isRevealed || cell.adjacentMines === 0) return;

    let flagCount = 0;
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          if (this.board[nr][nc].isFlagged) flagCount++;
          else if (!this.board[nr][nc].isRevealed) neighbors.push({ r: nr, c: nc });
        }
      }
    }

    if (flagCount === cell.adjacentMines) {
      for (const { r, c } of neighbors) {
        this.handleReveal(r, c);
      }
    }
  }

  _floodFill(row, col) {
    const cell = this.board[row]?.[col];
    if (!cell || cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;
    if (this.onCellUpdate) this.onCellUpdate(row, col, cell);

    if (cell.adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
            this._floodFill(nr, nc);
          }
        }
      }
    }
  }

  _checkWin() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.board[r][c];
        if (!cell.isMine && !cell.isRevealed) return false;
      }
    }
    return true;
  }

  _countAdjacentMines(row, col) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          if (this.board[nr][nc].isMine) count++;
        }
      }
    }
    return count;
  }

  getRemainingMines() {
    return this.mineCount - this.flagsPlaced;
  }
}

// ============================================
// 辅助函数
// ============================================

/** 统计棋盘中的地雷总数 */
function countTotalMines(game) {
  let count = 0;
  for (let r = 0; r < game.rows; r++) {
    for (let c = 0; c < game.cols; c++) {
      if (game.board[r][c].isMine) count++;
    }
  }
  return count;
}

/** 统计已揭晓格子数 */
function countRevealed(game) {
  let count = 0;
  for (let r = 0; r < game.rows; r++) {
    for (let c = 0; c < game.cols; c++) {
      if (game.board[r][c].isRevealed) count++;
    }
  }
  return count;
}

/** 统计已标记格子数 */
function countFlagged(game) {
  let count = 0;
  for (let r = 0; r < game.rows; r++) {
    for (let c = 0; c < game.cols; c++) {
      if (game.board[r][c].isFlagged) count++;
    }
  }
  return count;
}

/** 找一个有地雷的位置 */
function findMine(game) {
  for (let r = 0; r < game.rows; r++) {
    for (let c = 0; c < game.cols; c++) {
      if (game.board[r][c].isMine) return { r, c };
    }
  }
  return null;
}

/** 设置一个最小化的测试棋盘（手动控制） */
function setupManualBoard(rows, cols) {
  const game = new Game();
  game.rows = rows;
  game.cols = cols;
  game.mineCount = 0;
  game.board = [];
  for (let r = 0; r < rows; r++) {
    game.board[r] = [];
    for (let c = 0; c < cols; c++) {
      game.board[r][c] = {
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0
      };
    }
  }
  return game;
}

// ============================================
// 测试用例
// ============================================

// ========== 第一部分：构造函数和难度配置 ==========

test('T01: 构造函数 - 默认难度 easy', () => {
  const game = new Game();
  assertEquals(game.difficulty, 'easy');
  assertEquals(game.rows, 9);
  assertEquals(game.cols, 9);
  assertEquals(game.mineCount, 10);
  assertEquals(game.state, 'idle');
  assertEquals(game.flagsPlaced, 0);
  assertEquals(game.firstClickDone, false);
  assertEquals(game.elapsedTime, 0);
});

test('T02: 构造函数 - medium 难度', () => {
  const game = new Game('medium');
  assertEquals(game.difficulty, 'medium');
  assertEquals(game.rows, 16);
  assertEquals(game.cols, 16);
  assertEquals(game.mineCount, 40);
});

test('T03: 构造函数 - hard 难度', () => {
  const game = new Game('hard');
  assertEquals(game.difficulty, 'hard');
  assertEquals(game.rows, 30);
  assertEquals(game.cols, 16);
  assertEquals(game.mineCount, 99);
});

test('T04: setDifficulty - 切换难度', () => {
  const game = new Game('easy');
  assertEquals(game.rows, 9);
  assertEquals(game.cols, 9);
  assertEquals(game.mineCount, 10);

  game.setDifficulty('medium');
  assertEquals(game.difficulty, 'medium');
  assertEquals(game.rows, 16);
  assertEquals(game.cols, 16);
  assertEquals(game.mineCount, 40);

  game.setDifficulty('hard');
  assertEquals(game.difficulty, 'hard');
  assertEquals(game.rows, 30);
  assertEquals(game.cols, 16);
  assertEquals(game.mineCount, 99);
});

test('T05: setDifficulty - 无效难度回退到 easy', () => {
  const game = new Game('invalid');
  assertEquals(game.difficulty, 'invalid');
  assertEquals(game.rows, 9);
  assertEquals(game.cols, 9);
  assertEquals(game.mineCount, 10);
});

test('T06: setDifficulty - 切换时重置 flagsPlaced', () => {
  const game = new Game('easy');
  game.flagsPlaced = 5;
  game.setDifficulty('medium');
  assertEquals(game.flagsPlaced, 0);
});

// ========== 第二部分：initBoard 初始化棋盘 ==========

test('T07: initBoard - 初始化 9x9 棋盘', () => {
  const game = new Game('easy');
  game.initBoard();
  assertEquals(game.board.length, 9);
  assertEquals(game.board[0].length, 9);
  assertEquals(game.state, 'idle');
  assertEquals(game.flagsPlaced, 0);
  assertEquals(game.firstClickDone, false);
});

test('T08: initBoard - 初始化 16x16 棋盘', () => {
  const game = new Game('medium');
  game.initBoard();
  assertEquals(game.board.length, 16);
  assertEquals(game.board[0].length, 16);
});

test('T09: initBoard - 初始化 30x16 棋盘', () => {
  const game = new Game('hard');
  game.initBoard();
  assertEquals(game.board.length, 30);
  assertEquals(game.board[0].length, 16);
});

test('T10: initBoard - 所有格子初始状态正确', () => {
  const game = new Game('easy');
  game.initBoard();
  for (let r = 0; r < game.rows; r++) {
    for (let c = 0; c < game.cols; c++) {
      const cell = game.board[r][c];
      assertFalse(cell.isMine, `(${r},${c}) 初始不应有雷`);
      assertFalse(cell.isRevealed, `(${r},${c}) 初始不应揭晓`);
      assertFalse(cell.isFlagged, `(${r},${c}) 初始不应标记`);
      assertEquals(cell.adjacentMines, 0, `(${r},${c}) 初始相邻地雷数应为0`);
    }
  }
});

test('T11: initBoard - 重复初始化应重置状态', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'playing';
  game.flagsPlaced = 3;
  game.firstClickDone = true;
  game.board[0][0].isMine = true;

  game.initBoard();
  assertEquals(game.state, 'idle');
  assertEquals(game.flagsPlaced, 0);
  assertEquals(game.firstClickDone, false);
  assertFalse(game.board[0][0].isMine);
});

// ========== 第三部分：placeMines 地雷布局 ==========

test('T12: placeMines - 首点安全区域无雷', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(4, 4);

  // 首点(4,4) 及周围8格应无雷
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = 4 + dr;
      const c = 4 + dc;
      if (r >= 0 && r < 9 && c >= 0 && c < 9) {
        assertFalse(game.board[r][c].isMine, `安全区域(${r},${c})不应有雷`);
      }
    }
  }
});

test('T13: placeMines - 地雷数量正确 (easy)', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(4, 4);
  assertEquals(countTotalMines(game), 10);
});

test('T14: placeMines - 地雷数量正确 (medium)', () => {
  const game = new Game('medium');
  game.initBoard();
  game.placeMines(8, 8);
  assertEquals(countTotalMines(game), 40);
});

test('T15: placeMines - 地雷数量正确 (hard)', () => {
  const game = new Game('hard');
  game.initBoard();
  game.placeMines(15, 8);
  assertEquals(countTotalMines(game), 99);
});

test('T16: placeMines - 角落首点安全', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  // 只有 (0,0), (0,1), (1,0), (1,1) 在安全区
  assertFalse(game.board[0][0].isMine);
  assertFalse(game.board[0][1].isMine);
  assertFalse(game.board[1][0].isMine);
  assertFalse(game.board[1][1].isMine);
  assertEquals(countTotalMines(game), 10);
});

test('T17: placeMines - 边缘首点安全', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 4);
  // 安全区: (0,3)(0,4)(0,5)(1,3)(1,4)(1,5)
  assertFalse(game.board[0][3].isMine);
  assertFalse(game.board[0][4].isMine);
  assertFalse(game.board[0][5].isMine);
  assertFalse(game.board[1][3].isMine);
  assertFalse(game.board[1][4].isMine);
  assertFalse(game.board[1][5].isMine);
});

test('T18: placeMines - 设置 firstClickDone 标志', () => {
  const game = new Game('easy');
  game.initBoard();
  assertFalse(game.firstClickDone);
  game.placeMines(4, 4);
  assertTrue(game.firstClickDone);
});

test('T19: placeMines - 相邻地雷数已计算', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);

  // 验证所有非雷格子的 adjacentMines 已计算
  for (let r = 0; r < game.rows; r++) {
    for (let c = 0; c < game.cols; c++) {
      if (!game.board[r][c].isMine) {
        const expected = game._countAdjacentMines(r, c);
        assertEquals(game.board[r][c].adjacentMines, expected,
          `(${r},${c}) 相邻地雷数应为 ${expected}`);
      }
    }
  }
});

test('T20: placeMines - 当可用位置少于地雷数时（极端小棋盘）', () => {
  // 构造 2x2 棋盘，安全区占全部4格，无可用位置
  const game = new Game();
  game.rows = 2;
  game.cols = 2;
  game.mineCount = 10; // 远超可用位置
  game.initBoard();
  game.placeMines(0, 0);
  // 安全区覆盖全部4格，所以没有地雷
  assertEquals(countTotalMines(game), 0);
});

// ========== 第四部分：handleReveal 揭晓 ==========

test('T21: handleReveal - 首次点击安全格', () => {
  const game = new Game('easy');
  game.initBoard();
  game.handleReveal(0, 0);
  assertTrue(game.firstClickDone);
  assertEquals(game.state, 'playing');
  assertTrue(game.board[0][0].isRevealed);
});

test('T22: handleReveal - 首次点击触发 onGameStart 回调', () => {
  const game = new Game('easy');
  game.initBoard();
  let callbackFired = false;
  game.onGameStart = () => { callbackFired = true; };
  game.handleReveal(0, 0);
  assertTrue(callbackFired);
});

test('T23: handleReveal - 点击地雷失败', () => {
  const game = new Game('easy');
  game.initBoard();
  // 先手动布雷，找一颗雷
  game.placeMines(0, 0);
  game.state = 'playing';
  game.firstClickDone = true;
  const mine = findMine(game);
  assertNotNull(mine, '应找到一颗地雷');

  game.handleReveal(mine.r, mine.c);
  assertEquals(game.state, 'lost');
});

test('T24: handleReveal - 点击地雷触发 onGameOver 回调', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';
  game.firstClickDone = true;
  const mine = findMine(game);

  let callbackResult = null;
  let callbackRow = null;
  let callbackCol = null;
  game.onGameOver = (result, row, col) => {
    callbackResult = result;
    callbackRow = row;
    callbackCol = col;
  };

  game.handleReveal(mine.r, mine.c);
  assertEquals(callbackResult, 'lost');
  assertEquals(callbackRow, mine.r);
  assertEquals(callbackCol, mine.c);
});

test('T25: handleReveal - 已揭晓格子不能重复揭晓', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';
  game.firstClickDone = true;
  game.board[0][0].isRevealed = true;
  const wasRevealed = game.board[0][0].isRevealed;

  game.handleReveal(0, 0);
  assertEquals(game.board[0][0].isRevealed, wasRevealed); // 不应变化
});

test('T26: handleReveal - 已标记格子不能揭晓', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';
  game.firstClickDone = true;
  game.board[1][1].isFlagged = true;

  game.handleReveal(1, 1);
  assertFalse(game.board[1][1].isRevealed);
});

test('T27: handleReveal - 越界坐标安全处理', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';
  game.firstClickDone = true;

  // 不应抛出异常
  game.handleReveal(-1, 0);
  game.handleReveal(0, -1);
  game.handleReveal(99, 99);
  assertEquals(game.state, 'playing'); // 状态不变
});

// ========== 第五部分：Flood Fill ==========

test('T28: Flood Fill - 空白格触发大面积展开', () => {
  const game = new Game('easy');
  game.initBoard();
  // 只在角落放一颗雷
  game.board[8][8].isMine = true;
  game.mineCount = 1;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!game.board[r][c].isMine) {
        game.board[r][c].adjacentMines = game._countAdjacentMines(r, c);
      }
    }
  }
  game.firstClickDone = true;
  game.state = 'playing';

  game.handleReveal(0, 0);
  // 应该展开大部分格子（除了地雷及其相邻数字格）
  const revealed = countRevealed(game);
  assertTrue(revealed >= 60, `Flood Fill 应展开大部分格子，实际展开 ${revealed}`);
});

test('T29: Flood Fill - 数字格不触发递归', () => {
  // 构造一个3x3棋盘，中心是数字1（周围有一颗雷）
  const game = setupManualBoard(3, 3);
  game.board[2][2].isMine = true;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine) {
        game.board[r][c].adjacentMines = game._countAdjacentMines(r, c);
      }
    }
  }
  game.firstClickDone = true;
  game.state = 'playing';

  // 点击 (0,0) 这个空白格，触发 Flood Fill
  game.handleReveal(0, 0);
  // (1,1) 是数字 1，应该被展开但不应继续递归
  assertTrue(game.board[1][1].isRevealed, '(1,1) 应该被展开');
  assertEquals(game.board[1][1].adjacentMines, 1);
  // (2,2) 是雷，不应被展开
  assertFalse(game.board[2][2].isRevealed);
});

test('T30: Flood Fill - 不越过已标记格子', () => {
  const game = new Game('easy');
  game.initBoard();
  game.board[0][0].isMine = true;
  game.mineCount = 1;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!game.board[r][c].isMine) {
        game.board[r][c].adjacentMines = game._countAdjacentMines(r, c);
      }
    }
  }
  game.firstClickDone = true;
  game.state = 'playing';

  // 标记(0,1)为旗帜——Flood Fill 不应穿过它
  game.board[0][1].isFlagged = true;
  game.flagsPlaced = 1;

  game.handleReveal(8, 8);
  // (0,1) 不应被揭晓
  assertFalse(game.board[0][1].isRevealed, '已标记格子不应被揭晓');
});

// ========== 第六部分：handleFlag 标记 ==========

test('T31: handleFlag - 标记格子', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';

  game.handleFlag(5, 5);
  assertTrue(game.board[5][5].isFlagged);
  assertEquals(game.flagsPlaced, 1);
});

test('T32: handleFlag - 取消标记', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';
  game.board[5][5].isFlagged = true;
  game.flagsPlaced = 1;

  game.handleFlag(5, 5);
  assertFalse(game.board[5][5].isFlagged);
  assertEquals(game.flagsPlaced, 0);
});

test('T33: handleFlag - idle 状态不能标记', () => {
  const game = new Game('easy');
  game.initBoard();
  // state = 'idle', firstClickDone = false
  game.handleFlag(3, 3);
  assertFalse(game.board[3][3].isFlagged);
  assertEquals(game.flagsPlaced, 0);
});

test('T34: handleFlag - won 状态不能标记', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'won';
  game.board[3][3].isFlagged = false;

  game.handleFlag(3, 3);
  assertFalse(game.board[3][3].isFlagged);
});

test('T35: handleFlag - lost 状态不能标记', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'lost';
  game.board[3][3].isFlagged = false;

  game.handleFlag(3, 3);
  assertFalse(game.board[3][3].isFlagged);
});

test('T36: handleFlag - paused 状态不能标记', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'paused';
  game.firstClickDone = true;

  game.handleFlag(3, 3);
  assertFalse(game.board[3][3].isFlagged);
});

test('T37: handleFlag - 已揭晓格子不能标记', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';
  game.board[3][3].isRevealed = true;

  game.handleFlag(3, 3);
  assertFalse(game.board[3][3].isFlagged);
});

test('T38: handleFlag - 触发 onFlagChange 回调', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';

  let flagChangeCount = 0;
  game.onFlagChange = (count) => { flagChangeCount = count; };

  game.handleFlag(5, 5);
  assertEquals(flagChangeCount, 1);

  game.handleFlag(5, 5);
  assertEquals(flagChangeCount, 0);
});

test('T39: handleFlag - 触发 onCellUpdate 回调', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';

  let updatedRow = -1, updatedCol = -1, updatedCell = null;
  game.onCellUpdate = (row, col, cell) => {
    updatedRow = row;
    updatedCol = col;
    updatedCell = cell;
  };

  game.handleFlag(5, 5);
  assertEquals(updatedRow, 5);
  assertEquals(updatedCol, 5);
  assertTrue(updatedCell.isFlagged);
});

test('T40: handleFlag - 越界坐标安全处理', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';

  // 不应抛出异常
  game.handleFlag(-1, 0);
  game.handleFlag(99, 99);
  assertEquals(game.flagsPlaced, 0);
});

// ========== 第七部分：handleChord 和弦展开 ==========

test('T41: handleChord - 旗帜数匹配数字时展开', () => {
  // 构造场景：中心数字=2，周围有2面旗+2个未揭晓格
  const game = setupManualBoard(3, 3);
  game.board[0][0].isMine = true;
  game.board[0][1].isMine = true;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine) {
        game.board[r][c].adjacentMines = game._countAdjacentMines(r, c);
      }
    }
  }
  // (1,1) 是中心数字格，adjacentMines=2
  game.board[1][1].isRevealed = true;
  // 标记两个地雷
  game.board[0][0].isFlagged = true;
  game.board[0][1].isFlagged = true;
  game.flagsPlaced = 2;
  game.state = 'playing';
  game.firstClickDone = true;

  game.handleChord(1, 1);
  // 周围的非雷非标记格应该被展开
  // (0,2), (1,0), (1,2), (2,0), (2,1), (2,2) 中非雷的应该被展开
  assertTrue(game.board[1][0].isRevealed, '(1,0) 应被展开');
  assertTrue(game.board[1][2].isRevealed, '(1,2) 应被展开');
});

test('T42: handleChord - 旗帜数不匹配时不应展开', () => {
  const game = setupManualBoard(3, 3);
  game.board[0][0].isMine = true;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine) {
        game.board[r][c].adjacentMines = game._countAdjacentMines(r, c);
      }
    }
  }
  // (1,1) 中心数字=1，但标记了0个旗
  game.board[1][1].isRevealed = true;
  game.state = 'playing';
  game.firstClickDone = true;

  game.handleChord(1, 1);
  // 周围格子不应被展开
  assertFalse(game.board[0][0].isRevealed, '(0,0) 不应被展开');
  assertFalse(game.board[0][1].isRevealed, '(0,1) 不应被展开');
});

test('T43: handleChord - 非 playing 状态不能操作', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'paused';

  // 不应抛出异常
  game.handleChord(0, 0);
  assertEquals(game.state, 'paused');
});

test('T44: handleChord - 未揭晓格子不能触发', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';
  // (1,1) 未揭晓
  assertFalse(game.board[1][1].isRevealed);

  game.handleChord(1, 1);
  // 什么都不应发生
});

test('T45: handleChord - adjacentMines=0 的格子不能触发', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'playing';
  game.firstClickDone = true;
  // 设置一个已揭晓但 adjacentMines=0 的格子
  game.board[0][0].isRevealed = true;
  game.board[0][0].adjacentMines = 0;

  game.handleChord(0, 0);
  // 什么都不应发生（Chord 要求 adjacentMines > 0）
});

test('T46: handleChord - 越界坐标安全处理', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'playing';

  game.handleChord(-1, -1);
  game.handleChord(99, 99);
  // 不应抛出异常
});

test('T47: handleChord - 旗帜数匹配但踩雷时状态变为 lost', () => {
  // 构造场景：中心数字=1，标记了错误位置，Chord 会踩到雷
  const game = setupManualBoard(3, 3);
  game.board[2][2].isMine = true;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine) {
        game.board[r][c].adjacentMines = game._countAdjacentMines(r, c);
      }
    }
  }
  // (1,1) adjacentMines=1（因为(2,2)是雷）
  game.board[1][1].isRevealed = true;
  // 错误地标记了(0,0)（非雷），而(2,2)是真正的雷且未标记
  game.board[0][0].isFlagged = true;
  game.flagsPlaced = 1;
  game.state = 'playing';
  game.firstClickDone = true;

  game.handleChord(1, 1);
  // Chord 会展开所有未标记且未揭晓的邻居，包括(2,2)这颗雷
  assertEquals(game.state, 'lost');
});

// ========== 第八部分：状态机转换 ==========

test('T48: 状态机 - idle → playing（首次点击）', () => {
  const game = new Game('easy');
  game.initBoard();
  assertEquals(game.state, 'idle');
  game.handleReveal(4, 4);
  assertEquals(game.state, 'playing');
});

test('T49: 状态机 - playing → won（揭晓所有非雷格）', () => {
  // 使用 3x3 棋盘，1颗雷在角落，逐个揭晓非雷格来触发胜利
  const game = setupManualBoard(3, 3);
  game.board[2][2].isMine = true;
  game.mineCount = 1;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine) {
        game.board[r][c].adjacentMines = game._countAdjacentMines(r, c);
      }
    }
  }
  game.state = 'playing';
  game.firstClickDone = true;

  // 逐个揭晓所有非雷格
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine) {
        game.handleReveal(r, c);
      }
    }
  }
  assertEquals(game.state, 'won');
});

test('T50: 状态机 - playing → lost（踩雷）', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';
  game.firstClickDone = true;
  const mine = findMine(game);

  game.handleReveal(mine.r, mine.c);
  assertEquals(game.state, 'lost');
});

test('T51: 状态机 - 胜利后自动标记所有地雷', () => {
  // 使用 3x3 棋盘，逐个揭晓非雷格触发胜利，验证自动标记
  const game = setupManualBoard(3, 3);
  game.board[2][2].isMine = true;
  game.mineCount = 1;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine) {
        game.board[r][c].adjacentMines = game._countAdjacentMines(r, c);
      }
    }
  }
  game.state = 'playing';
  game.firstClickDone = true;
  game.flagsPlaced = 0;

  // 逐个揭晓所有非雷格
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine) {
        game.handleReveal(r, c);
      }
    }
  }
  assertEquals(game.state, 'won');
  assertTrue(game.board[2][2].isFlagged, '胜利后应自动标记地雷');
  assertEquals(game.flagsPlaced, 1);
});

test('T52: 状态机 - won 状态不能揭晓', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'won';

  game.handleReveal(4, 4);
  assertFalse(game.board[4][4].isRevealed);
});

test('T53: 状态机 - lost 状态不能揭晓', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'lost';

  game.handleReveal(4, 4);
  assertFalse(game.board[4][4].isRevealed);
});

test('T54: 状态机 - paused 状态不能揭晓', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'paused';
  game.firstClickDone = true;

  game.handleReveal(4, 4);
  assertFalse(game.board[4][4].isRevealed);
});

test('T55: 状态机 - playing → paused 需外部设置', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';

  // 模拟暂停
  game.state = 'paused';
  assertEquals(game.state, 'paused');

  // 恢复
  game.state = 'playing';
  assertEquals(game.state, 'playing');
});

// ========== 第九部分：_checkWin 胜利检测 ==========

test('T56: _checkWin - 所有非雷格已揭晓 → 胜利', () => {
  const game = setupManualBoard(3, 3);
  game.board[2][2].isMine = true;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine) {
        game.board[r][c].isRevealed = true;
      }
    }
  }
  assertTrue(game._checkWin());
});

test('T57: _checkWin - 存在未揭晓非雷格 → 未胜利', () => {
  const game = setupManualBoard(3, 3);
  game.board[2][2].isMine = true;
  // 只揭晓部分格子
  game.board[0][0].isRevealed = true;
  game.board[0][1].isRevealed = true;
  assertFalse(game._checkWin());
});

test('T58: _checkWin - 空棋盘 → 胜利', () => {
  const game = setupManualBoard(2, 2);
  // 没有地雷，所有格子未揭晓
  assertFalse(game._checkWin());
  // 揭晓所有格子
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      game.board[r][c].isRevealed = true;
    }
  }
  assertTrue(game._checkWin());
});

test('T59: _checkWin - 有已标记但未揭晓的非雷格 → 未胜利', () => {
  const game = setupManualBoard(3, 3);
  game.board[2][2].isMine = true;
  // 所有非雷格已揭晓，除了一个被错误标记的
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine && !(r === 0 && c === 0)) {
        game.board[r][c].isRevealed = true;
      }
    }
  }
  game.board[0][0].isFlagged = true;
  assertFalse(game._checkWin());
});

// ========== 第十部分：getRemainingMines ==========

test('T60: getRemainingMines - 初始剩余雷数 = mineCount', () => {
  const game = new Game('easy');
  game.initBoard();
  assertEquals(game.getRemainingMines(), 10);
});

test('T61: getRemainingMines - 标记后减少', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'playing';
  game.placeMines(0, 0);
  game.handleFlag(5, 5);
  assertEquals(game.getRemainingMines(), 9);
  game.handleFlag(5, 6);
  assertEquals(game.getRemainingMines(), 8);
});

test('T62: getRemainingMines - 取消标记后增加', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'playing';
  game.placeMines(0, 0);
  game.handleFlag(5, 5);
  assertEquals(game.getRemainingMines(), 9);
  game.handleFlag(5, 5); // 取消
  assertEquals(game.getRemainingMines(), 10);
});

test('T63: getRemainingMines - medium 难度', () => {
  const game = new Game('medium');
  game.initBoard();
  assertEquals(game.getRemainingMines(), 40);
});

test('T64: getRemainingMines - hard 难度', () => {
  const game = new Game('hard');
  game.initBoard();
  assertEquals(game.getRemainingMines(), 99);
});

test('T65: getRemainingMines - 可能为负数（标记过多）', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'playing';
  game.placeMines(0, 0);
  game.flagsPlaced = 15; // 超过10
  assertEquals(game.getRemainingMines(), -5);
});

// ========== 第十一部分：_countAdjacentMines ==========

test('T66: _countAdjacentMines - 无雷时返回0', () => {
  const game = setupManualBoard(3, 3);
  assertEquals(game._countAdjacentMines(1, 1), 0);
});

test('T67: _countAdjacentMines - 1颗相邻雷', () => {
  const game = setupManualBoard(3, 3);
  game.board[0][0].isMine = true;
  assertEquals(game._countAdjacentMines(1, 1), 1);
});

test('T68: _countAdjacentMines - 8颗相邻雷', () => {
  const game = setupManualBoard(3, 3);
  // 中心(1,1)周围全是雷
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!(r === 1 && c === 1)) {
        game.board[r][c].isMine = true;
      }
    }
  }
  assertEquals(game._countAdjacentMines(1, 1), 8);
});

test('T69: _countAdjacentMines - 角落格子（3个邻居）', () => {
  const game = setupManualBoard(3, 3);
  game.board[0][1].isMine = true;
  game.board[1][0].isMine = true;
  game.board[1][1].isMine = true;
  assertEquals(game._countAdjacentMines(0, 0), 3);
});

test('T70: _countAdjacentMines - 边缘格子（5个邻居）', () => {
  const game = setupManualBoard(3, 3);
  game.board[0][0].isMine = true;
  game.board[0][2].isMine = true;
  game.board[1][0].isMine = true;
  game.board[1][2].isMine = true;
  game.board[2][0].isMine = true;
  assertEquals(game._countAdjacentMines(0, 1), 4);
  // (0,1)邻居： (0,0)=雷,(0,2)=雷,(1,0)=雷,(1,1)=安全,(1,2)=雷 → 4个
});

// ========== 第十二部分：边界和异常情况 ==========

test('T71: 边界 - 已结束状态不可操作 (won)', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'won';
  game.firstClickDone = true;

  game.handleReveal(4, 4);
  game.handleFlag(4, 4);
  game.handleChord(4, 4);
  // 都不应有任何效果
  assertFalse(game.board[4][4].isRevealed);
  assertFalse(game.board[4][4].isFlagged);
});

test('T72: 边界 - 已结束状态不可操作 (lost)', () => {
  const game = new Game('easy');
  game.initBoard();
  game.state = 'lost';
  game.firstClickDone = true;

  game.handleReveal(4, 4);
  game.handleFlag(4, 4);
  game.handleChord(4, 4);
  assertFalse(game.board[4][4].isRevealed);
  assertFalse(game.board[4][4].isFlagged);
});

test('T73: 边界 - 暂停状态不可操作', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'paused';

  game.handleReveal(4, 4);
  game.handleFlag(4, 4);
  game.handleChord(4, 4);
  assertFalse(game.board[4][4].isRevealed);
  assertFalse(game.board[4][4].isFlagged);
});

test('T74: 边界 - idle 状态不能标记（首次点击前）', () => {
  const game = new Game('easy');
  game.initBoard();
  assertEquals(game.state, 'idle');

  game.handleFlag(3, 3);
  assertFalse(game.board[3][3].isFlagged);
});

test('T75: 边界 - idle 状态不能 Chord', () => {
  const game = new Game('easy');
  game.initBoard();
  assertEquals(game.state, 'idle');

  game.handleChord(4, 4);
  // 什么都不应发生
});

test('T76: 边界 - 同一个格子不可重复标记/揭晓', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';

  game.handleReveal(1, 1);
  const beforeFlag = game.board[1][1].isRevealed;

  // 已揭晓后不能标记
  game.handleFlag(1, 1);
  assertFalse(game.board[1][1].isFlagged);
});

test('T77: 边界 - 棋盘为0x0时（极端情况）', () => {
  const game = new Game();
  game.rows = 0;
  game.cols = 0;
  game.mineCount = 0;
  game.initBoard();
  assertEquals(game.board.length, 0);
  // 不应抛出异常
  game.handleReveal(0, 0);
  game.handleFlag(0, 0);
  game.handleChord(0, 0);
  assertEquals(game.getRemainingMines(), 0);
  assertTrue(game._checkWin());
});

test('T78: 边界 - 首点即踩雷的情况（理论上不应发生但测试鲁棒性）', () => {
  const game = new Game('easy');
  game.initBoard();
  // 手动在 (0,0) 放雷（不通过 placeMines）
  game.board[0][0].isMine = true;
  game.firstClickDone = true; // 跳过 placeMines
  game.state = 'playing';

  game.handleReveal(0, 0);
  assertEquals(game.state, 'lost');
});

test('T79: 边界 - 难度切换后重新 initBoard', () => {
  const game = new Game('easy');
  game.initBoard();
  assertEquals(game.rows, 9);
  assertEquals(game.board.length, 9);

  game.setDifficulty('medium');
  game.initBoard();
  assertEquals(game.rows, 16);
  assertEquals(game.board.length, 16);
});

test('T80: 集成 - 完整游戏流程（easy，胜利）', () => {
  const game = new Game('easy');
  game.initBoard();

  // 记录回调
  let gameStarted = false;
  let gameEnded = false;
  let endResult = null;
  game.onGameStart = () => { gameStarted = true; };
  game.onGameOver = (result) => { gameEnded = true; endResult = result; };

  // 模拟一个极端的简单场景：几乎无雷
  // 我们手动设置棋盘
  game.rows = 3;
  game.cols = 3;
  game.mineCount = 1;
  game.initBoard();
  game.board[2][2].isMine = true;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine) {
        game.board[r][c].adjacentMines = game._countAdjacentMines(r, c);
      }
    }
  }
  game.firstClickDone = true;
  game.state = 'playing';
  if (!gameStarted) game.onGameStart(); // 模拟

  // 揭晓所有非雷格
  game.handleReveal(0, 0);
  // 应该自动胜利
  assertEquals(game.state, 'won');
  assertTrue(game.board[2][2].isFlagged, '胜利后地雷应自动标记');
});

// ========== 第十三部分：回调函数完整性 ==========

test('T81: 回调 - onGameStart 仅首次点击触发', () => {
  const game = new Game('easy');
  game.initBoard();
  let callCount = 0;
  game.onGameStart = () => { callCount++; };

  game.handleReveal(4, 4); // 首次点击
  assertEquals(callCount, 1);

  game.handleReveal(4, 5); // 第二次点击
  assertEquals(callCount, 1); // 不应再触发
});

test('T82: 回调 - onGameOver won 回调', () => {
  // 使用 3x3 棋盘，逐个揭晓非雷格触发胜利
  const game = setupManualBoard(3, 3);
  game.board[2][2].isMine = true;
  game.mineCount = 1;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine) {
        game.board[r][c].adjacentMines = game._countAdjacentMines(r, c);
      }
    }
  }
  game.state = 'playing';
  game.firstClickDone = true;

  let result = null;
  game.onGameOver = (r) => { result = r; };
  // 逐个揭晓所有非雷格，最后一个触发 won
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (!game.board[r][c].isMine) {
        game.handleReveal(r, c);
      }
    }
  }
  assertEquals(result, 'won');
});

test('T83: 回调 - onGameOver lost 回调（含坐标）', () => {
  const game = new Game('easy');
  game.initBoard();
  game.placeMines(0, 0);
  game.state = 'playing';
  game.firstClickDone = true;
  const mine = findMine(game);

  let result = null, r = null, c = null;
  game.onGameOver = (res, row, col) => { result = res; r = row; c = col; };
  game.handleReveal(mine.r, mine.c);
  assertEquals(result, 'lost');
  assertEquals(r, mine.r);
  assertEquals(c, mine.c);
});

test('T84: 回调 - onCellUpdate 在 Flood Fill 时触发', () => {
  // 使用 5x5 手动棋盘，只有1颗雷在角落，确保 Flood Fill 大面积展开
  const game = setupManualBoard(5, 5);
  game.board[4][4].isMine = true;
  game.mineCount = 1;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (!game.board[r][c].isMine) {
        game.board[r][c].adjacentMines = game._countAdjacentMines(r, c);
      }
    }
  }
  game.state = 'playing';
  game.firstClickDone = true;

  const updatedCells = [];
  game.onCellUpdate = (row, col, cell) => {
    updatedCells.push({ row, col });
  };

  game.handleReveal(0, 0);
  // 5x5=25格，1颗雷在(4,4)，Flood Fill 应展开除雷和其相邻格外的所有格
  assertTrue(updatedCells.length >= 15, `Flood Fill 应触发多次 onCellUpdate，实际 ${updatedCells.length}`);
});

// ============================================
// 执行测试
// ============================================
console.log('🧪 扫雷游戏 - Game 类核心逻辑测试');
console.log('='.repeat(60));

for (const { name, fn } of tests) {
  try {
    fn();
    passed++;
    console.log(`✅ ${name}`);
  } catch (err) {
    failed++;
    console.log(`❌ ${name}`);
    console.log(`   错误: ${err.message}`);
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log('='.repeat(60));
console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败, ${tests.length} 总计`);
console.log(`⏱ 执行时间: ${elapsed}s`);
console.log(`📈 通过率: ${Math.round(passed / tests.length * 100)}%`);

if (failed > 0) {
  process.exit(1);
}
