import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers"
import type { TestAPI } from "vitest"
import type { Scope } from "./src"

declare module "vitest" {
  export interface JestAssertion<R = any>
    extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}

  export interface TestContext {
    scope: Scope
  }

  declare const it: TestAPI<TestContext>
}
