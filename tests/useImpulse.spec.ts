import { renderHook } from "@testing-library/react-hooks"

import { useImpulse } from "../src"

describe("with direct initial value", () => {
  it.concurrent("creates an impulse with an initial value", ({ scope }) => {
    const initial = { count: 0 }

    const { result } = renderHook(() => useImpulse(initial))

    expect(result.current.getValue(scope)).toBe(initial)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
  })

  it.concurrent("keeps the same impulse during re-renders", ({ scope }) => {
    const initial = { count: 0 }

    const { result, rerender } = renderHook(() => useImpulse(initial))

    const firstResult = result.current

    rerender(initial)

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
  })

  it.concurrent(
    "does not create new impulse when the initial value changes",
    ({ scope }) => {
      const initial = { count: 0 }

      const { result, rerender } = renderHook(() => useImpulse(initial))

      const firstResult = result.current

      rerender({ count: 1 })

      expect(result.current).toBe(firstResult)
      expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
    },
  )
})

describe("with lazy initial value", () => {
  it.concurrent("creates an impulse with an initial value", ({ scope }) => {
    const initial = { count: 0 }
    const init = vi.fn(() => initial)

    const { result } = renderHook(() => useImpulse(init))

    expect(result.current.getValue(scope)).toBe(initial)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
    expect(init).toHaveBeenCalledOnce()
  })

  it.concurrent("keeps the same impulse during re-renders", ({ scope }) => {
    const initial = { count: 0 }
    const init = vi.fn(() => initial)

    const { result, rerender } = renderHook(() => useImpulse(init))

    const firstResult = result.current

    rerender(init)

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
    expect(init).toHaveBeenCalledOnce()
  })

  it.concurrent(
    "does not create new impulse when the init return value changes",
    ({ scope }) => {
      let initial = { count: 0 }
      const init = vi.fn(() => initial)

      const { result, rerender } = renderHook(() => useImpulse(init))

      const firstResult = result.current

      initial = { count: 1 }
      rerender(init)

      expect(result.current).toBe(firstResult)
      expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
      expect(init).toHaveBeenCalledOnce()
    },
  )

  it.concurrent(
    "does not create new impulse when the init function changes",
    ({ scope }) => {
      const initial = { count: 0 }
      let init = vi.fn(() => initial)

      const { result, rerender } = renderHook(() => useImpulse(init))

      const firstResult = result.current

      init = vi.fn(() => initial)
      rerender(init)

      expect(result.current).toBe(firstResult)
      expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
      expect(init).not.toHaveBeenCalled()
    },
  )
})

describe("with compare function", () => {
  it.concurrent("applies Object.is by default", () => {
    const { result } = renderHook(() => useImpulse({ count: 0 }))

    expect(result.current.compare).toBe(Object.is)
  })

  it.concurrent("applies Object.is when passing null as compare", () => {
    const { result } = renderHook(() => useImpulse({ count: 0 }, null))

    expect(result.current.compare).toBe(Object.is)
  })

  it.concurrent("passes custom compare function", () => {
    const compare = vi.fn()
    const { result } = renderHook(() => useImpulse({ count: 0 }, compare))

    expect(result.current.compare).toBe(compare)
  })
})
