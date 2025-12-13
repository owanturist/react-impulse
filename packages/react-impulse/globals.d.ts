import type { Assertion, AsymmetricMatchersContaining, TestAPI } from "vitest"

import type { Monitor } from "./src"

interface CustomMatchers<R> {
  toHaveEmittersSize(size: number): R
}

declare module "vitest" {
  // biome-ignore lint/suspicious/noExplicitAny: follows vitest types
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}

  export interface TestContext {
    monitor: Monitor
  }

  declare const it: TestAPI<TestContext>
}
