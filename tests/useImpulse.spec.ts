import { renderHook } from "@testing-library/react-hooks"
import { act } from "@testing-library/react"

import { Compare, useImpulse } from "../src"

describe("without initial value", () => {
  it.concurrent(
    "should create an impulse with undefined initial value",
    ({ scope }) => {
      const { result } = renderHook(() => useImpulse())

      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      expect(result.current.getValue(scope)).toBeUndefined()
    },
  )

  it.concurrent("updates the impulse with a new value", ({ scope }) => {
    const { result } = renderHook(() => useImpulse<number>())

    result.current.setValue(1)

    expect(result.current.getValue(scope)).toBe(1)
  })

  it.concurrent("updates the impulse with a undefined", ({ scope }) => {
    const { result } = renderHook(() => useImpulse<number>())

    result.current.setValue(1)
    result.current.setValue(undefined)

    expect(result.current.getValue(scope)).toBeUndefined()
  })
})

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
    const spy = vi.spyOn(Object, "is")
    const { result } = renderHook(() => useImpulse<number>(0))

    expect(spy).not.toHaveBeenCalled()

    act(() => {
      result.current.setValue((x) => x + 1)
    })

    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(0, 1)
  })

  it.concurrent("applies Object.is when passing null as compare", () => {
    const spy = vi.spyOn(Object, "is")
    const { result } = renderHook(() => useImpulse<number>(0, null))

    expect(spy).not.toHaveBeenCalled()

    act(() => {
      result.current.setValue((x) => x + 1)
    })

    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(0, 1)
  })

  it.concurrent("does not call the function on init", () => {
    const compare = vi.fn()
    renderHook(() => useImpulse({ count: 0 }, compare))

    expect(compare).not.toHaveBeenCalled()
  })

  it.concurrent("passes custom compare function", () => {
    const compare = vi.fn()
    const { result } = renderHook(() => useImpulse<number>(0, compare))

    act(() => {
      result.current.setValue(1)
    })

    expect(compare).toHaveBeenCalledOnce()
    expect(compare).toHaveBeenLastCalledWith(0, 1)
  })

  it.concurrent("updates compare function on re-render", () => {
    const compare_1 = vi.fn().mockImplementation(Object.is)
    const compare_2 = vi.fn().mockImplementation(Object.is)

    const { result, rerender } = renderHook(
      (compare: Compare<number>) => useImpulse<number>(0, compare),
      {
        initialProps: compare_1,
      },
    )

    act(() => {
      result.current.setValue((x) => x + 1)
    })

    expect(compare_1).toHaveBeenCalledOnce()
    expect(compare_1).toHaveBeenLastCalledWith(0, 1)
    vi.clearAllMocks()

    rerender(compare_2)

    act(() => {
      result.current.setValue((x) => x + 1)
    })

    expect(compare_1).not.toHaveBeenCalled()
    expect(compare_2).toHaveBeenCalledOnce()
    expect(compare_2).toHaveBeenLastCalledWith(1, 2)
  })
})
