import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^server-only$': '<rootDir>/test/mocks/empty.ts',
    // O pacote expõe o build de browser só pelo campo legado "browser", que o Jest ignora.
    '^styled-components$':
      '<rootDir>/node_modules/styled-components/dist/styled-components.browser.cjs.js',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/*.test.{ts,tsx}'],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: { branches: 100, functions: 100, lines: 100, statements: 100 },
  },
}

export default createJestConfig(config)
