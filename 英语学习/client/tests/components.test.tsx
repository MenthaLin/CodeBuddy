/**
 * tests/components.test.tsx - 组件渲染测试
 * English Fun Zone
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock framer-motion to avoid animation-related test issues
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('div', { ...props, ref }, children)),
    span: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('span', { ...props, ref }, children)),
    button: React.forwardRef(({ children, ...props }: any, ref: any) =>
      React.createElement('button', { ...props, ref }, children)),
  },
  AnimatePresence: ({ children }: any) => children,
}));

import GameCard from '@/components/common/GameCard';
import ComboIndicator from '@/components/common/ComboIndicator';
import DifficultyBadge from '@/components/common/DifficultyBadge';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Wrapper for router-dependent components
function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('GameCard 组件', () => {
  it('渲染游戏名称', () => {
    renderWithRouter(<GameCard gameType="spelling" />);
    expect(screen.getByText('拼词大作战')).toBeTruthy();
  });

  it('渲染游戏描述', () => {
    renderWithRouter(<GameCard gameType="grammar" />);
    expect(screen.getByText('找出句子中的语法错误，选择正确的修正方案')).toBeTruthy();
  });

  it('渲染游戏图标', () => {
    renderWithRouter(<GameCard gameType="listen" />);
    expect(screen.getByText('🎧')).toBeTruthy();
  });

  it('展示最佳分数', () => {
    renderWithRouter(<GameCard gameType="spelling" bestScore={150} />);
    expect(screen.getByText('150')).toBeTruthy();
  });

  it('展示已玩局数', () => {
    renderWithRouter(<GameCard gameType="match" totalPlayed={12} />);
    expect(screen.getByText('12')).toBeTruthy();
  });

  it('最佳分数为0时不展示', () => {
    renderWithRouter(<GameCard gameType="listen" bestScore={0} />);
    expect(screen.queryByText('最高')).toBeNull();
  });

  it('无统计数据时不展示统计区', () => {
    renderWithRouter(<GameCard gameType="grammar" />);
    expect(screen.queryByText('局')).toBeNull();
  });

  it('4种游戏类型都能正常渲染', () => {
    const types = ['spelling', 'match', 'grammar', 'listen'] as const;
    types.forEach(type => {
      const { unmount } = renderWithRouter(<GameCard gameType={type} />);
      expect(screen.getByText(/拼词大作战|单词连连看|语法改错|听音选词/)).toBeTruthy();
      unmount();
    });
  });
});

describe('ComboIndicator 组件', () => {
  it('combo < 2 不渲染', () => {
    const { container } = render(<ComboIndicator combo={0} />);
    expect(container.innerHTML).toBe('');
  });

  it('combo = 1 不渲染', () => {
    const { container } = render(<ComboIndicator combo={1} />);
    expect(container.innerHTML).toBe('');
  });

  it('combo >= 2 渲染连击数', () => {
    render(<ComboIndicator combo={3} />);
    expect(screen.getByText('3x')).toBeTruthy();
  });

  it('combo >= 3 渲染等级文字 GOOD!', () => {
    render(<ComboIndicator combo={3} />);
    expect(screen.getByText('GOOD!')).toBeTruthy();
  });

  it('combo = 10 渲染 GREAT!', () => {
    render(<ComboIndicator combo={10} />);
    expect(screen.getByText('GREAT!')).toBeTruthy();
  });

  it('combo = 20 渲染 PERFECT!', () => {
    render(<ComboIndicator combo={20} />);
    expect(screen.getByText('PERFECT!')).toBeTruthy();
  });
});

describe('DifficultyBadge 组件', () => {
  it('渲染等级标签', () => {
    render(<DifficultyBadge level="A1" />);
    expect(screen.getByText('A1')).toBeTruthy();
  });

  it('渲染中文等级名', () => {
    render(<DifficultyBadge level="B1" />);
    expect(screen.getByText('进阶')).toBeTruthy();
  });

  it('sm 尺寸不显示中文标签', () => {
    render(<DifficultyBadge level="C1" size="sm" />);
    expect(screen.getByText('C1')).toBeTruthy();
    expect(screen.queryByText('高级')).toBeNull();
  });

  it('lg 尺寸渲染', () => {
    render(<DifficultyBadge level="C2" size="lg" />);
    expect(screen.getByText('C2')).toBeTruthy();
    expect(screen.getByText('精通')).toBeTruthy();
  });

  it('showLabel=false 不显示中文', () => {
    render(<DifficultyBadge level="A2" showLabel={false} />);
    expect(screen.getByText('A2')).toBeTruthy();
    expect(screen.queryByText('基础')).toBeNull();
  });

  it('6种等级都渲染', () => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
    levels.forEach(level => {
      const { unmount } = render(<DifficultyBadge level={level} />);
      expect(screen.getByText(level)).toBeTruthy();
      unmount();
    });
  });
});

describe('ErrorBoundary 组件', () => {
  // 正常渲染子组件
  it('正常渲染子组件', () => {
    render(
      <ErrorBoundary type="route">
        <div>正常内容</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('正常内容')).toBeTruthy();
  });

  it('捕获子组件错误并展示错误UI', () => {
    // 禁用 console.error 避免测试输出混乱
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowingComponent = () => {
      throw new Error('测试错误信息');
    };

    render(
      <ErrorBoundary type="game">
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('游戏出错')).toBeTruthy();
    expect(screen.getByText('测试错误信息')).toBeTruthy();

    spy.mockRestore();
  });

  it('fatal 类型展示刷新按钮', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowingComponent = () => {
      throw new Error('致命错误');
    };

    render(
      <ErrorBoundary type="fatal">
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('应用崩溃')).toBeTruthy();
    expect(screen.getByText('刷新页面')).toBeTruthy();

    spy.mockRestore();
  });

  it('route 类型展示重新加载按钮', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowingComponent = () => {
      throw new Error('路由错误');
    };

    render(
      <ErrorBoundary type="route">
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('页面加载失败')).toBeTruthy();
    expect(screen.getByText('重新加载')).toBeTruthy();

    spy.mockRestore();
  });

  it('自定义 fallback', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowingComponent = () => {
      throw new Error('自定义错误');
    };

    render(
      <ErrorBoundary type="game" fallback={<div>自定义降级UI</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('自定义降级UI')).toBeTruthy();

    spy.mockRestore();
  });
});

describe('ResultPanel 组件', () => {
  it('ResultPanel 导入无异常', async () => {
    // 验证 ResultPanel 可以被导入（不测试完整渲染，因为依赖 Modal/motion）
    const ResultPanel = (await import('@/components/game/ResultPanel')).default;
    expect(ResultPanel).toBeDefined();
    expect(typeof ResultPanel).toBe('function');
  });
});
