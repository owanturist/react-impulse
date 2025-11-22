import type { Scope } from "@owanturist/signal"
import type { TestAPI } from "vitest"

declare module "vitest" {
  export interface TestContext {
    scope: Scope
  }

  declare const it: TestAPI<TestContext>
}
