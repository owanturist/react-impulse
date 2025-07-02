import { Lazy } from "../src/lazy"

it("should not call initializer until _peek is called", () => {
  const init = vi.fn(() => 42)
  const lazy = Lazy(init)

  expect(init).not.toHaveBeenCalled()
  lazy._peek()
  expect(init).toHaveBeenCalledTimes(1)
})

it("should return the same value on multiple _peek calls", () => {
  let count = 0
  const lazy = Lazy(() => ++count)

  expect(lazy._peek()).toBe(1)
  expect(lazy._peek()).toBe(1)
})

it("should map to a new Lazy with transformed value", () => {
  const lazy = Lazy(() => 10)
  const mapped = lazy._map((x) => x * 2)

  expect(mapped._peek()).toBe(20)
})

it("should not call transform until mapped _peek is called", () => {
  const transform = vi.fn((x: number) => x * 2)
  const lazy = Lazy(() => 5)
  const mapped = lazy._map(transform)

  expect(transform).not.toHaveBeenCalled()
  mapped._peek()
  expect(transform).toHaveBeenCalledWith(5)
})

it("should chain multiple _map calls", () => {
  const lazy = Lazy(() => 3)
  const mapped = lazy._map((x) => x + 1)._map((x) => x * 10)

  expect(mapped._peek()).toBe(40)
})

it("should preserve value after initialization", () => {
  let count = 0
  const lazy = Lazy(() => ++count)

  lazy._peek()

  expect(lazy._peek()).toBe(1)
  expect(count).toBe(1)
})

it("should map after initialization", () => {
  const lazy = Lazy(() => 7)

  lazy._peek()

  const transform = vi.fn((x: number) => x + 2)
  const mapped = lazy._map(transform)

  expect(transform).toHaveBeenCalledOnce()
  expect(mapped._peek()).toBe(9)
  expect(transform).toHaveBeenCalledOnce()
})
