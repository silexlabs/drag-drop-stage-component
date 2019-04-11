module.exports = {
  projects: [
    {
      preset: 'ts-jest',
      runner: '@jest-runner/electron/main',
      testEnvironment: 'jsdom',
      testMatch: [__dirname + '/tests/**/*.test.jsdom.ts']
    },
    {
      preset: 'ts-jest',
      runner: '@jest-runner/electron',
      testEnvironment: '@jest-runner/electron/environment',
      testMatch: [__dirname + '/tests/**/*.test.electron.ts']
    }
  ]
};