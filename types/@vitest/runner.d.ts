import type { Scope } from "../../src/Scope"

declare module "@vitest/runner" {
  export interface TestContext {
    scope: Scope
  }
}
