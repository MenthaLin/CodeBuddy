import { leaderboardApi, gameApi, userApi } from './api.js';

/**
 * 排行榜和用户记录 UI 管理
 */
export class LeaderboardUI {
  constructor(userManager) {
    this.userManager = userManager;
    this.currentLeaderboardDiff = 'easy';
    this.currentRecordsFilter = 'all';
  }

  /**
   * 打开排行榜弹窗
   */
  async openLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    modal.classList.remove('hidden');

    // 绑定标签页切换
    const tabs = modal.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentLeaderboardDiff = tab.dataset.tabDiff;
        this.loadLeaderboard();
      });
    });

    // 加载数据
    this.currentLeaderboardDiff = 'easy';
    tabs.forEach(t => t.classList.remove('active'));
    tabs[0].classList.add('active');
    await this.loadLeaderboard();
  }

  /**
   * 加载排行榜数据
   */
  async loadLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '<tr><td colspan="4" class="empty-msg">加载中...</td></tr>';

    try {
      const result = await leaderboardApi.getLeaderboard(this.currentLeaderboardDiff);
      const list = result.data.leaderboard || [];

      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-msg">暂无排行数据，快去赢得一场游戏吧！</td></tr>';
        return;
      }

      tbody.innerHTML = list.map((item, i) => {
        const rankClass = item.rank <= 3 ? `rank-${item.rank}` : '';
        const timeStr = this._formatTime(item.time_seconds);
        const dateStr = item.completed_at
          ? new Date(item.completed_at).toLocaleDateString('zh-CN')
          : '-';
        return `
          <tr>
            <td class="${rankClass}">#${item.rank}</td>
            <td>${this._escapeHtml(item.nickname)}</td>
            <td>${timeStr}</td>
            <td>${dateStr}</td>
          </tr>`;
      }).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-msg">加载失败: ${this._escapeHtml(err.message)}</td></tr>`;
    }
  }

  /**
   * 打开我的记录弹窗
   */
  async openRecords() {
    if (!this.userManager.isLoggedIn()) {
      alert('请先登录');
      return;
    }

    const modal = document.getElementById('recordsModal');
    modal.classList.remove('hidden');

    // 绑定标签页切换
    const tabs = modal.querySelectorAll('.tab');
    tabs.forEach(tab => {
      const handler = () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentRecordsFilter = tab.dataset.recordsFilter;
        this.loadRecords();
      };
      tab.removeEventListener('click', handler);
      tab.addEventListener('click', handler);
    });

    // 加载统计和记录
    await this.loadStats();
    this.currentRecordsFilter = 'all';
    tabs.forEach(t => t.classList.remove('active'));
    tabs[0].classList.add('active');
    await this.loadRecords();
  }

  /**
   * 加载用户统计
   */
  async loadStats() {
    const statsContainer = document.getElementById('userStats');
    try {
      await this.userManager.refreshStats();
      const stats = this.userManager.stats;

      if (!stats) {
        statsContainer.innerHTML = '<p>暂无统计数据</p>';
        return;
      }

      const bestItems = [];
      if (stats.best_easy) bestItems.push(`<span class="stat-best-item">初级最佳: <strong>${this._formatTime(stats.best_easy)}</strong></span>`);
      if (stats.best_medium) bestItems.push(`<span class="stat-best-item">中级最佳: <strong>${this._formatTime(stats.best_medium)}</strong></span>`);
      if (stats.best_hard) bestItems.push(`<span class="stat-best-item">高级最佳: <strong>${this._formatTime(stats.best_hard)}</strong></span>`);

      statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-value">${stats.total_games}</div>
          <div class="stat-label">总场次</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.wins}</div>
          <div class="stat-label">胜利</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.win_rate}%</div>
          <div class="stat-label">胜率</div>
        </div>
        ${bestItems.length > 0 ? `<div class="stat-best">${bestItems.join('')}</div>` : ''}
      `;
    } catch (err) {
      statsContainer.innerHTML = `<p>加载统计失败: ${this._escapeHtml(err.message)}</p>`;
    }
  }

  /**
   * 加载游戏记录
   */
  async loadRecords() {
    const tbody = document.getElementById('recordsBody');
    tbody.innerHTML = '<tr><td colspan="4" class="empty-msg">加载中...</td></tr>';

    try {
      const diff = this.currentRecordsFilter === 'all' ? '' : this.currentRecordsFilter;
      const result = await gameApi.getRecords(this.userManager.supabaseUid, diff, 50, 0);
      const records = result.data.records || [];

      if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-msg">暂无游戏记录</td></tr>';
        return;
      }

      const diffNames = { easy: '初级', medium: '中级', hard: '高级' };

      tbody.innerHTML = records.map(record => {
        const resultClass = record.result === 'win' ? 'result-win' : 'result-loss';
        const resultText = record.result === 'win' ? '胜利 🎉' : '失败 💥';
        const dateStr = record.completed_at
          ? new Date(record.completed_at).toLocaleString('zh-CN')
          : '-';
        return `
          <tr>
            <td>${diffNames[record.difficulty] || record.difficulty}</td>
            <td class="${resultClass}">${resultText}</td>
            <td>${this._formatTime(record.time_seconds)}</td>
            <td>${dateStr}</td>
          </tr>`;
      }).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-msg">加载失败: ${this._escapeHtml(err.message)}</td></tr>`;
    }
  }

  /**
   * 格式化时间（秒 → MM:SS）
   */
  _formatTime(seconds) {
    if (seconds === null || seconds === undefined) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * 转义 HTML 特殊字符
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
