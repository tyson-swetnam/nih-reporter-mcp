/**
 * Jest Configuration for NIH RePORTER MCP Server
 */
export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/index.js',
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.test.js',
  ],
  verbose: true,
};
