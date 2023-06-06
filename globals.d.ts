import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers"
import type { Scope } from "./src"

declare global {
  namespace jest {
    interface Matchers<R = void>
      extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
  }
}

declare module "@vitest/runner" {
  export interface TestContext {
    scope: Scope
  }
}
