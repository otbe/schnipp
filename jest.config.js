module.exports = {
  collectCoverage: true,
  coverageReporters: ['text'],
  collectCoverageFrom: ['src/**/*.ts', '!src/http/exceptions/*.ts'],
  transform: {
    '^.+\\.ts?$': '<rootDir>/node_modules/ts-jest/preprocessor.js'
  },
  testRegex: '(/tests/.*)\\.(ts?|tsx?)$',
  testPathIgnorePatterns: ['/node_modules/', '/example/', '/dist/'],
  moduleFileExtensions: ['ts', 'json', 'js']
};
