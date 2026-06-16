/**
 * 游戏核心逻辑
 */
export class Game {
  constructor(difficulty = 'easy') {
    this.difficulty = difficulty;
    this.setDifficulty(difficulty);
    this.board = [];          // Cell[][]
    this.state = 'idle';      // idle | playing | paused | won | lost
    this.flagsPlaced = 0;
    this.firstClickDone = false;
    this.startTime = null;
    this.elapsedTime = 0;
  }

  /**
   * 设置难度
   */
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

  /**
   * 初始化棋盘（空棋盘，地雷在首次点击后布设）
   */
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

  /**
   * 布设地雷（排除安全格及其周围）
   */
  placeMines(safeRow, safeCol) {
    // 收集安全区域（安全格 + 周围8格）
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

    // 收集可用位置
    const available = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!safeZone.has(`${r},${c}`)) {
          available.push({ r, c });
        }
      }
    }

    // Fisher-Yates 洗牌
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }

    // 取前 mineCount 个放置地雷
    const mineCount = Math.min(this.mineCount, available.length);
    for (let i = 0; i < mineCount; i++) {
      const { r, c } = available[i];
      this.board[r][c].isMine = true;
    }

    // 计算每个格子的相邻地雷数
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.board[r][c].isMine) {
          this.board[r][c].adjacentMines = this._countAdjacentMines(r, c);
        }
      }
    }

    this.firstClickDone = true;
  }

  /**
   * 处理揭晓（左键点击）
   */
  handleReveal(row, col) {
    // 游戏已结束或已暂停
    if (this.state === 'won' || this.state === 'lost' || this.state === 'paused') return;

    const cell = this.board[row]?.[col];
    if (!cell || cell.isRevealed || cell.isFlagged) return;

    // 首次点击
    if (!this.firstClickDone) {
      this.placeMines(row, col);
      this.state = 'playing';
      // 触发计时器启动（由 app.js 处理）
      if (this.onGameStart) this.onGameStart();
    }

    if (this.state === 'idle') {
      this.state = 'playing';
      if (this.onGameStart) this.onGameStart();
    }

    // 点到地雷 → 失败
    if (cell.isMine) {
      this.state = 'lost';
      if (this.onGameOver) this.onGameOver('lost', row, col);
      return;
    }

    // Flood Fill 展开
    this._floodFill(row, col);

    // 检查胜利
    if (this._checkWin()) {
      this.state = 'won';
      // 自动标记所有地雷
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

  /**
   * 处理标记（右键点击）
   */
  handleFlag(row, col) {
    if (this.state === 'won' || this.state === 'lost' || this.state === 'paused') return;
    if (this.state === 'idle') return; // 首次点击前不能标记

    const cell = this.board[row]?.[col];
    if (!cell || cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    this.flagsPlaced += cell.isFlagged ? 1 : -1;

    if (this.onFlagChange) this.onFlagChange(this.flagsPlaced);
    if (this.onCellUpdate) this.onCellUpdate(row, col, cell);
  }

  /**
   * 双击/和弦快速展开 (P1)
   */
  handleChord(row, col) {
    if (this.state !== 'playing') return;

    const cell = this.board[row]?.[col];
    if (!cell || !cell.isRevealed || cell.adjacentMines === 0) return;

    // 统计周围旗帜数
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

    // 旗帜数等于数字时，打开周围未标记格
    if (flagCount === cell.adjacentMines) {
      for (const { r, c } of neighbors) {
        this.handleReveal(r, c);
      }
    }
  }

  /**
   * Flood Fill 展开
   */
  _floodFill(row, col) {
    const cell = this.board[row]?.[col];
    if (!cell || cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;
    if (this.onCellUpdate) this.onCellUpdate(row, col, cell);

    // 如果周围无地雷，递归展开
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

  /**
   * 检查胜利条件
   */
  _checkWin() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.board[r][c];
        if (!cell.isMine && !cell.isRevealed) return false;
      }
    }
    return true;
  }

  /**
   * 计算周围地雷数
   */
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

  /**
   * 获取剩余地雷数（显示用）
   */
  getRemainingMines() {
    return this.mineCount - this.flagsPlaced;
  }
}
