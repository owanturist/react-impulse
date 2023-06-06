import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers"
import type { Scope } from "../../src/Scope"

declare global {
  namespace jest {
    type Matchers<R = void, T = {}> = TestingLibraryMatchers<
      typeof expect.stringContaining,
      R
    >
  }
}

declare module "@vitest/runner" {
  export interface TestContext {
    scope: Scope
  }
}


