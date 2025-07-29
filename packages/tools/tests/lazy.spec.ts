import { Lazy } from "../src/lazy"

it("should not call initializer until _peek is called", () => {
  const init = vi.fn(() => 42)
  const lazy = Lazy(init)

  expect(init).not.toHaveBeenCalled()
  lazy()
  expect(init).toHaveBeenCalledTimes(1)
})

it("should return the same value on multiple _peek calls", () => {
  let count = 0
  const lazy = Lazy(() => ++count)

  expect(lazy()).toBe(1)
  expect(lazy()).toBe(1)
})

it("should preserve value after initialization", () => {
  let count = 0
  const lazy = Lazy(() => ++count)

  lazy()

  expect(lazy()).toBe(1)
  expect(count).toBe(1)
})
