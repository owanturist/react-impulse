import { useCallback, useMemo } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { Compare, Sweety, SetSweetyState, useSetSweetyState } from "../src"

import { Counter, WithCompare, WithStore } from "./common"

describe("defined store", () => {
  it.concurrent("keeps setState value over time", () => {
    const store = Sweety.of(0)
    const { result, rerender } = renderHook(() => useSetSweetyState(store))

    const setState = result.current

    rerender()
    expect(result.current).toBe(setState)

    expect(store.getState()).toBe(0)
    act(() => {
      setState(1)
    })
    expect(store.getState()).toBe(1)
    expect(result.current).toBe(setState)

    rerender()
    expect(result.current).toBe(setState)
  })

  describe("calls setState(value)", () => {
    let prev = { count: 0 }
    const store = Sweety.of(prev)
    const spy = vi.fn()
    const unsubscribe = store.subscribe(spy)
    const { result } = renderHook(() => useSetSweetyState(store))
    const setState = result.current

    beforeEach(() => {
      prev = store.getState()
      vi.clearAllMocks()
    })

    it("sets new state", () => {
      act(() => {
        setState({ count: 1 })
      })
      const state = store.getState()
      expect(state).not.toBe(prev)
      expect(state).toStrictEqual({ count: 1 })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it("sets same state", () => {
      act(() => {
        setState({ count: 1 })
      })
      const state = store.getState()
      expect(state).not.toBe(prev)
      expect(state).toStrictEqual({ count: 1 })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it("sets equal state", () => {
      act(() => {
        setState(prev)
      })
      const state = store.getState()
      expect(state).toBe(prev)
      expect(spy).not.toHaveBeenCalled()
    })

    it("unsubscribes", () => {
      unsubscribe()

      act(() => {
        setState({ count: 3 })
      })
      const state = store.getState()
      expect(state).not.toBe(prev)
      expect(state).toStrictEqual({ count: 3 })
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe("calls setState(transform)", () => {
    let prev = { count: 0 }
    const store = Sweety.of(prev)
    const spy = vi.fn()
    const unsubscribe = store.subscribe(spy)
    const { result } = renderHook(() => useSetSweetyState(store))
    const setState = result.current

    beforeEach(() => {
      prev = store.getState()
      vi.clearAllMocks()
    })

    it("sets new state", () => {
      act(() => {
        setState(Counter.inc)
      })
      const state = store.getState()
      expect(state).not.toBe(prev)
      expect(state).toStrictEqual({ count: 1 })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it("sets same state", () => {
      act(() => {
        setState(Counter.clone)
      })
      const state = store.getState()
      expect(state).not.toBe(prev)
      expect(state).toStrictEqual({ count: 1 })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it("sets equal state", () => {
      act(() => {
        setState(() => prev)
      })
      const state = store.getState()
      expect(state).toBe(prev)
      expect(spy).not.toHaveBeenCalled()
    })

    it("unsubscribes", () => {
      unsubscribe()

      act(() => {
        setState(Counter.inc)
      })
      const state = store.getState()
      expect(state).not.toBe(prev)
      expect(state).toStrictEqual({ count: 2 })
      expect(spy).not.toHaveBeenCalled()
    })
  })
})

describe("defined store with compare", () => {
  const spyCompare = vi.fn(Counter.compare)

  beforeEach(() => {
    spyCompare.mockClear()
  })

  describe("keeps setState value over time", () => {
    const store_1 = Sweety.of({ count: 0 })
    const useHook_1 = (): SetSweetyState<Counter> => {
      return useSetSweetyState(store_1, (left, right) => {
        return spyCompare(left, right)
      })
    }

    const store_2 = Sweety.of({ count: 0 })
    const useHook_2 = (): SetSweetyState<Counter> => {
      return useSetSweetyState(
        store_2,
        useCallback((left: Counter, right: Counter) => {
          return spyCompare(left, right)
        }, []),
      )
    }

    it.each([
      ["inline compare", useHook_1, store_1],
      ["memoized compare", useHook_2, store_2],
    ])("%s", (_, init, store) => {
      const { result, rerender } = renderHook(init)
      const setState = result.current

      expect(spyCompare).not.toHaveBeenCalled()
      vi.clearAllMocks()

      rerender()
      expect(store.getState()).toStrictEqual({ count: 0 })
      expect(spyCompare).not.toHaveBeenCalled()
      expect(result.current).toBe(setState)

      act(() => {
        setState(Counter.inc)
      })

      expect(store.getState()).toStrictEqual({ count: 1 })
      expect(spyCompare).toHaveBeenCalledTimes(1)
      expect(result.current).toBe(setState)
      vi.clearAllMocks()

      rerender()
      expect(spyCompare).not.toHaveBeenCalled()
      expect(result.current).toBe(setState)
    })
  })

  describe("changes state", () => {
    const store_1 = Sweety.of({ count: 0 })
    const useHook_1 = (): SetSweetyState<Counter> => {
      return useSetSweetyState(store_1, (left, right) => {
        return spyCompare(left, right)
      })
    }

    const store_2 = Sweety.of({ count: 0 })
    const useHook_2 = (): SetSweetyState<Counter> => {
      return useSetSweetyState(
        store_2,
        useCallback((left: Counter, right: Counter) => {
          return spyCompare(left, right)
        }, []),
      )
    }

    describe.each([
      ["inline compare", useHook_1, store_1],
      ["memoized compare", useHook_2, store_2],
    ])("%s", (_, init, store) => {
      const spy = vi.fn()
      const { result } = renderHook(init)
      const setState = result.current

      let unsubscribe: VoidFunction = vi.fn()
      let prev = store.getState()

      beforeEach(() => {
        prev = store.getState()
        vi.clearAllMocks()
      })

      it("does not call listeners on init", () => {
        expect(spy).not.toHaveBeenCalled()
      })

      it("invoke comparator on state update", () => {
        act(() => {
          setState(Counter.inc)
        })

        const state = store.getState()
        expect(state).not.toBe(prev)
        expect(state).toStrictEqual({ count: 1 })
        expect(spy).not.toHaveBeenCalled()
        expect(spyCompare).toHaveBeenCalledTimes(1)
      })

      it("subscribes listener", () => {
        unsubscribe = store.subscribe(spy)

        expect(spy).not.toHaveBeenCalled()
        expect(spyCompare).not.toHaveBeenCalled()
      })

      it("emits listeners by transforming the state", () => {
        act(() => {
          setState(Counter.inc)
        })

        const state = store.getState()
        expect(state).not.toBe(prev)
        expect(state).toStrictEqual({ count: 2 })
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spyCompare).toHaveBeenCalledTimes(1)
      })

      it("does not emit listeners by cloning", () => {
        act(() => {
          setState(Counter.clone)
        })

        const state = store.getState()
        expect(state).toBe(prev)
        expect(state).toStrictEqual({ count: 2 })
        expect(spy).not.toHaveBeenCalled()
        expect(spyCompare).toHaveBeenCalledTimes(1)
      })

      it("emits listeners by setting the state", () => {
        act(() => {
          setState({ count: 3 })
        })

        const state = store.getState()
        expect(state).not.toBe(prev)
        expect(state).toStrictEqual({ count: 3 })
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spyCompare).toHaveBeenCalledTimes(1)
      })

      it("unsubscribes the listener", () => {
        unsubscribe()

        expect(spy).not.toHaveBeenCalled()
        expect(spyCompare).not.toHaveBeenCalled()
      })

      it("does not emit unsubscribed listener", () => {
        act(() => {
          setState({ count: 10 })
        })

        const state = store.getState()
        expect(state).not.toBe(prev)
        expect(state).toStrictEqual({ count: 10 })
        expect(spy).not.toHaveBeenCalled()
        expect(spyCompare).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe.each([
    [
      "inline",
      ({ store, compare }: WithStore & WithCompare) => {
        return useSetSweetyState(
          store,
          compare && ((prev, next) => compare(prev, next)),
        )
      },
    ],
    [
      "memoized",
      ({ store, compare }: WithStore & WithCompare) => {
        return useSetSweetyState(
          store,
          useMemo(
            () => compare && ((prev, next) => compare(prev, next)),
            [compare],
          ),
        )
      },
    ],
  ])("passes %s compare function", (_, useHook) => {
    it.concurrent("no compare", () => {
      const initial = { count: 0 }
      const store = Sweety.of(initial)
      const { result } = renderHook(useHook, {
        initialProps: { store },
      })

      act(() => {
        result.current(Counter.clone)
      })

      expect(store.getState()).not.toBe(initial)
      expect(store.getState()).toStrictEqual(initial)
    })

    describe("store level compare", () => {
      const setup = ({
        hookLevelCompare,
      }: { hookLevelCompare?: null | Compare<Counter> } = {}) => {
        const initial = { count: 0 }
        const store = Sweety.of(initial, Counter.compare)
        const { result } = renderHook(useHook, {
          initialProps: { store, compare: hookLevelCompare },
        })

        return { initial, store, result }
      }

      it.concurrent("keeps the same state", () => {
        const { initial, store, result } = setup()

        act(() => {
          result.current(Counter.clone)
        })
        expect(store.getState()).toBe(initial)
      })

      it.concurrent("gets replaced by hook level 'null' compare", () => {
        const { initial, store, result } = setup({ hookLevelCompare: null })

        act(() => {
          result.current(Counter.clone)
        })
        expect(store.getState()).not.toBe(initial)
        expect(store.getState()).toStrictEqual(initial)
      })

      it.concurrent("gets replaced by hook level functional compare", () => {
        const { initial, store, result } = setup({
          hookLevelCompare: () => true,
        })

        act(() => {
          result.current(Counter.inc)
        })
        expect(store.getState()).toBe(initial)
      })

      it.concurrent("gets replaced by setState level 'null' compare", () => {
        const { initial, store, result } = setup()

        act(() => {
          result.current(Counter.clone, null)
        })
        expect(store.getState()).not.toBe(initial)
        expect(store.getState()).toStrictEqual(initial)
      })

      it.concurrent(
        "gets replaced by setState level functional compare",
        () => {
          const { initial, store, result } = setup()

          act(() => {
            result.current(Counter.inc, () => true)
          })
          expect(store.getState()).toBe(initial)
        },
      )
    })

    describe("hook level compare", () => {
      const setup = ({
        storeLevelCompare,
      }: { storeLevelCompare?: null | Compare<Counter> } = {}) => {
        const initial = { count: 0 }
        const store = Sweety.of(initial, storeLevelCompare)
        const { result } = renderHook(useHook, {
          initialProps: { store, compare: Counter.compare },
        })

        return { initial, store, result }
      }

      it.concurrent("keeps the same state", () => {
        const { initial, store, result } = setup()

        act(() => {
          result.current(Counter.clone)
        })
        expect(store.getState()).toBe(initial)
      })

      it.concurrent(
        "does not get replaced by store level 'null' compare",
        () => {
          const { initial, store, result } = setup({ storeLevelCompare: null })

          act(() => {
            result.current(Counter.clone)
          })
          expect(store.getState()).toBe(initial)
        },
      )

      it.concurrent(
        "does not get replaced by store level functional compare",
        () => {
          const { initial, store, result } = setup({
            storeLevelCompare: () => false,
          })

          act(() => {
            result.current(Counter.clone)
          })
          expect(store.getState()).toBe(initial)
        },
      )

      it.concurrent("gets replaced by setState level 'null' compare", () => {
        const { initial, store, result } = setup()

        act(() => {
          result.current(Counter.clone, null)
        })
        expect(store.getState()).not.toBe(initial)
        expect(store.getState()).toStrictEqual(initial)
      })

      it.concurrent(
        "gets replaced by setState level functional compare",
        () => {
          const { initial, store, result } = setup()

          act(() => {
            result.current(Counter.inc, () => true)
          })
          expect(store.getState()).toBe(initial)
        },
      )
    })

    describe("setState level compare", () => {
      const setup = ({
        storeLevelCompare,
        hookLevelCompare,
      }: {
        storeLevelCompare?: null | Compare<Counter>
        hookLevelCompare?: null | Compare<Counter>
      } = {}) => {
        const initial = { count: 0 }
        const store = Sweety.of(initial, storeLevelCompare)
        const { result } = renderHook(useHook, {
          initialProps: { store, compare: hookLevelCompare },
        })

        return { initial, store, result }
      }

      it.concurrent("keeps the same state", () => {
        const { initial, store, result } = setup()

        act(() => {
          result.current(Counter.clone, Counter.compare)
        })
        expect(store.getState()).toBe(initial)
      })

      it.concurrent(
        "does not get replaced by store level 'null' compare",
        () => {
          const { initial, store, result } = setup({ storeLevelCompare: null })

          act(() => {
            result.current(Counter.clone, Counter.compare)
          })
          expect(store.getState()).toBe(initial)
        },
      )

      it.concurrent(
        "does not get replaced by store level functional compare",
        () => {
          const { initial, store, result } = setup({
            storeLevelCompare: () => false,
          })

          act(() => {
            result.current(Counter.clone, Counter.compare)
          })
          expect(store.getState()).toBe(initial)
        },
      )

      it.concurrent(
        "does not get replaced by hook level 'null' compare",
        () => {
          const { initial, store, result } = setup({ hookLevelCompare: null })

          act(() => {
            result.current(Counter.clone, Counter.compare)
          })
          expect(store.getState()).toBe(initial)
        },
      )

      it.concurrent(
        "does not get replaced by hook level functional compare",
        () => {
          const { initial, store, result } = setup({
            hookLevelCompare: () => false,
          })

          act(() => {
            result.current(Counter.clone, Counter.compare)
          })
          expect(store.getState()).toBe(initial)
        },
      )
    })

    it.each([
      // eslint-disable-next-line no-undefined
      ["undefined", undefined],
      ["null", null],
      ["() => false", () => false],
    ])("replaces compare with %s on rerender", (__, compare) => {
      let prev = { count: 0 }
      const store = Sweety.of(prev)
      const { result, rerender } = renderHook(useHook, {
        initialProps: { store, compare: Counter.compare },
      })

      rerender({ store, compare: compare! })
      act(() => {
        result.current(Counter.clone)
      })
      expect(store.getState()).not.toBe(prev)
      expect(store.getState()).toStrictEqual(prev)

      prev = store.getState()
      rerender({ store, compare: Counter.compare })
      act(() => {
        result.current(Counter.clone)
      })
      expect(store.getState()).toBe(prev)
    })

    it.concurrent(
      "keeps the same setState function over compare changes",
      () => {
        const store = Sweety.of({ count: 0 })
        const { result, rerender } = renderHook(useHook, {
          initialProps: { store, compare: Counter.compare },
        })

        const firstResult = result.current

        rerender({ store, compare: () => true })
        expect(result.current).toBe(firstResult)
      },
    )
  })
})
