import { act, renderHook } from "@testing-library/react"

import { type Compare, useImpulse, Impulse } from "../src"

describe("without initial value", () => {
  it("should create an impulse with undefined initial value", ({ scope }) => {
    const { result } = renderHook(() => useImpulse())

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(result.current.getValue(scope)).toBeUndefined()

    expectTypeOf(result.current).toEqualTypeOf<Impulse<undefined>>()
  })

  it("creates the impulse with narrowed setter", () => {
    const { result } = renderHook(() => useImpulse<boolean, false>())

    expectTypeOf(result.current).toEqualTypeOf<
      Impulse<undefined | boolean, false>
    >()
  })

  it("does not let to create an impulse with wider setter", ({ scope }) => {
    // @ts-expect-error boolean does not extend false
    const { result } = renderHook(() => useImpulse<false, boolean>())

    expectTypeOf(result.current.getValue(scope)).toEqualTypeOf<
      undefined | false
    >()
  })

  it("updates the impulse with a new value", ({ scope }) => {
    const { result } = renderHook(() => useImpulse<number>())

    result.current.setValue(1)

    expect(result.current.getValue(scope)).toBe(1)

    expectTypeOf(result.current).toEqualTypeOf<Impulse<undefined | number>>()
  })

  it("updates the impulse with a undefined", ({ scope }) => {
    const { result } = renderHook(() => useImpulse<number>())

    result.current.setValue(1)
    result.current.setValue(undefined)

    expect(result.current.getValue(scope)).toBeUndefined()
  })
})

describe("with direct initial value", () => {
  it("creates an impulse with an initial value", ({ scope }) => {
    const initial = { count: 0 }

    const { result } = renderHook(() => useImpulse(initial))

    expect(result.current.getValue(scope)).toBe(initial)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })

    expectTypeOf(result.current).toEqualTypeOf<Impulse<{ count: number }>>()
  })

  it("creates an impulse with narrowed setter", () => {
    const { result } = renderHook(() => useImpulse<boolean, false>(true))

    expectTypeOf(result.current).toEqualTypeOf<Impulse<boolean, false>>()
  })

  it("does not let to create an impulse with wider setter", ({ scope }) => {
    // @ts-expect-error boolean does not extend false
    const { result } = renderHook(() => useImpulse<false, boolean>(false))

    expectTypeOf(result.current.getValue(scope)).toEqualTypeOf<false>()
  })

  it("keeps the same impulse during re-renders", ({ scope }) => {
    const initial = { count: 0 }

    const { result, rerender } = renderHook(() => useImpulse(initial))

    const firstResult = result.current

    rerender(initial)

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
  })

  it("does not create new impulse when the initial value changes", ({
    scope,
  }) => {
    const initial = { count: 0 }

    const { result, rerender } = renderHook(() => useImpulse(initial))

    const firstResult = result.current

    rerender({ count: 1 })

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
  })
})

describe("with lazy initial value", () => {
  it("creates a impulse with an initial value", ({ scope }) => {
    const initial = { count: 0 }
    const init = vi.fn(() => initial)

    const { result } = renderHook(() => useImpulse(init))

    expect(result.current.getValue(scope)).toBe(initial)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
    expect(init).toHaveBeenCalledOnce()
  })

  it("keeps the same impulse during re-renders", ({ scope }) => {
    const initial = { count: 0 }
    const init = vi.fn(() => initial)

    const { result, rerender } = renderHook(() => useImpulse(init))

    const firstResult = result.current

    rerender(init)

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
    expect(init).toHaveBeenCalledOnce()
  })

  it("does not create new impulse when the init return value changes", ({
    scope,
  }) => {
    let initial = { count: 0 }
    const init = vi.fn(() => initial)

    const { result, rerender } = renderHook(() => useImpulse(init))

    const firstResult = result.current

    initial = { count: 1 }
    rerender(init)

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
    expect(init).toHaveBeenCalledOnce()
  })

  it("does not create new impulse when the init function changes", ({
    scope,
  }) => {
    const initial = { count: 0 }
    let init = vi.fn(() => initial)

    const { result, rerender } = renderHook(() => useImpulse(init))

    const firstResult = result.current

    init = vi.fn(() => initial)
    rerender(init)

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
    expect(init).not.toHaveBeenCalled()
  })

  it("passes scope as an argument", ({ scope }) => {
    const impulse = Impulse.of(1)

    const { result } = renderHook(() =>
      useImpulse((scope) => impulse.getValue(scope).toFixed(2)),
    )

    expect(result.current.getValue(scope)).toBe("1.00")
  })
})

describe("with compare function", () => {
  it("applies Object.is by default", () => {
    const { result } = renderHook(() => useImpulse(0))

    expect(Object.is).not.toHaveBeenCalled()

    act(() => {
      result.current.setValue((x) => x + 1)
    })

    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith(0, 1)
  })

  it("applies Object.is when passing null as compare", () => {
    const { result } = renderHook(() => useImpulse(0, { compare: null }))

    expect(Object.is).not.toHaveBeenCalled()

    act(() => {
      result.current.setValue((x) => x + 1)
    })

    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith(0, 1)
  })

  it("does not call the function on init", () => {
    const compare = vi.fn()
    renderHook(() => useImpulse({ count: 0 }, { compare }))

    expect(compare).not.toHaveBeenCalled()
  })

  it("passes custom compare function", () => {
    const compare = vi.fn<[number], boolean>()
    const { result } = renderHook(() => useImpulse<number>(0, { compare }))

    act(() => {
      result.current.setValue(1)
    })

    expect(compare).toHaveBeenCalledOnce()
    expect(compare).toHaveBeenLastCalledWith(0, 1)
  })

  it("updates compare function on re-render", () => {
    const compare_1 = vi.fn().mockImplementation(Object.is)
    const compare_2 = vi.fn().mockImplementation(Object.is)

    const { result, rerender } = renderHook(
      (compare: null | Compare<number>) => useImpulse<number>(0, { compare }),
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
    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith(2, 3)
  })
})
