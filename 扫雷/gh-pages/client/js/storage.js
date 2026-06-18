/**
 * localStorage 缓存管理
 */
export class Storage {
  static KEYS = {
    USER: 'minesweeper_user',
    BEST_SCORES: 'minesweeper_best_scores',
    SETTINGS: 'minesweeper_settings'
  };

  /**
   * 保存用户信息到本地缓存
   */
  static setUser(user) {
    try {
      localStorage.setItem(this.KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.warn('localStorage 存储失败:', e.message);
    }
  }

  /**
   * 获取缓存的用户信息
   */
  static getUser() {
    try {
      const data = localStorage.getItem(this.KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('localStorage 读取失败:', e.message);
      return null;
    }
  }

  /**
   * 清除用户缓存
   */
  static clearUser() {
    localStorage.removeItem(this.KEYS.USER);
  }

  /**
   * 保存最佳成绩到本地缓存
   */
  static setBestScore(difficulty, timeSeconds) {
    try {
      const scores = this.getBestScores();
      if (!scores[difficulty] || timeSeconds < scores[difficulty]) {
        scores[difficulty] = timeSeconds;
        localStorage.setItem(this.KEYS.BEST_SCORES, JSON.stringify(scores));
        return true; // 新纪录
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * 获取缓存的最佳成绩
   */
  static getBestScores() {
    try {
      const data = localStorage.getItem(this.KEYS.BEST_SCORES);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * 获取指定难度的最佳时间
   */
  static getBestScore(difficulty) {
    const scores = this.getBestScores();
    return scores[difficulty] || null;
  }
}
