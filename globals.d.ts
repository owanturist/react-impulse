import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers"

declare module "vitest" {
  export interface JestAssertion<R = any>
    extends TestingLibraryMatchers<typeof expect.stringContaining, R> {
    toHaveEmittersSize(size: number): R
  }
}
