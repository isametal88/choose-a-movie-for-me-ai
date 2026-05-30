import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['**/src/**/*.spec.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.stories.ts',  // Storybook files — executed by Storybook, not Jest
    '!src/main.ts',
    '!src/environments/**',
    '!src/**/index.ts',      // Barrel re-exports — no logic; covered transitively
    // Platform bridge exclusions — require device/emulator; untestable in Jest (see CLAUDE.md)
    '!src/app/core/platform/webos-luna.bridge.ts',
    // Route files: lazy-loading lambdas are declarative config and cannot be exercised in unit tests
    '!src/app/app.routes.ts',
    // App config: DI factory bootstrapping (platform bridge selection) — tested indirectly via LUNA_BRIDGE token in unit tests
    '!src/app/app.config.ts',
    // webOS-specific entry points — require native webOS runtime; untestable in Jest
    '!src/main.webos.ts',
    '!src/polyfills.webos.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 100,
      statements: 100,
      functions: 100,
    },
  },
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@ds/(.*)$': '<rootDir>/src/app/design-system/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1',
  },
};

export default config;
