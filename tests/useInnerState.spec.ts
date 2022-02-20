import { act, renderHook } from "@testing-library/react-hooks"

import { InnerStore, useInnerState } from "../src"

import { Counter } from "./helpers"

describe("bypassed store", () => {
  it.concurrent.each([
    null,
    // eslint-disable-next-line no-undefined
    undefined,
  ])("returns %s for %s", (value) => {
    const { result } = renderHook(() => useInnerState<number>(value))

    expect(result.current[0]).toBe(value)
  })
})

describe("defined store", () => {
  it.concurrent("returns initial state", () => {
    const initial = { count: 0 }
    const store = InnerStore.of(initial)

    const { result } = renderHook(() => useInnerState(store))

    expect(result.current[0]).toBe(initial)
    expect(result.current[0]).toBe(store.getState())
    expect(result.current[0]).toStrictEqual({ count: 0 })
  })

  it.concurrent("returns the same values when the hook re-renders", () => {
    const initial = { count: 0 }
    const store = InnerStore.of(initial)

    const { result, rerender } = renderHook(() => useInnerState(store))
    const firstResult = result.current

    expect(result.all).toHaveLength(1)

    rerender()

    expect(result.all).toHaveLength(2)

    expect(result.current[0]).toBe(firstResult[0])
    expect(result.current[0]).toBe(store.getState())
    expect(result.current[0]).toStrictEqual({ count: 0 })
    expect(result.current[1]).toBe(firstResult[1])
  })

  it.concurrent("watches after store's updates", () => {
    const initial = { count: 0 }
    const store = InnerStore.of(initial)

    const { result } = renderHook(() => useInnerState(store))

    act(() => {
      store.setState(Counter.inc)
      result.current[1](Counter.inc)
    })

    expect(result.current[0]).not.toBe(initial)
    expect(result.current[0]).toBe(store.getState())
    expect(result.current[0]).toStrictEqual({ count: 2 })
  })

  it.concurrent("re-subscribes on new store", () => {
    const store_1 = InnerStore.of({ count: 0 })
    const store_2 = InnerStore.of({ count: 10 })

    const { result, rerender } = renderHook((store) => useInnerState(store), {
      initialProps: store_1,
    })
    const firstResult = result.current

    rerender(store_2)

    expect(result.current[0]).not.toBe(store_1.getState())
    expect(result.current[0]).toBe(store_2.getState())
    expect(result.current[0]).toStrictEqual({ count: 10 })
    expect(result.current[1]).not.toBe(firstResult[1])

    act(() => {
      store_1.setState(Counter.inc)
      firstResult[1](Counter.inc)
    })

    expect(store_1.getState()).toStrictEqual({ count: 2 })
    expect(result.current[0]).toBe(store_2.getState())
    expect(result.current[0]).toStrictEqual({ count: 10 })

    act(() => {
      store_2.setState(Counter.inc)
      result.current[1](Counter.inc)
    })

    expect(store_1.getState()).toStrictEqual({ count: 2 })
    expect(result.current[0]).toBe(store_2.getState())
    expect(result.current[0]).toStrictEqual({ count: 12 })
  })

  describe("clones state", () => {
    it.concurrent("without compare", () => {
      const initial = { count: 0 }
      const store = InnerStore.of(initial)

      const { result } = renderHook(() => useInnerState(store))

      act(() => {
        result.current[1](Counter.clone)
      })

      expect(result.current[0]).not.toBe(initial)
      expect(result.current[0]).toBe(store.getState())
      expect(result.current[0]).toStrictEqual({ count: 0 })
    })

    it.concurrent("with compare", () => {
      const initial = { count: 0 }
      const store = InnerStore.of(initial)

      const { result } = renderHook(() => useInnerState(store, Counter.compare))

      act(() => {
        result.current[1](Counter.clone)
      })

      expect(result.current[0]).toBe(initial)
      expect(result.current[0]).toBe(store.getState())
      expect(result.current[0]).toStrictEqual({ count: 0 })
    })
  })
})
