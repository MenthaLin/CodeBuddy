/**
 * 棋盘渲染类
 */
export class Board {
  constructor(containerEl, game) {
    this.container = containerEl;
    this.game = game;
    this.cellElements = [];  // 二维 DOM 元素数组
  }

  /**
   * 渲染棋盘
   */
  render() {
    this.container.innerHTML = '';
    this.cellElements = [];
    const { rows, cols } = this.game;

    this.container.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;
    this.container.style.gridTemplateRows = `repeat(${rows}, var(--cell-size))`;

    for (let r = 0; r < rows; r++) {
      this.cellElements[r] = [];
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        // 左键点击
        cell.addEventListener('click', (e) => {
          e.preventDefault();
          this.game.handleReveal(r, c);
        });

        // 右键标记
        cell.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.game.handleFlag(r, c);
        });

        // 移动端长按标记（600ms）
        let longPressTimer;
        cell.addEventListener('touchstart', (e) => {
          longPressTimer = setTimeout(() => {
            e.preventDefault();
            this.game.handleFlag(r, c);
          }, 600);
        });
        cell.addEventListener('touchend', () => clearTimeout(longPressTimer));
        cell.addEventListener('touchmove', () => clearTimeout(longPressTimer));

        this.container.appendChild(cell);
        this.cellElements[r][c] = cell;
      }
    }
  }

  /**
   * 更新单个格子
   */
  updateCell(row, col, cellData) {
    const el = this.cellElements[row]?.[col];
    if (!el) return;

    // 清除之前的样式
    el.className = 'cell';
    el.textContent = '';

    if (cellData.isRevealed) {
      el.classList.add('revealed');
      if (cellData.isMine) {
        el.classList.add('mine');
        el.textContent = '💣';
      } else if (cellData.adjacentMines > 0) {
        el.classList.add(`num-${cellData.adjacentMines}`);
        el.textContent = cellData.adjacentMines;
      }
    } else if (cellData.isFlagged) {
      el.classList.add('flagged');
      el.textContent = '🚩';
    }
  }

  /**
   * 更新整个棋盘（批量刷新）
   */
  updateAll() {
    for (let r = 0; r < this.game.rows; r++) {
      for (let c = 0; c < this.game.cols; c++) {
        this.updateCell(r, c, this.game.board[r][c]);
      }
    }
  }

  /**
   * 显示所有地雷（游戏结束时调用）
   */
  revealAllMines(explodedRow = -1, explodedCol = -1) {
    for (let r = 0; r < this.game.rows; r++) {
      for (let c = 0; c < this.game.cols; c++) {
        const cell = this.game.board[r][c];
        const el = this.cellElements[r]?.[c];
        if (!el) continue;

        if (cell.isMine && !cell.isFlagged && !cell.isRevealed) {
          el.classList.add('revealed', 'mine');
          el.textContent = '💣';
        }
        // 标记错误的旗帜
        if (cell.isFlagged && !cell.isMine) {
          el.classList.add('wrong-flag');
          el.textContent = '❌';
        }
        // 高亮引爆的地雷
        if (r === explodedRow && c === explodedCol) {
          el.classList.add('mine-exploded');
          el.textContent = '💥';
        }
        el.classList.add('game-over');
      }
    }
  }

  /**
   * 禁用所有格子点击
   */
  disableAll() {
    for (let r = 0; r < this.game.rows; r++) {
      for (let c = 0; c < this.game.cols; c++) {
        const el = this.cellElements[r]?.[c];
        if (el) el.classList.add('game-over');
      }
    }
  }
}
