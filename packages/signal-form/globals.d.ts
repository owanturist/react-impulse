import type { Monitor } from "@owanturist/signal"
import type { TestAPI } from "vitest"

declare module "vitest" {
  export interface TestContext {
    monitor: Monitor
  }

  declare const it: TestAPI<TestContext>
}
