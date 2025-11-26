module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js', '**/*.spec.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/scripts/**',
  ],
  moduleFileExtensions: ['js', 'json'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};


