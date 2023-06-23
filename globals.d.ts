import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers"

declare global {
  namespace jest {
    type Matchers<R = void, T = {}> = TestingLibraryMatchers<
      typeof expect.stringContaining,
      R
    >
  }
}

interface Process {
  env: ProcessEnv
}

interface ProcessEnv {
  NODE_ENV: "development" | "test" | "production"
}

declare const process: Process
