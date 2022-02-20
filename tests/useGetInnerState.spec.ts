import { act, renderHook } from "@testing-library/react-hooks"

import { InnerStore, useGetInnerState } from "../src"

import { Counter } from "./helpers"

describe("bypassed store", () => {
  it.concurrent.each([
    null,
    // eslint-disable-next-line no-undefined
    undefined,
  ])("returns %s for %s", (value) => {
    const { result } = renderHook(() => useGetInnerState<number>(value))

    expect(result.current).toBe(value)
  })
})

describe("defined store", () => {
  it.concurrent("returns initial state", () => {
    const initial = { count: 0 }
    const store = InnerStore.of(initial)

    const { result } = renderHook(() => useGetInnerState(store))

    expect(result.current).toBe(initial)
    expect(result.current).toBe(store.getState())
    expect(result.current).toStrictEqual({ count: 0 })
  })

  it.concurrent("watches after store's updates", () => {
    const initial = { count: 0 }
    const store = InnerStore.of(initial)

    const { result } = renderHook(() => useGetInnerState(store))

    act(() => {
      store.setState(Counter.inc)
    })

    expect(result.current).not.toBe(initial)
    expect(result.current).toBe(store.getState())
    expect(result.current).toStrictEqual({ count: 1 })
  })

  it.concurrent("re-subscribes on new store", () => {
    const store_1 = InnerStore.of({ count: 0 })
    const store_2 = InnerStore.of({ count: 10 })

    const { result, rerender } = renderHook(
      (store) => useGetInnerState(store),
      {
        initialProps: store_1,
      },
    )

    rerender(store_2)

    expect(result.current).not.toBe(store_1.getState())
    expect(result.current).toBe(store_2.getState())
    expect(result.current).toStrictEqual({ count: 10 })

    act(() => {
      store_1.setState(Counter.inc)
    })

    expect(store_1.getState()).toStrictEqual({ count: 1 })
    expect(result.current).toBe(store_2.getState())
    expect(result.current).toStrictEqual({ count: 10 })

    act(() => {
      store_2.setState(Counter.inc)
    })

    expect(store_1.getState()).toStrictEqual({ count: 1 })
    expect(result.current).toBe(store_2.getState())
    expect(result.current).toStrictEqual({ count: 11 })
  })
})
