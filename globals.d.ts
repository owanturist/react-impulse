import type { Assertion, AsymmetricMatchersContaining } from "vitest"
import type { Scope } from "./src"

interface CustomMatchers<R> {
  toHaveEmittersSize(size: number): R
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}

  export interface TestContext {
    scope: Scope
  }

  declare const it: TestAPI<TestContext>
}
