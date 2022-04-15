import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { Compare, Sweety, useWatchSweety } from "../../src"
import { Counter, WithSpy, WithStore } from "../common"

describe.each([
  [
    "inline watcher",
    ({ store }: WithStore, compare?: Compare<Counter>) => {
      return useWatchSweety(() => store.getState(), compare)
    },
  ],
  [
    "memoized watcher",
    ({ store }: WithStore, compare?: Compare<Counter>) => {
      return useWatchSweety(
        useCallback(() => store.getState(), [store]),
        compare,
      )
    },
  ],
])("direct %s", (_, useHookWithoutCompare) => {
  describe.each([
    ["without comparator", useHookWithoutCompare],
    [
      "with inline comparator",
      (props: WithStore) => {
        return useHookWithoutCompare(props, (prev, next) =>
          Counter.compare(prev, next),
        )
      },
    ],
    [
      "with memoized comparator",
      (props: WithStore) => {
        return useHookWithoutCompare(props, Counter.compare)
      },
    ],
  ])("%s", (__, useHook) => {
    it.concurrent("watches the store's changes", () => {
      const store = Sweety.of({ count: 1 })

      const { result } = renderHook(useHook, {
        initialProps: { store },
      })

      expect(result.current).toStrictEqual({ count: 1 })

      act(() => {
        store.setState(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 2 })

      act(() => {
        store.setState(({ count }) => ({ count: count * 2 }))
      })
      expect(result.current).toStrictEqual({ count: 4 })
    })

    describe("watches the replaced store changes", () => {
      const setup = () => {
        const store_1 = Sweety.of({ count: 1 })
        const store_2 = Sweety.of({ count: 10 })

        const { result, rerender } = renderHook(useHook, {
          initialProps: { store: store_1 },
        })

        return { store_1, store_2, result, rerender }
      }

      it.concurrent("initiates with correct result", () => {
        const { result } = setup()

        expect(result.current).toStrictEqual({ count: 1 })
      })

      it.concurrent("replaces initial store_1 with store_2", () => {
        const { store_2, result, rerender } = setup()

        rerender({ store: store_2 })
        expect(result.current).toStrictEqual({ count: 10 })
      })

      it.concurrent(
        "stops watching store_1 changes after replacement with store_2",
        () => {
          const { store_1, store_2, result, rerender } = setup()

          rerender({ store: store_2 })

          act(() => {
            store_1.setState(Counter.inc)
          })

          expect(store_1.getState()).toStrictEqual({ count: 2 })
          expect(result.current).toStrictEqual({ count: 10 })
        },
      )

      it.concurrent(
        "starts watching store_2 changes after replacement of store_1",
        () => {
          const { store_1, store_2, result, rerender } = setup()

          rerender({ store: store_2 })

          act(() => {
            store_2.setState(Counter.inc)
          })

          expect(store_1.getState()).toStrictEqual({ count: 1 })
          expect(result.current).toStrictEqual({ count: 11 })
        },
      )

      it.concurrent("replaces store_1 back", () => {
        const { store_1, store_2, result, rerender } = setup()

        rerender({ store: store_2 })
        rerender({ store: store_1 })

        expect(result.current).toStrictEqual({ count: 1 })
      })

      it.concurrent(
        "stops watching store_2 after replacement back store_1",
        () => {
          const { store_1, store_2, result, rerender } = setup()

          rerender({ store: store_2 })
          rerender({ store: store_1 })

          act(() => {
            store_2.setState(Counter.inc)
          })

          expect(result.current).toStrictEqual({ count: 1 })
        },
      )
    })
  })
})

describe("transform state's value inside watcher", () => {
  const toTuple = ({ count }: Counter): [boolean, boolean] => {
    return [count > 2, count < 5]
  }

  const compareTuple: Compare<[boolean, boolean]> = (
    [prevLeft, prevRight],
    [nextLeft, nextRight],
  ) => {
    return prevLeft === nextLeft && prevRight === nextRight
  }

  describe.each([
    [
      "inline watcher",
      ({ store }: WithStore, compare?: Compare<[boolean, boolean]>) => {
        return useWatchSweety(() => store.getState(toTuple), compare)
      },
    ],
    [
      "memoized watcher",
      ({ store }: WithStore, compare?: Compare<[boolean, boolean]>) => {
        return useWatchSweety(
          useCallback(() => store.getState(toTuple), [store]),
          compare,
        )
      },
    ],
  ])("%s", (__, useHookWithoutCompare) => {
    it.concurrent(
      "produces new value on each store's update without comparator",
      () => {
        const store = Sweety.of({ count: 1 })

        const { result, rerender } = renderHook(useHookWithoutCompare, {
          initialProps: { store },
        })

        let prev = result.current

        // produces initial result
        expect(result.current).toStrictEqual([false, true])

        // increments 1 -> 2
        prev = result.current
        act(() => {
          store.setState(Counter.inc)
        })
        expect(result.current).not.toBe(prev)
        expect(result.current).toStrictEqual([false, true])

        // increments 2 -> 3
        prev = result.current
        act(() => {
          store.setState({ count: 3 })
        })
        expect(result.current).not.toBe(prev)
        expect(result.current).toStrictEqual([true, true])

        // rerender
        rerender()
        expect(result.current).toStrictEqual([true, true])

        // increments 3 -> 4
        prev = result.current
        act(() => {
          store.setState({ count: 4 })
        })
        expect(result.current).not.toBe(prev)
        expect(result.current).toStrictEqual([true, true])

        // increments 4 -> 5
        prev = result.current
        act(() => {
          store.setState(Counter.inc)
        })
        expect(result.current).not.toBe(prev)
        expect(result.current).toStrictEqual([true, false])
      },
    )

    it.each([
      [
        "inline comparator",
        (props: WithStore) => {
          return useHookWithoutCompare(props, (prev, next) =>
            compareTuple(prev, next),
          )
        },
      ],
      [
        "memoized comparator",
        (props: WithStore) => {
          return useHookWithoutCompare(props, compareTuple)
        },
      ],
    ])(
      "keeps the old value when it is comparably equal when %s",
      (_, useHookWithCompare) => {
        const store = Sweety.of({ count: 1 })

        const { result, rerender } = renderHook(useHookWithCompare, {
          initialProps: { store },
        })

        let prev = result.current

        // produces initial result
        expect(result.current).toStrictEqual([false, true])

        // increments 1 -> 2
        prev = result.current
        act(() => {
          store.setState(Counter.inc)
        })
        expect(result.current).toBe(prev)
        expect(result.current).toStrictEqual([false, true])

        // increments 2 -> 3
        prev = result.current
        act(() => {
          store.setState({ count: 3 })
        })
        expect(result.current).not.toBe(prev)
        expect(result.current).toStrictEqual([true, true])

        // rerender
        rerender()
        expect(result.current).toStrictEqual([true, true])

        // increments 3 -> 4
        prev = result.current
        act(() => {
          store.setState({ count: 4 })
        })
        expect(result.current).toBe(prev)
        expect(result.current).toStrictEqual([true, true])

        // increments 4 -> 5
        prev = result.current
        act(() => {
          store.setState(Counter.inc)
        })
        expect(result.current).not.toBe(prev)
        expect(result.current).toStrictEqual([true, false])
      },
    )
  })

  describe.each([
    [
      "inline watcher",
      ({ spy, store }: WithStore & WithSpy, compare?: Compare<Counter>) => {
        return useWatchSweety(() => {
          spy()

          return store.getState()
        }, compare)
      },
    ],
    [
      "memoized watcher",
      ({ spy, store }: WithStore & WithSpy, compare?: Compare<Counter>) => {
        return useWatchSweety(
          useCallback(() => {
            spy()

            return store.getState()
          }, [spy, store]),
          compare,
        )
      },
    ],
  ])(
    "when store's changes under %s are comparably equal with",
    (_, useHookWithoutCompare) => {
      it.each([
        ["without comparator", useHookWithoutCompare],
        [
          "with inline comparator",
          (props: WithStore & WithSpy) => {
            return useHookWithoutCompare(props, (prev, next) =>
              Counter.compare(prev, next),
            )
          },
        ],
        [
          "with memoized comparator",
          (props: WithStore & WithSpy) => {
            return useHookWithoutCompare(props, Counter.compare)
          },
        ],
      ])("should not trigger the watcher %s", () => {
        const store = Sweety.of({ count: 1 })
        const spy = vi.fn()

        renderHook(useHookWithoutCompare, {
          initialProps: { spy, store },
        })

        // 1st extracts the watcher result
        // 2nd subscribes to the included stores' changes
        expect(spy).toHaveBeenCalledTimes(2)

        act(() => {
          store.setState(Counter.clone, Counter.compare)
        })

        expect(spy).toHaveBeenCalledTimes(2)
      })
    },
  )
})

describe("multiple Sweety#getState() calls", () => {
  describe.each([
    [
      "inline watcher",
      ({ spy, store }: WithStore & WithSpy, compare?: Compare<Counter>) => {
        return useWatchSweety(() => {
          spy()

          return store.getState()
        }, compare)
      },
      ({ spy, store }: WithStore & WithSpy, compare?: Compare<Counter>) => {
        return useWatchSweety(() => {
          spy()

          return Counter.merge(store.getState(), store.getState())
        }, compare)
      },
    ],
    [
      "memoized watcher",
      ({ spy, store }: WithStore & WithSpy, compare?: Compare<Counter>) => {
        return useWatchSweety(
          useCallback(() => {
            spy()

            return store.getState()
          }, [spy, store]),
          compare,
        )
      },
      ({ spy, store }: WithStore & WithSpy, compare?: Compare<Counter>) => {
        return useWatchSweety(
          useCallback(() => {
            spy()

            return Counter.merge(store.getState(), store.getState())
          }, [spy, store]),
          compare,
        )
      },
    ],
  ])(
    "triggering %s for multiple Sweety#getState() calls the same as for a single",
    (_, useSingleHookWithoutCompare, useDoubleHookWithoutCompare) => {
      describe.each([
        [
          "without comparator",
          useSingleHookWithoutCompare,
          useDoubleHookWithoutCompare,
        ],
        [
          "with inline comparator",
          (props: WithStore & WithSpy) => {
            return useSingleHookWithoutCompare(props, (prev, next) =>
              Counter.compare(prev, next),
            )
          },
          (props: WithStore & WithSpy) => {
            return useDoubleHookWithoutCompare(props, (prev, next) =>
              Counter.compare(prev, next),
            )
          },
        ],
        [
          "with memoized comparator",
          (props: WithStore & WithSpy) => {
            return useSingleHookWithoutCompare(props, Counter.compare)
          },
          (props: WithStore & WithSpy) => {
            return useDoubleHookWithoutCompare(props, Counter.compare)
          },
        ],
      ])("%s", (__, useSingleHook, useDoubleHook) => {
        const setup = () => {
          const spySingle = vi.fn()
          const spyDouble = vi.fn()
          const store = Sweety.of({ count: 1 })

          const { result: resultSingle } = renderHook(useSingleHook, {
            initialProps: { spy: spySingle, store },
          })
          const { result: resultDouble } = renderHook(useDoubleHook, {
            initialProps: { spy: spyDouble, store },
          })

          return { store, spySingle, spyDouble, resultSingle, resultDouble }
        }

        it.concurrent("initiates with expected results", () => {
          const { spySingle, spyDouble, resultSingle, resultDouble } = setup()

          expect(resultSingle.current).toStrictEqual({ count: 1 })
          expect(resultDouble.current).toStrictEqual({ count: 2 })
          expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
        })

        it.each([
          // eslint-disable-next-line no-undefined
          ["without Sweety#setState comparator", undefined],
          ["with Sweety#setState comparator", Counter.compare],
        ])("increments %s", (___, compare) => {
          const { store, spySingle, spyDouble, resultSingle, resultDouble } =
            setup()

          act(() => {
            store.setState(Counter.inc, compare)
          })

          expect(resultSingle.current).toStrictEqual({ count: 2 })
          expect(resultDouble.current).toStrictEqual({ count: 4 })
          expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
        })

        it.each([
          // eslint-disable-next-line no-undefined
          ["without Sweety#setState comparator", undefined],
          ["with Sweety#setState comparator", Counter.compare],
        ])("clones %s", (___, compare) => {
          const { store, spySingle, spyDouble, resultSingle, resultDouble } =
            setup()

          act(() => {
            store.setState(Counter.clone, compare)
          })

          expect(resultSingle.current).toStrictEqual({ count: 1 })
          expect(resultDouble.current).toStrictEqual({ count: 2 })
          expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
        })
      })
    },
  )
})
