import { act, renderHook } from "@testing-library/react-hooks"

import { Sweety, useSweetyState } from "../src"

import { Counter } from "./common"

describe("bypassed store", () => {
  it.each([
    null,
    // eslint-disable-next-line no-undefined
    undefined,
  ])("returns %s for %s", (value) => {
    const { result } = renderHook(() => useSweetyState<number>(value))

    expect(result.current[0]).toBe(value)
  })
})

describe("defined store", () => {
  it.concurrent("returns initial state", () => {
    const initial = { count: 0 }
    const store = Sweety.of(initial)

    const { result } = renderHook(() => useSweetyState(store))

    expect(result.current[0]).toBe(initial)
    expect(result.current[0]).toBe(store.getState())
    expect(result.current[0]).toStrictEqual({ count: 0 })
  })

  it.concurrent("returns the same values when the hook re-renders", () => {
    const initial = { count: 0 }
    const store = Sweety.of(initial)

    const { result, rerender } = renderHook(() => useSweetyState(store))
    const firstResult = result.current

    rerender()

    expect(result.current[0]).toBe(firstResult[0])
    expect(result.current[0]).toBe(store.getState())
    expect(result.current[0]).toStrictEqual({ count: 0 })
    expect(result.current[1]).toBe(firstResult[1])
  })

  it.concurrent("watches after store's updates", () => {
    const initial = { count: 0 }
    const store = Sweety.of(initial)

    const { result } = renderHook(() => useSweetyState(store))

    act(() => {
      store.setState(Counter.inc)
      result.current[1](Counter.inc)
    })

    expect(result.current[0]).not.toBe(initial)
    expect(result.current[0]).toBe(store.getState())
    expect(result.current[0]).toStrictEqual({ count: 2 })
  })

  it.concurrent("re-subscribes on new store", () => {
    const store_1 = Sweety.of({ count: 0 })
    const store_2 = Sweety.of({ count: 10 })

    const { result, rerender } = renderHook((store) => useSweetyState(store), {
      initialProps: store_1,
    })
    const firstResult = result.current

    rerender(store_2)

    expect(result.current[0]).not.toBe(store_1.getState())
    expect(result.current[0]).toBe(store_2.getState())
    expect(result.current[0]).toStrictEqual({ count: 10 })
    expect(result.current[1]).toBe(firstResult[1])

    act(() => {
      store_1.setState(Counter.inc)
      firstResult[1](Counter.inc)
    })

    expect(store_1.getState()).toStrictEqual({ count: 1 })
    expect(result.current[0]).toBe(store_2.getState())
    expect(result.current[0]).toStrictEqual({ count: 11 })

    act(() => {
      store_2.setState(Counter.inc)
      result.current[1](Counter.inc)
    })

    expect(store_1.getState()).toStrictEqual({ count: 1 })
    expect(result.current[0]).toBe(store_2.getState())
    expect(result.current[0]).toStrictEqual({ count: 13 })
  })

  describe("clones state", () => {
    it.concurrent("without compare", () => {
      const initial = { count: 0 }
      const store = Sweety.of(initial)

      const { result } = renderHook(() => useSweetyState(store))

      act(() => {
        result.current[1](Counter.clone)
      })

      expect(result.current[0]).not.toBe(initial)
      expect(result.current[0]).toBe(store.getState())
      expect(result.current[0]).toStrictEqual({ count: 0 })
    })

    it.concurrent("with compare", () => {
      const initial = { count: 0 }
      const store = Sweety.of(initial)

      const { result } = renderHook(() =>
        useSweetyState(store, Counter.compare),
      )

      act(() => {
        result.current[1](Counter.clone)
      })

      expect(result.current[0]).toBe(initial)
      expect(result.current[0]).toBe(store.getState())
      expect(result.current[0]).toStrictEqual({ count: 0 })
    })
  })
})
