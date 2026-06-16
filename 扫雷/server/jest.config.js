/**
 * Jest 测试配置
 * 用于运行 API 集成测试（需要 Supertest）
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>', '<rootDir>/../tests'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/game.test.js',   // 纯前端逻辑，无需 Jest
    '/tests/board.test.js'   // 纯前端 DOM，无需 Jest
  ],
  collectCoverageFrom: [
    'routes/**/*.js',
    '*.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  verbose: true,
  timeout: 10000
};
