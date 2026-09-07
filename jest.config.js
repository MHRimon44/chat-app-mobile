module.exports = {
  clearMocks: true,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: true,
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
};
