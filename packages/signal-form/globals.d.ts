import type { TestAPI } from "vitest"
import type { Scope } from "@owanturist/signal"

declare module "vitest" {
  export interface TestContext {
    scope: Scope
  }

  declare const it: TestAPI<TestContext>
}
