module.exports = {
    roots: [
      '<rootDir>/src',
    ],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testEnvironment: 'node',
    testMatch: [
      '<rootDir>/**/__tests__/*.test.(ts|js)'
    ],
    moduleFileExtensions: [
      'ts',
      'tsx',
      'js',
      'jsx',
      'json',
      'node',
    ],
  }
  