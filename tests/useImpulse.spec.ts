import { act, renderHook } from "@testing-library/react"

import { Compare, useImpulse } from "../src"
import * as utils from "../src/utils"

describe("without initial value", () => {
  it("should create an impulse with undefined initial value", () => {
    const { result } = renderHook(() => useImpulse())

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(result.current.getValue()).toBeUndefined()
  })

  it("updates the impulse with a new value", () => {
    const { result } = renderHook(() => useImpulse<number>())

    result.current.setValue(1)

    expect(result.current.getValue()).toBe(1)
  })

  it("updates the impulse with a undefined", () => {
    const { result } = renderHook(() => useImpulse<number>())

    result.current.setValue(1)
    result.current.setValue(undefined)

    expect(result.current.getValue()).toBeUndefined()
  })
})

describe("with direct initial value", () => {
  it("creates an impulse with an initial value", () => {
    const initial = { count: 0 }

    const { result } = renderHook(() => useImpulse(initial))

    expect(result.current.getValue()).toBe(initial)
    expect(result.current.getValue()).toStrictEqual({ count: 0 })
  })

  it("keeps the same impulse during re-renders", () => {
    const initial = { count: 0 }

    const { result, rerender } = renderHook(() => useImpulse(initial))

    const firstResult = result.current

    rerender(initial)

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue()).toStrictEqual({ count: 0 })
  })

  it("does not create new impulse when the initial value changes", () => {
    const initial = { count: 0 }

    const { result, rerender } = renderHook(() => useImpulse(initial))

    const firstResult = result.current

    rerender({ count: 1 })

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue()).toStrictEqual({ count: 0 })
  })
})

describe("with lazy initial value", () => {
  it("creates a impulse with an initial value", () => {
    const initial = { count: 0 }
    const init = vi.fn(() => initial)

    const { result } = renderHook(() => useImpulse(init))

    expect(result.current.getValue()).toBe(initial)
    expect(result.current.getValue()).toStrictEqual({ count: 0 })
    expect(init).toHaveBeenCalledOnce()
  })

  it("keeps the same impulse during re-renders", () => {
    const initial = { count: 0 }
    const init = vi.fn(() => initial)

    const { result, rerender } = renderHook(() => useImpulse(init))

    const firstResult = result.current

    rerender(init)

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue()).toStrictEqual({ count: 0 })
    expect(init).toHaveBeenCalledOnce()
  })

  it("does not create new impulse when the init return value changes", () => {
    let initial = { count: 0 }
    const init = vi.fn(() => initial)

    const { result, rerender } = renderHook(() => useImpulse(init))

    const firstResult = result.current

    initial = { count: 1 }
    rerender(init)

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue()).toStrictEqual({ count: 0 })
    expect(init).toHaveBeenCalledOnce()
  })

  it("does not create new impulse when the init function changes", () => {
    const initial = { count: 0 }
    let init = vi.fn(() => initial)

    const { result, rerender } = renderHook(() => useImpulse(init))

    const firstResult = result.current

    init = vi.fn(() => initial)
    rerender(init)

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue()).toStrictEqual({ count: 0 })
    expect(init).not.toHaveBeenCalled()
  })
})

describe("with compare function", () => {
  it("applies eq by default", () => {
    const spy_eq = vi.spyOn(utils, "eq")
    const { result } = renderHook(() => useImpulse(0))

    expect(spy_eq).not.toHaveBeenCalled()

    act(() => {
      result.current.setValue((x) => x + 1)
    })

    expect(spy_eq).toHaveBeenCalledOnce()
    expect(spy_eq).toHaveBeenLastCalledWith(0, 1)
  })

  it("applies eq when passing null as compare", () => {
    const spy_eq = vi.spyOn(utils, "eq")
    const { result } = renderHook(() => useImpulse(0, null))

    expect(spy_eq).not.toHaveBeenCalled()

    act(() => {
      result.current.setValue((x) => x + 1)
    })

    expect(spy_eq).toHaveBeenCalledOnce()
    expect(spy_eq).toHaveBeenLastCalledWith(0, 1)
  })

  it("does not call the function on init", () => {
    const compare = vi.fn()
    renderHook(() => useImpulse({ count: 0 }, compare))

    expect(compare).not.toHaveBeenCalled()
  })

  it("passes custom compare function", () => {
    const compare = vi.fn<[number], boolean>()
    const { result } = renderHook(() => useImpulse<number>(0, compare))

    act(() => {
      result.current.setValue(1)
    })

    expect(compare).toHaveBeenCalledOnce()
    expect(compare).toHaveBeenLastCalledWith(0, 1)
  })

  it("updates compare function on re-render", () => {
    const compare_1 = vi.fn().mockImplementation(Object.is)
    const compare_2 = vi.fn().mockImplementation(Object.is)
    const spy_eq = vi.spyOn(utils, "eq")

    const { result, rerender } = renderHook(
      (compare: null | Compare<number>) => useImpulse<number>(0, compare),
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
    vi.clearAllMocks()

    rerender(null)
    act(() => {
      result.current.setValue((x) => x + 1)
    })
    expect(compare_2).not.toHaveBeenCalled()
    expect(spy_eq).toHaveBeenCalledOnce()
    expect(spy_eq).toHaveBeenLastCalledWith(2, 3)
  })
})
