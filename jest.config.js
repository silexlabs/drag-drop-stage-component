module.exports = {
  projects: [
    {
      globals: {
        'ts-jest': {
          diagnostics: {ignoreCodes: [151001]}, // prevent anoying warning
        },
      },
      preset: 'ts-jest',
      runner: '@jest-runner/electron/main',
      testEnvironment: 'jsdom',
      testMatch: [__dirname + '/tests/**/*.test.jsdom.ts']
    },
    {
      globals: {
        'ts-jest': {
          diagnostics: {ignoreCodes: [151001]}, // prevent anoying warning
        },
      },
      preset: 'ts-jest',
      runner: '@jest-runner/electron',
      testEnvironment: '@jest-runner/electron/environment',
      testMatch: [__dirname + '/tests/**/*.test.electron.ts']
    }
  ]
};