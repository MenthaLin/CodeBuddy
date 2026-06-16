/**
 * 计时器类
 */
export class Timer {
  constructor(displayElement) {
    this.displayEl = displayElement;
    this.startTime = null;
    this.elapsed = 0;       // 已用时间（秒）
    this.intervalId = null;
    this.running = false;
  }

  /**
   * 启动计时器
   */
  start() {
    if (this.running) return;
    this.startTime = Date.now() - this.elapsed * 1000;
    this.running = true;
    this.intervalId = setInterval(() => this._tick(), 100); // 100ms 刷新，保证流畅
  }

  /**
   * 暂停计时器
   */
  pause() {
    if (!this.running) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.running = false;
  }

  /**
   * 恢复计时器
   */
  resume() {
    if (this.running) return;
    this.startTime = Date.now() - this.elapsed * 1000;
    this.running = true;
    this.intervalId = setInterval(() => this._tick(), 100);
  }

  /**
   * 停止计时器
   */
  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.running = false;
    return this.elapsed;
  }

  /**
   * 重置计时器
   */
  reset() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.startTime = null;
    this.elapsed = 0;
    this.running = false;
    this._updateDisplay();
  }

  /**
   * 获取当前已用时间（秒）
   */
  getElapsed() {
    if (this.running) {
      return Math.floor((Date.now() - this.startTime) / 1000);
    }
    return this.elapsed;
  }

  /**
   * 滴答：更新显示
   */
  _tick() {
    this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this._updateDisplay();
  }

  /**
   * 更新显示元素
   */
  _updateDisplay() {
    if (!this.displayEl) return;
    const mins = Math.floor(this.elapsed / 60);
    const secs = this.elapsed % 60;
    this.displayEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}
