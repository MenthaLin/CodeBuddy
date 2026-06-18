import { Storage } from './storage.js';
import { userApi } from './api.js';

/**
 * 用户管理类
 */
export class UserManager {
  constructor() {
    this.user = null;       // { id, nickname, created_at }
    this.stats = null;      // { total_games, wins, losses, win_rate, best_easy, best_medium, best_hard }
    this.supabaseUid = null;
  }

  /**
   * 初始化：从缓存恢复用户状态
   */
  init() {
    const cached = Storage.getUser();
    if (cached) {
      this.user = cached.user;
      this.stats = cached.stats;
      this.supabaseUid = cached.supabaseUid;
      return true;
    }
    return false;
  }

  /**
   * 登录
   */
  async login(nickname) {
    // 生成或恢复匿名 UID
    if (!this.supabaseUid) {
      this.supabaseUid = this._generateUid();
    }

    const result = await userApi.login(nickname, this.supabaseUid);
    this.user = result.data.user;
    this.stats = result.data.stats;

    // 缓存到 localStorage
    Storage.setUser({
      user: this.user,
      stats: this.stats,
      supabaseUid: this.supabaseUid
    });

    return this.user;
  }

  /**
   * 退出登录
   */
  logout() {
    this.user = null;
    this.stats = null;
    this.supabaseUid = null;
    Storage.clearUser();
  }

  /**
   * 刷新用户统计
   */
  async refreshStats() {
    if (!this.supabaseUid) return;
    try {
      const result = await userApi.getStats(this.supabaseUid);
      this.stats = result.data;
      Storage.setUser({
        user: this.user,
        stats: this.stats,
        supabaseUid: this.supabaseUid
      });
    } catch (err) {
      console.warn('刷新统计失败:', err.message);
    }
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    return !!this.user && !!this.supabaseUid;
  }

  /**
   * 获取用户昵称
   */
  getNickname() {
    return this.user ? this.user.nickname : null;
  }

  /**
   * 生成唯一 UID（基于时间戳 + 随机数）
   */
  _generateUid() {
    const stored = localStorage.getItem('minesweeper_uid');
    if (stored) return stored;
    const uid = 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('minesweeper_uid', uid);
    return uid;
  }
}
