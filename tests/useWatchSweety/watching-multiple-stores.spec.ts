import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { Compare, Impulse, useWatchImpulse, batch } from "../../src"
import { Counter } from "../common"

interface WithStore<T = Counter> {
  store: Impulse<T>
}

interface WithFirst<T = Counter> {
  first: Impulse<T>
}

interface WithSecond<T = Counter> {
  second: Impulse<T>
}

interface WithThird<T = Counter> {
  third: Impulse<T>
}

interface WithSpy {
  spy: VoidFunction
}

describe.each([
  [
    "inline watcher",
    ({ first, second }: WithFirst & WithSecond, compare?: Compare<Counter>) => {
      return useWatchImpulse(() => {
        return Counter.merge(first.getState(), second.getState())
      }, compare)
    },
  ],
  [
    "memoized watcher",
    ({ first, second }: WithFirst & WithSecond, compare?: Compare<Counter>) => {
      return useWatchImpulse(
        useCallback(() => {
          return Counter.merge(first.getState(), second.getState())
        }, [first, second]),
        compare,
      )
    },
  ],
])("direct %s", (_, useHookWithoutCompare) => {
  describe.each([
    ["without comparator", useHookWithoutCompare],
    [
      "with inline comparator",
      (props: WithFirst & WithSecond) => {
        return useHookWithoutCompare(props, (prev, next) =>
          Counter.compare(prev, next),
        )
      },
    ],
    [
      "with memoized comparator",
      (props: WithFirst & WithSecond) => {
        return useHookWithoutCompare(props, Counter.compare)
      },
    ],
  ])("%s", (__, useHook) => {
    const setup = () => {
      const first = Impulse.of({ count: 2 })
      const second = Impulse.of({ count: 3 })
      const { result } = renderHook(useHook, {
        initialProps: { first, second },
      })

      return { first, second, result }
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
  })
})

describe.each([
  [
    "inline watcher",
    ({ spy, store }: WithStore & WithSpy, compare?: Compare<Counter>) => {
      return useWatchImpulse(() => {
        spy()

        return store.getState()
      }, compare)
    },
    (
      {
        spy,
        first,
        second,
        third,
      }: WithFirst & WithSecond & WithThird & WithSpy,
      compare?: Compare<Counter>,
    ) => {
      return useWatchImpulse(() => {
        spy()

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
      return useWatchImpulse(
        useCallback(() => {
          spy()

          return store.getState()
        }, [spy, store]),
      )
    },
    ({
      spy,
      first,
      second,
      third,
    }: WithFirst & WithSecond & WithThird & WithSpy) => {
      return useWatchImpulse(
        useCallback(() => {
          spy()

          return Counter.merge(
            first.getState(),
            second.getState(),
            third.getState(),
          )
        }, [spy, first, second, third]),
      )
    },
  ],
])(
  "triggering %s for multiple stores vs single store",
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
        (props: WithFirst & WithSecond & WithThird & WithSpy) => {
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
        (props: WithFirst & WithSecond & WithThird & WithSpy) => {
          return useMultipleHookWithoutCompare(props, Counter.compare)
        },
      ],
    ])("%s", (__, useSingleHook, useMultipleHook) => {
      const setup = () => {
        const first = Impulse.of({ count: 1 })
        const second = Impulse.of({ count: 2 })
        const third = Impulse.of({ count: 3 })
        const spySingle = vi.fn()
        const spyMultiple = vi.fn()

        const { result: resultSingle } = renderHook(useSingleHook, {
          initialProps: { store: first, spy: spySingle },
        })

        const { result: resultMultiple } = renderHook(useMultipleHook, {
          initialProps: { first, second, third, spy: spyMultiple },
        })

        return {
          first,
          second,
          third,
          spySingle,
          spyMultiple,
          resultSingle,
          resultMultiple,
        }
      }

      it.concurrent("calls watchers the same amount when initiates", () => {
        const { spySingle, spyMultiple, resultSingle, resultMultiple } = setup()

        expect(resultSingle.current).toStrictEqual({ count: 1 })
        expect(resultMultiple.current).toStrictEqual({ count: 6 })
        expect(spyMultiple).toHaveBeenCalledTimes(spySingle.mock.calls.length)
      })

      it.concurrent(
        "calls watchers the same amount when only first and second",
        () => {
          const {
            first,
            second,
            spySingle,
            spyMultiple,
            resultSingle,
            resultMultiple,
          } = setup()

          act(() => {
            batch(() => {
              first.setState(Counter.inc)
              second.setState(Counter.inc)
            })
          })
          expect(resultSingle.current).toStrictEqual({ count: 2 })
          expect(resultMultiple.current).toStrictEqual({ count: 8 })
          expect(spyMultiple).toHaveBeenCalledTimes(spySingle.mock.calls.length)
        },
      )

      it.concurrent(
        "calls watchers the same amount when only first and third",
        () => {
          const {
            first,
            third,
            spySingle,
            spyMultiple,
            resultSingle,
            resultMultiple,
          } = setup()

          act(() => {
            batch(() => {
              first.setState(Counter.inc)
              third.setState(Counter.inc)
            })
          })
          expect(resultSingle.current).toStrictEqual({ count: 2 })
          expect(resultMultiple.current).toStrictEqual({ count: 8 })
          expect(spyMultiple).toHaveBeenCalledTimes(spySingle.mock.calls.length)
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
            spyMultiple,
            resultSingle,
            resultMultiple,
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
          expect(resultMultiple.current).toStrictEqual({ count: 9 })
          expect(spyMultiple).toHaveBeenCalledTimes(spySingle.mock.calls.length)
        },
      )

      it.concurrent(
        "doesn't call single watcher when changes only second and third",
        () => {
          const {
            second,
            third,
            spySingle,
            spyMultiple,
            resultSingle,
            resultMultiple,
          } = setup()

          spySingle.mockReset()
          spyMultiple.mockReset()

          act(() => {
            batch(() => {
              second.setState(Counter.inc)
              third.setState(Counter.inc)
            })
          })
          expect(resultSingle.current).toStrictEqual({ count: 1 })
          expect(resultMultiple.current).toStrictEqual({ count: 8 })
          expect(spySingle).not.toHaveBeenCalled()
          expect(spyMultiple).toHaveBeenCalled()
        },
      )
    })
  },
)
