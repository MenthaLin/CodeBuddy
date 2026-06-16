import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './docs/test-reports/coverage',
      include: [
        'src/lib/**/*.ts',
        'src/stores/**/*.ts',
        'src/hooks/**/*.ts',
        'src/components/**/*.tsx',
      ],
    },
  },
});
