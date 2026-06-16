/**
 * components/common/ErrorBoundary.tsx - 错误边界（3层）
 * English Fun Zone
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  type?: 'fatal' | 'route' | 'game';
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const typeStyles = {
  fatal: 'min-h-screen bg-red-50',
  route: 'min-h-[60vh] bg-yellow-50 rounded-2xl',
  game: 'min-h-[40vh] bg-orange-50 rounded-2xl',
};

const typeTitles = {
  fatal: '应用崩溃',
  route: '页面加载失败',
  game: '游戏出错',
};

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.type || 'fatal'}]`, error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const type = this.props.type || 'fatal';

    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={`${typeStyles[type]} flex items-center justify-center p-8`}>
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">😵</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {typeTitles[type]}
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              {this.state.error?.message || '发生了未知错误'}
            </p>
            {type !== 'fatal' && (
              <button
                onClick={this.handleReset}
                className="btn-primary text-sm"
              >
                重新加载
              </button>
            )}
            {type === 'fatal' && (
              <button
                onClick={() => window.location.reload()}
                className="btn-primary text-sm"
              >
                刷新页面
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
