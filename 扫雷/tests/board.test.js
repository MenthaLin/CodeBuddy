/**
 * Board rendering logic tests
 * 
 * Usage:
 *   node tests/board.test.js
 */

// ============================================
// Test framework
// ============================================
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// ============================================
// Mock DOM
// ============================================
class MockElement {
  constructor() {
    this.className = '';
    this.textContent = '';
    this.innerHTML = '';
    this.style = {};
    this.dataset = {};
    this.classList = {
      _classes: [],
      add(...classes) {
        classes.forEach(c => { if (!this._classes.includes(c)) this._classes.push(c); });
        this._updateClassName();
      },
      remove(...classes) {
        this._classes = this._classes.filter(c => !classes.includes(c));
        this._updateClassName();
      },
      contains(c) { return this._classes.includes(c); },
      toggle(c) {
        if (this.contains(c)) { this.remove(c); return false; }
        else { this.add(c); return true; }
      },
      _updateClassName() {
        this.owner.className = this._classes.join(' ');
      }
    };
    this.classList.owner = this;
    this.eventListeners = {};
  }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(handler);
  }
}

class MockContainer extends MockElement {
  constructor() {
    super();
    this.children = [];
  }

  appendChild(child) {
    this.children.push(child);
  }
}

// ============================================
// Board functions
// ============================================

function createBoard(rows, cols, container) {
  const cellElements = [];
  container.innerHTML = '';
  container.children = [];

  for (let r = 0; r < rows; r++) {
    cellElements[r] = [];
    for (let c = 0; c < cols; c++) {
      const cell = new MockElement();
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.className = 'cell';
      container.appendChild(cell);
      cellElements[r][c] = cell;
    }
  }

  return { cellElements, container };
}

function updateCell(cellElements, row, col, cellData) {
  const el = cellElements[row]?.[col];
  if (!el) return false;

  el.className = 'cell';
  el.textContent = '';

  if (cellData.isRevealed) {
    el.classList.add('revealed');
    if (cellData.isMine) {
      el.classList.add('mine');
      el.textContent = 'X';
    } else if (cellData.adjacentMines > 0) {
      el.classList.add(`num-${cellData.adjacentMines}`);
      el.textContent = String(cellData.adjacentMines);
    }
  } else if (cellData.isFlagged) {
    el.classList.add('flagged');
    el.textContent = 'F';
  }

  return true;
}

function revealAllMines(cellElements, board, explodedRow, explodedCol) {
  const rows = board.length;
  const cols = board[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      const el = cellElements[r]?.[c];
      if (!el) continue;

      if (cell.isMine && !cell.isFlagged && !cell.isRevealed) {
        el.classList.add('revealed', 'mine');
        el.textContent = 'X';
      }
      if (cell.isFlagged && !cell.isMine) {
        el.classList.add('wrong-flag');
        el.textContent = '!';
      }
      if (r === explodedRow && c === explodedCol) {
        el.classList.add('mine-exploded');
        el.textContent = '*';
      }
      el.classList.add('game-over');
    }
  }
}

// ============================================
// Test Cases
// ============================================

// B1: Board creation
test('B1: Board creation - correct size', () => {
  const container = new MockContainer();
  const { cellElements } = createBoard(9, 9, container);

  assertEquals(cellElements.length, 9, 'Should have 9 rows');
  assertEquals(cellElements[0].length, 9, 'Each row should have 9 cols');
  assertEquals(container.children.length, 81, 'Total 81 cells');
});

// B2: Cell data attributes
test('B2: Cell data attributes', () => {
  const container = new MockContainer();
  const { cellElements } = createBoard(3, 3, container);

  assertEquals(cellElements[0][0].dataset.row, 0);
  assertEquals(cellElements[0][0].dataset.col, 0);
  assertEquals(cellElements[2][2].dataset.row, 2);
  assertEquals(cellElements[2][2].dataset.col, 2);
});

// B3: Update unrevealed cell
test('B3: Update unrevealed cell', () => {
  const container = new MockContainer();
  const { cellElements } = createBoard(3, 3, container);

  const cellData = { isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 };
  updateCell(cellElements, 1, 1, cellData);

  const el = cellElements[1][1];
  assertEquals(el.className, 'cell');
  assertEquals(el.textContent, '');
});

