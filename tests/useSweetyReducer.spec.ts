import { act, renderHook } from "@testing-library/react"
import { useCallback } from "react"

import { Sweety, useSweetyReducer } from "../src"

import { Counter, WithStore } from "./common"

describe("bypassed store", () => {
  it.each([
    null,
    // eslint-disable-next-line no-undefined
    undefined,
  ])("returns %s for %s", (store) => {
    const { result } = renderHook(() =>
      useSweetyReducer<number, never>(store, (state) => state),
    )

    expect(result.current[0]).toBe(store)
  })
})

describe("defined store", () => {
  type Action = "Increment" | "Clone"

  const reducer = (counter: Counter, action: Action, diff = 1): Counter => {
    switch (action) {
      case "Increment":
        return { count: counter.count + diff }

      case "Clone":
        return Counter.clone(counter)
    }
  }

  it.concurrent("returns initial state", () => {
    const initial = { count: 0 }
    const store = Sweety.of(initial)

    const { result } = renderHook(() => useSweetyReducer(store, reducer))

    expect(result.current[0]).toBe(initial)
    expect(result.current[0]).toBe(store.getState())
    expect(result.current[0]).toStrictEqual({ count: 0 })
  })

  it.concurrent("returns the same values when the hook re-renders", () => {
    const initial = { count: 0 }
    const store = Sweety.of(initial)

    const { result, rerender } = renderHook(() =>
      useSweetyReducer(store, reducer),
    )
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

    const { result } = renderHook(() => useSweetyReducer(store, reducer))

    act(() => {
      store.setState(Counter.inc)
      result.current[1]("Increment")
    })

    expect(result.current[0]).not.toBe(initial)
    expect(result.current[0]).toBe(store.getState())
    expect(result.current[0]).toStrictEqual({ count: 2 })
  })

  describe("applies variables from clojure to a passed reducer function", () => {
    it.each([
      [
        "inline",
        ({ store, diff }: WithStore & { diff: number }) => {
          return useSweetyReducer<Counter, Action>(store, (counter, action) =>
            reducer(counter, action, diff),
          )
        },
      ],
      [
        "memoized",
        ({ store, diff }: WithStore & { diff: number }) => {
          return useSweetyReducer<Counter, Action>(
            store,
            useCallback(
              (counter, action) => reducer(counter, action, diff),
              [diff],
            ),
          )
        },
      ],
    ])("when the reducer is %s", (_, useHook) => {
      const store = Sweety.of({ count: 0 })
      const { result, rerender } = renderHook(useHook, {
        initialProps: { store, diff: 1 },
      })

      act(() => {
        result.current[1]("Increment")
      })

      expect(result.current[0]).toStrictEqual({ count: 1 })

      rerender({ store, diff: 5 })

      act(() => {
        result.current[1]("Increment")
      })

      expect(result.current[0]).toStrictEqual({ count: 6 })
    })
  })

  it.concurrent("re-subscribes on new store", () => {
    const store_1 = Sweety.of({ count: 0 })
    const store_2 = Sweety.of({ count: 10 })

    const { result, rerender } = renderHook(
      (store) => useSweetyReducer(store, reducer),
      {
        initialProps: store_1,
      },
    )
    const firstResult = result.current

    rerender(store_2)

    expect(result.current[0]).not.toBe(store_1.getState())
    expect(result.current[0]).toBe(store_2.getState())
    expect(result.current[0]).toStrictEqual({ count: 10 })
    expect(result.current[1]).toBe(firstResult[1])

    act(() => {
      store_1.setState(Counter.inc)
      firstResult[1]("Increment")
    })

    expect(store_1.getState()).toStrictEqual({ count: 1 })
    expect(result.current[0]).toBe(store_2.getState())
    expect(result.current[0]).toStrictEqual({ count: 11 })

    act(() => {
      store_2.setState(Counter.inc)
      result.current[1]("Increment")
    })

    expect(store_1.getState()).toStrictEqual({ count: 1 })
    expect(result.current[0]).toBe(store_2.getState())
    expect(result.current[0]).toStrictEqual({ count: 13 })
  })

  describe("clones state", () => {
    it.concurrent("without compare", () => {
      const initial = { count: 0 }
      const store = Sweety.of(initial)

      const { result } = renderHook(() => useSweetyReducer(store, reducer))

      act(() => {
        result.current[1]("Clone")
      })

      expect(result.current[0]).not.toBe(initial)
      expect(result.current[0]).toBe(store.getState())
      expect(result.current[0]).toStrictEqual({ count: 0 })
    })

    it.concurrent("with compare", () => {
      const initial = { count: 0 }
      const store = Sweety.of(initial)

      const { result } = renderHook(() =>
        useSweetyReducer(store, reducer, Counter.compare),
      )

      act(() => {
        result.current[1]("Clone")
      })

      expect(result.current[0]).toBe(initial)
      expect(result.current[0]).toBe(store.getState())
      expect(result.current[0]).toStrictEqual({ count: 0 })
    })
  })
})
