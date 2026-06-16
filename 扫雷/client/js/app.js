/**
 * 扫雷游戏 - 应用入口
 * 负责模块初始化和事件协调
 */
import { Game } from './game.js';
import { Board } from './board.js';
import { Timer } from './timer.js';
import { UserManager } from './user.js';
import { LeaderboardUI } from './leaderboard.js';
import { Storage } from './storage.js';
import { gameApi } from './api.js';

class App {
  constructor() {
    // 核心模块
    this.game = null;
    this.board = null;
    this.timer = null;
    this.userManager = new UserManager();
    this.leaderboardUI = new LeaderboardUI(this.userManager);

    // 当前选中的难度
    this.currentDifficulty = 'easy';

    // DOM 元素引用
    this.els = {};

    // 音效上下文
    this.audioCtx = null;

    this.init();
  }

  /**
   * 应用初始化
   */
  init() {
    this._cacheElements();
    this._initGame();
    this._initUser();
    this._bindEvents();
    this._initAudio();
    console.log('💣 扫雷游戏初始化完成！');
  }

  /**
   * 缓存 DOM 元素引用
   */
  _cacheElements() {
    const ids = [
      'board', 'mineCounter', 'timerDisplay', 'btnFace',
      'btnNewGame', 'btnPause', 'btnRecords', 'btnLeaderboard',
      'btnLogin', 'btnLogout', 'btnLoginConfirm',
      'userInfo', 'userNickname', 'loginNickname', 'loginError',
      'loginModal', 'leaderboardModal', 'recordsModal',
      'pauseOverlay', 'gameOverOverlay', 'gameOverContent',
      'btnResume', 'btnCloseLeaderboard', 'btnCloseRecords'
    ];
    ids.forEach(id => {
      this.els[id] = document.getElementById(id);
    });
  }