// B4: Update revealed number cell
test('B4: Update revealed number cell', () => {
  const container = new MockContainer();
  const { cellElements } = createBoard(3, 3, container);

  const cellData = { isMine: false, isRevealed: true, isFlagged: false, adjacentMines: 3 };
  updateCell(cellElements, 1, 1, cellData);

  const el = cellElements[1][1];
  assert(el.classList.contains('revealed'), 'Should have revealed class');
  assert(el.classList.contains('num-3'), 'Should have num-3 class');
  assertEquals(el.textContent, '3');
});

// B5: Update revealed mine
test('B5: Update revealed mine', () => {
  const container = new MockContainer();
  const { cellElements } = createBoard(3, 3, container);

  const cellData = { isMine: true, isRevealed: true, isFlagged: false, adjacentMines: 0 };
  updateCell(cellElements, 1, 1, cellData);

  const el = cellElements[1][1];
  assert(el.classList.contains('revealed'));
  assert(el.classList.contains('mine'));
  assertEquals(el.textContent, 'X');
});

// B6: Update flagged cell
test('B6: Update flagged cell', () => {
  const container = new MockContainer();
  const { cellElements } = createBoard(3, 3, container);

  const cellData = { isMine: false, isRevealed: false, isFlagged: true, adjacentMines: 0 };
  updateCell(cellElements, 1, 1, cellData);

  const el = cellElements[1][1];
  assert(el.classList.contains('flagged'));
  assertEquals(el.textContent, 'F');
});

// B7: Game over - reveal all mines
test('B7: Game over - reveal all mines', () => {
  const container = new MockContainer();
  const { cellElements } = createBoard(3, 3, container);

  const board = [
    [{ isMine: false, isRevealed: false, isFlagged: false },
     { isMine: true, isRevealed: false, isFlagged: false },
     { isMine: false, isRevealed: false, isFlagged: false }],
    [{ isMine: false, isRevealed: false, isFlagged: false },
     { isMine: false, isRevealed: false, isFlagged: true },  // wrong flag
     { isMine: false, isRevealed: false, isFlagged: false }],
    [{ isMine: false, isRevealed: false, isFlagged: false },
     { isMine: false, isRevealed: false, isFlagged: false },
     { isMine: false, isRevealed: false, isFlagged: false }]
  ];

  revealAllMines(cellElements, board, 0, 1);

  assert(cellElements[0][1].classList.contains('mine-exploded'), 'Exploded mine should have class');
  assertEquals(cellElements[0][1].textContent, '*');

  assert(cellElements[1][1].classList.contains('wrong-flag'), 'Wrong flag should have class');
  assertEquals(cellElements[1][1].textContent, '!');
});

// B8: Three difficulty board sizes
test('B8: Three difficulty board sizes', () => {
  const c1 = new MockContainer();
  createBoard(9, 9, c1);
  assertEquals(c1.children.length, 81, 'Easy 9x9=81');

  const c2 = new MockContainer();
  createBoard(16, 16, c2);
  assertEquals(c2.children.length, 256, 'Medium 16x16=256');

  const c3 = new MockContainer();
  createBoard(30, 16, c3);
  assertEquals(c3.children.length, 480, 'Hard 30x16=480');
});

// B9: Out of bounds protection
test('B9: Out of bounds protection', () => {
  const container = new MockContainer();
  const { cellElements } = createBoard(3, 3, container);

  const result = updateCell(cellElements, 5, 5, { isRevealed: true, isMine: false, isFlagged: false, adjacentMines: 0 });
  assert(!result, 'Out of bounds should return false');
});

// ============================================
// Run Tests
// ============================================
console.log('Minesweeper - Board Rendering Tests');
console.log('='.repeat(50));

for (const { name, fn } of tests) {
  try {
    fn();
    passed++;
    console.log(`PASS ${name}`);
  } catch (err) {
    failed++;
    console.log(`FAIL ${name}`);
    console.log(`  Error: ${err.message}`);
  }
}

console.log('='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed, ${tests.length} total`);

if (failed > 0) {
  process.exit(1);
}

