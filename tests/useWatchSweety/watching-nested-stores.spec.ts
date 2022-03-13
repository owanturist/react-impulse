import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { batch, Compare, InnerStore, useInnerWatch } from "../../src"
import {
  Counter,
  WithFirst,
  WithSecond,
  WithSpy,
  WithStore,
  WithThird,
} from "../common"

describe.each([
  [
    "inline watcher",
    (
      { store }: WithStore<WithFirst & WithSecond>,
      compare?: Compare<Counter>,
    ) => {
      return useInnerWatch(() => {
        const { first, second } = store.getState()

        return Counter.merge(first.getState(), second.getState())
      }, compare)
    },
  ],
  [
    "memoized watcher",
    (
      { store }: WithStore<WithFirst & WithSecond>,
      compare?: Compare<Counter>,
    ) => {
      return useInnerWatch(
        useCallback(() => {
          const { first, second } = store.getState()

          return Counter.merge(first.getState(), second.getState())
        }, [store]),
        compare,
      )
    },
  ],
])("direct %s", (_, useHookWithoutCompare) => {
  describe.each([
    ["without comparator", useHookWithoutCompare],
    [
      "with inline comparator",
      (props: WithStore<WithFirst & WithSecond>) => {
        return useHookWithoutCompare(props, (prev, next) =>
          Counter.compare(prev, next),
        )
      },
    ],
    [
      "with memoized comparator",
      (props: WithStore<WithFirst & WithSecond>) => {
        return useHookWithoutCompare(props, Counter.compare)
      },
    ],
  ])("%s", (__, useHook) => {
    const setup = () => {
      const first = InnerStore.of({ count: 2 })
      const second = InnerStore.of({ count: 3 })
      const store = InnerStore.of({ first, second })
      const { result } = renderHook(useHook, {
        initialProps: { store },
      })

      return { store, first, second, result }
    }

    it.concurrent("initiates with expected result", () => {
      const { result } = setup()

      expect(result.current).toStrictEqual({ count: 5 })
    })

    it.concurrent("increments only first", () => {
      const { first, result } = setup()

      act(() => {
        first.setState(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 6 })
    })

    it.concurrent("increments only second", () => {
      const { second, result } = setup()

      act(() => {
        second.setState(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 6 })
    })

    it.concurrent("increments both first and second", () => {
      const { first, second, result } = setup()

      act(() => {
        first.setState(Counter.inc)
        second.setState(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 7 })
    })

    it.concurrent("replaces nested stores", () => {
      const newFirst = InnerStore.of({ count: 5 })
      const { store, result } = setup()

      act(() => {
        store.setState((state) => ({
          ...state,
          first: newFirst,
        }))
      })
      expect(result.current).toStrictEqual({ count: 8 })
    })

    it.concurrent("updates nested stores", () => {
      const { store, result } = setup()

      act(() => {
        store.setState((state) => {
          state.first.setState(Counter.inc)
          state.second.setState(Counter.inc)

          return state
        })
      })
      expect(result.current).toStrictEqual({ count: 7 })
    })
  })
})

describe.each([
  [
    "inline watcher",
    ({ spy, store }: WithStore & WithSpy, compare?: Compare<Counter>) => {
      return useInnerWatch(() => {
        spy()

        return store.getState()
      }, compare)
    },
    (
      { spy, store }: WithStore<WithFirst & WithSecond & WithThird> & WithSpy,
      compare?: Compare<Counter>,
    ) => {
      return useInnerWatch(() => {
        spy()

        const { first, second, third } = store.getState()

        return Counter.merge(
          first.getState(),
          second.getState(),
          third.getState(),
        )
      }, compare)
    },
  ],

  [
    "memoized watcher",
    ({ spy, store }: WithStore & WithSpy) => {
      return useInnerWatch(
        useCallback(() => {
          spy()

          return store.getState()
        }, [spy, store]),
      )
    },
    ({
      spy,
      store,
    }: WithStore<WithFirst & WithSecond & WithThird> & WithSpy) => {
      return useInnerWatch(
        useCallback(() => {
          spy()

          const { first, second, third } = store.getState()

          return Counter.merge(
            first.getState(),
            second.getState(),
            third.getState(),
          )
        }, [spy, store]),
      )
    },
  ],
])(
  "triggering %s for nested stores vs single store",
  (_, useSingleHookWithoutCompare, useMultipleHookWithoutCompare) => {
    describe.each([
      [
        "without comparator",
        useSingleHookWithoutCompare,
        useMultipleHookWithoutCompare,
      ],
      [
        "with inline comparator",
        (props: WithStore & WithSpy) => {
          return useSingleHookWithoutCompare(props, (prev, next) =>
            Counter.compare(prev, next),
          )
        },
        (props: WithStore<WithFirst & WithSecond & WithThird> & WithSpy) => {
          return useMultipleHookWithoutCompare(props, (prev, next) =>
            Counter.compare(prev, next),
          )
        },
      ],
      [
        "with memoized comparator",
        (props: WithStore & WithSpy) => {
          return useSingleHookWithoutCompare(props, Counter.compare)
        },
        (props: WithStore<WithFirst & WithSecond & WithThird> & WithSpy) => {
          return useMultipleHookWithoutCompare(props, Counter.compare)
        },
      ],
    ])("%s", (__, useSingleHook, useNestedHook) => {
      const setup = () => {
        const first = InnerStore.of({ count: 1 })
        const second = InnerStore.of({ count: 2 })
        const third = InnerStore.of({ count: 3 })
        const store = InnerStore.of({ first, second, third })
        const spySingle = jest.fn()
        const spyNested = jest.fn()

        const { result: resultSingle } = renderHook(useSingleHook, {
          initialProps: { store: first, spy: spySingle },
        })

        const { result: resultNested } = renderHook(useNestedHook, {
          initialProps: { store, spy: spyNested },
        })

        return {
          first,
          second,
          third,
          store,
          spySingle,
          spyNested,
          resultSingle,
          resultNested,
        }
      }

      it.concurrent("calls watchers the same amount when initiates", () => {
        const { spySingle, spyNested, resultSingle, resultNested } = setup()

        expect(resultSingle.current).toStrictEqual({ count: 1 })
        expect(resultNested.current).toStrictEqual({ count: 6 })
        expect(spyNested).toHaveBeenCalledTimes(spySingle.mock.calls.length)
      })

      it.concurrent(
        "calls watchers the same amount when only first and second",
        () => {
          const {
            first,
            second,
            spySingle,
            spyNested,
            resultSingle,
            resultNested,
          } = setup()

          act(() => {
            batch(() => {
              first.setState(Counter.inc)
              second.setState(Counter.inc)
            })
          })
          expect(resultSingle.current).toStrictEqual({ count: 2 })
          expect(resultNested.current).toStrictEqual({ count: 8 })
          expect(spyNested).toHaveBeenCalledTimes(spySingle.mock.calls.length)
        },
      )

      it.concurrent(
        "calls watchers the same amount when only first and third",
        () => {
          const {
            first,
            third,
            spySingle,
            spyNested,
            resultSingle,
            resultNested,
          } = setup()

          act(() => {
            batch(() => {
              first.setState(Counter.inc)
              third.setState(Counter.inc)
            })
          })
          expect(resultSingle.current).toStrictEqual({ count: 2 })
          expect(resultNested.current).toStrictEqual({ count: 8 })
          expect(spyNested).toHaveBeenCalledTimes(spySingle.mock.calls.length)
        },
      )

      it.concurrent(
        "calls watchers the same amount when first, second and third",
        () => {
          const {
            first,
            second,
            third,
            spySingle,
            spyNested,
            resultSingle,
            resultNested,
          } = setup()

          act(() => {
            batch(() => {
              batch(() => {
                first.setState(Counter.inc)
                second.setState(Counter.inc)
              })

              third.setState(Counter.inc)
            })
          })
          expect(resultSingle.current).toStrictEqual({ count: 2 })
          expect(resultNested.current).toStrictEqual({ count: 9 })
          expect(spyNested).toHaveBeenCalledTimes(spySingle.mock.calls.length)
        },
      )

      it.concurrent(
        "doesn't call single watcher when changes only second and third",
        () => {
          const {
            second,
            third,
            spySingle,
            spyNested,
            resultSingle,
            resultNested,
          } = setup()

          spySingle.mockReset()
          spyNested.mockReset()

          act(() => {
            batch(() => {
              second.setState(Counter.inc)
              third.setState(Counter.inc)
            })
          })
          expect(resultSingle.current).toStrictEqual({ count: 1 })
          expect(resultNested.current).toStrictEqual({ count: 8 })
          expect(spySingle).not.toHaveBeenCalled()
          expect(spyNested).toHaveBeenCalled()
        },
      )

      it.concurrent("InnerStore#setState wraps the callback into batch", () => {
        const { second, third, store, spyNested, resultNested } = setup()

        spyNested.mockReset()

        act(() => {
          batch(() => {
            second.setState(Counter.inc)
            third.setState(Counter.inc)
          })
        })

        const spyCallsForBatch = spyNested.mock.calls.length

        spyNested.mockReset()

        act(() => {
          store.setState((state) => {
            state.second.setState(Counter.inc)
            state.third.setState(Counter.inc)

            return state
          })
        })

        expect(spyNested).toHaveBeenCalledTimes(spyCallsForBatch)
        expect(resultNested.current).toStrictEqual({ count: 10 })
      })
    })
  },
)
