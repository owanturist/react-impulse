import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers"
import type { Scope } from "./src"

declare global {
  namespace jest {
    type Matchers<R = void, T = {}> = TestingLibraryMatchers<
      typeof expect.stringContaining,
      R
    >
  }

  const production: boolean
}

declare module "@vitest/runner" {
  export interface TestContext {
    scope: Scope
  }
}

interface Process {
  env: ProcessEnv
}

interface ProcessEnv {
  NODE_ENV: "development" | "test" | "production"
}

declare const process: Process
