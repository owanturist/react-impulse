import type { Assertion, AsymmetricMatchersContaining } from "vitest"

interface CustomMatchers<R> {
  toHaveEmittersSize(size: number): R
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
