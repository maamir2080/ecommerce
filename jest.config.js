module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/*.test.js', '**/*.spec.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/tests/**',
    '!src/scripts/**',
  ],
  moduleFileExtensions: ['js', 'json'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
};