  /**
   * 初始化游戏
   */
  _initGame(difficulty = 'easy') {
    this.currentDifficulty = difficulty;
    this.game = new Game(difficulty);
    this.game.initBoard();

    // 设置游戏回调
    this.game.onGameStart = () => this.timer.start();
    this.game.onGameOver = (result, explodedRow, explodedCol) => this._handleGameOver(result, explodedRow, explodedCol);
    this.game.onFlagChange = (flagsPlaced) => this._updateMineCounter();
    this.game.onCellUpdate = (row, col, cell) => this.board.updateCell(row, col, cell);

    // 初始化计时器
    this.timer = new Timer(this.els.timerDisplay);
    this.timer.reset();

    // 初始化棋盘
    this.board = new Board(this.els.board, this.game);
    this.board.render();
    this._updateMineCounter();
    this._updateFace('smile');
    this._hideOverlays();

    // 更新难度按钮状态
    document.querySelectorAll('.btn-difficulty').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
    });
  }

  /**
   * 初始化用户
   */
  _initUser() {
    const loggedIn = this.userManager.init();
    if (loggedIn) {
      this._showLoggedInUI(this.userManager.getNickname());
    }
  }

  /**
   * 绑定事件
   */
  _bindEvents() {
    // 新游戏
    this.els.btnNewGame.addEventListener('click', () => this._initGame(this.currentDifficulty));

    // 难度切换
    document.querySelectorAll('.btn-difficulty').forEach(btn => {
      btn.addEventListener('click', () => this._initGame(btn.dataset.difficulty));
    });

    // 笑脸按钮（重新开始）
    this.els.btnFace.addEventListener('click', () => this._initGame(this.currentDifficulty));

    // 暂停/恢复
    this.els.btnPause.addEventListener('click', () => this._togglePause());
    this.els.btnResume.addEventListener('click', () => this._togglePause());

    // 排行榜
    this.els.btnLeaderboard.addEventListener('click', () => this.leaderboardUI.openLeaderboard());
    this.els.btnCloseLeaderboard.addEventListener('click', () => {
      this.els.leaderboardModal.classList.add('hidden');
    });

    // 我的记录
    this.els.btnRecords.addEventListener('click', () => this.leaderboardUI.openRecords());
    this.els.btnCloseRecords.addEventListener('click', () => {
      this.els.recordsModal.classList.add('hidden');
    });

    // 登录
    this.els.btnLogin.addEventListener('click', () => this._showLoginModal());
    this.els.btnLoginConfirm.addEventListener('click', () => this._handleLogin());
    this.els.loginNickname.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._handleLogin();
    });

    // 退出
    this.els.btnLogout.addEventListener('click', () => this._handleLogout());

    // 关闭弹窗（点击遮罩）
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.add('hidden');
      });
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(m => m.classList.add('hidden'));
      }
      if (e.key === 'F2') {
        e.preventDefault();
        this._initGame(this.currentDifficulty);
      }
    });
  }

  /**
   * 初始化音效
   */
  _initAudio() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.audioCtx = null;
    }
  }

  /**
   * 播放音效
   */
  _playSound(type) {
    if (!this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (type) {
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.08);
          break;
        case 'flag':
          osc.type = 'square';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.setValueAtTime(900, ctx.currentTime + 0.05);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.1);
          break;
        case 'explode':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.4, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
          break;
        case 'win':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523, ctx.currentTime);
          osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
          osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
          break;
      }
    } catch (e) {
      // 静默失败
    }
  }

  /**
   * 处理游戏结束
   */
  async _handleGameOver(result, explodedRow, explodedCol) {
    this.timer.stop();
    const elapsed = this.timer.getElapsed();

    if (result === 'lost') {
      this._playSound('explode');
      this._updateFace('dead');
      this.board.revealAllMines(explodedRow, explodedCol);
      this.board.disableAll();
      this._showGameOverOverlay('💥 游戏结束', `你踩到地雷了！用时 ${this._formatTime(elapsed)}`, false);
    } else if (result === 'won') {
      this._playSound('win');
      this._updateFace('cool');
      this.board.disableAll();

      // 检查是否新纪录
      let isNewBest = false;
      if (this.userManager.isLoggedIn()) {
        const prevBest = Storage.getBestScore(this.currentDifficulty);
        if (!prevBest || elapsed < prevBest) {
          isNewBest = true;
          Storage.setBestScore(this.currentDifficulty, elapsed);
        }
      } else {
        // 未登录也用 localStorage 记录
        isNewBest = Storage.setBestScore(this.currentDifficulty, elapsed);
      }

      this._showGameOverOverlay(
        '🎉 恭喜胜利！',
        `用时 ${this._formatTime(elapsed)}${isNewBest ? ' 🏆 新纪录！' : ''}`,
        isNewBest
      );
    }

    // 提交记录到服务器
    if (this.userManager.isLoggedIn()) {
      try {
        await gameApi.submitRecord(
          this.userManager.supabaseUid,
          this.currentDifficulty,
          result,
          elapsed
        );
      } catch (err) {
        console.warn('提交游戏记录失败:', err.message);
      }
    }
  }

  /**
   * 暂停/恢复
   */
  _togglePause() {
    if (this.game.state === 'playing') {
      this.game.state = 'paused';
      this.timer.pause();
      this.els.pauseOverlay.classList.remove('hidden');
    } else if (this.game.state === 'paused') {
      this.game.state = 'playing';
      this.timer.resume();
      this.els.pauseOverlay.classList.add('hidden');
    }
  }

  /**
   * 显示登录弹窗
   */
  _showLoginModal() {
    this.els.loginNickname.value = '';
    this.els.loginError.classList.add('hidden');
    this.els.loginModal.classList.remove('hidden');
    this.els.loginNickname.focus();
  }

  /**
   * 处理登录
   */
  async _handleLogin() {
    const nickname = this.els.loginNickname.value.trim();
    if (!nickname) {
      this._showLoginError('请输入昵称');
      return;
    }

    const regex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{1,50}$/;
    if (!regex.test(nickname)) {
      this._showLoginError('昵称格式不正确（仅支持中文、英文、数字、下划线，1-50字符）');
      return;
    }

    this.els.btnLoginConfirm.disabled = true;
    this.els.btnLoginConfirm.textContent = '登录中...';

    try {
      await this.userManager.login(nickname);
      this._showLoggedInUI(nickname);
      this.els.loginModal.classList.add('hidden');
    } catch (err) {
      this._showLoginError(err.message);
    } finally {
      this.els.btnLoginConfirm.disabled = false;
      this.els.btnLoginConfirm.textContent = '确认登录';
    }
  }

  /**
   * 处理退出登录
   */
  _handleLogout() {
    this.userManager.logout();
    this.els.btnLogin.classList.remove('hidden');
    this.els.userInfo.classList.add('hidden');
  }

  /**
   * 显示登录错误
   */
  _showLoginError(msg) {
    this.els.loginError.textContent = msg;
    this.els.loginError.classList.remove('hidden');
  }

  /**
   * 显示已登录 UI
   */
  _showLoggedInUI(nickname) {
    this.els.btnLogin.classList.add('hidden');
    this.els.userInfo.classList.remove('hidden');
    this.els.userNickname.textContent = `👤 ${nickname}`;
  }

  /**
   * 显示游戏结束遮罩
   */
  _showGameOverOverlay(title, detail, isNewBest) {
    const badge = isNewBest ? '<span class="new-record-badge">🏆 新纪录！</span>' : '';
    this.els.gameOverContent.innerHTML = `
      <div class="game-over-title">${title}</div>
      <div class="game-over-detail">${detail}${badge}</div>
      <button class="btn btn-primary" id="btnPlayAgain">🔄 再来一局</button>
    `;
    this.els.gameOverOverlay.classList.remove('hidden');

    // 绑定"再来一局"按钮
    document.getElementById('btnPlayAgain').addEventListener('click', () => {
      this._initGame(this.currentDifficulty);
    });
  }

  /**
   * 隐藏所有遮罩
   */
  _hideOverlays() {
    this.els.pauseOverlay.classList.add('hidden');
    this.els.gameOverOverlay.classList.add('hidden');
  }

  /**
   * 更新地雷计数器
   */
  _updateMineCounter() {
    const remaining = this.game.getRemainingMines();
    this.els.mineCounter.textContent = String(Math.max(0, remaining)).padStart(3, '0');
  }

  /**
   * 更新表情按钮
   */
  _updateFace(type) {
    const faces = { smile: '😊', dead: '😵', cool: '😎' };
    this.els.btnFace.textContent = faces[type] || '😊';
  }

  /**
   * 格式化时间
   */
  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
