import { act, renderHook } from "@testing-library/react"

import { batch, Compare, Impulse, useScoped } from "../../src"
import {
  Counter,
  WithFirst,
  WithSecond,
  WithSpy,
  WithImpulse,
  WithThird,
} from "../common"

describe.each([
  [
    "inline watcher",
    ({ impulse }: WithImpulse<WithFirst & WithSecond>) => {
      return useScoped((scope) => {
        const { first, second } = impulse.getValue(scope)

        return Counter.merge(first.getValue(scope), second.getValue(scope))
      })
    },
  ],
  [
    "memoized watcher",
    (
      { impulse }: WithImpulse<WithFirst & WithSecond>,
      compare?: Compare<Counter>,
    ) => {
      return useScoped(
        (scope) => {
          return Counter.merge(
            impulse.getValue(scope).first.getValue(scope),
            impulse.getValue(scope).second.getValue(scope),
          )
        },
        [impulse],
        compare,
      )
    },
  ],
])("direct %s", (_, useHookWithoutCompare) => {
  describe.each([
    ["without comparator", useHookWithoutCompare],
    [
      "with inline comparator",
      (props: WithImpulse<WithFirst & WithSecond>) => {
        return useHookWithoutCompare(props, (prev, next) =>
          Counter.compare(prev, next),
        )
      },
    ],
    [
      "with memoized comparator",
      (props: WithImpulse<WithFirst & WithSecond>) => {
        return useHookWithoutCompare(props, Counter.compare)
      },
    ],
  ])("%s", (__, useHook) => {
    const setup = () => {
      const first = Impulse.of({ count: 2 })
      const second = Impulse.of({ count: 3 })
      const impulse = Impulse.of({ first, second })
      const { result } = renderHook(useHook, {
        initialProps: { impulse },
      })

      return { impulse, first, second, result }
    }

    it.concurrent("initiates with expected result", () => {
      const { result } = setup()

      expect(result.current).toStrictEqual({ count: 5 })
    })

    it.concurrent("increments only first", () => {
      const { first, result } = setup()

      act(() => {
        first.setValue(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 6 })
    })

    it.concurrent("increments only second", () => {
      const { second, result } = setup()

      act(() => {
        second.setValue(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 6 })
    })

    it.concurrent("increments both first and second", () => {
      const { first, second, result } = setup()

      act(() => {
        first.setValue(Counter.inc)
        second.setValue(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 7 })
    })

    it.concurrent("replaces nested impulses", () => {
      const newFirst = Impulse.of({ count: 5 })
      const { impulse, result } = setup()

      act(() => {
        impulse.setValue((current) => ({
          ...current,
          first: newFirst,
        }))
      })
      expect(result.current).toStrictEqual({ count: 8 })
    })

    it.concurrent("updates nested impulses", () => {
      const { impulse, result } = setup()

      act(() => {
        impulse.setValue((current) => {
          current.first.setValue(Counter.inc)
          current.second.setValue(Counter.inc)

          return current
        })
      })
      expect(result.current).toStrictEqual({ count: 7 })
    })
  })
})

describe.each([
  [
    "inline watcher",
    ({ spy, impulse }: WithImpulse & WithSpy) => {
      return useScoped((scope) => {
        spy()

        return impulse.getValue(scope)
      })
    },
    ({
      spy,
      impulse,
    }: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy) => {
      return useScoped((scope) => {
        spy()

        const { first, second, third } = impulse.getValue(scope)

        return Counter.merge(
          first.getValue(scope),
          second.getValue(scope),
          third.getValue(scope),
        )
      })
    },
  ],

  [
    "memoized watcher",
    ({ spy, impulse }: WithImpulse & WithSpy, compare?: Compare<Counter>) => {
      return useScoped(
        (scope) => {
          spy()

          return impulse.getValue(scope)
        },
        [spy, impulse],
        compare,
      )
    },
    (
      {
        spy,
        impulse,
      }: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy,
      compare?: Compare<Counter>,
    ) => {
      return useScoped(
        (scope) => {
          spy()

          return Counter.merge(
            impulse.getValue(scope).first.getValue(scope),
            impulse.getValue(scope).second.getValue(scope),
            impulse.getValue(scope).third.getValue(scope),
          )
        },
        [spy, impulse],
        compare,
      )
    },
  ],
])(
  "triggering %s for nested impulses vs single impulse",
  (_, useSingleHookWithoutCompare, useMultipleHookWithoutCompare) => {
    describe.each([
      [
        "without comparator",
        useSingleHookWithoutCompare,
        useMultipleHookWithoutCompare,
      ],
      [
        "with inline comparator",
        (props: WithImpulse & WithSpy) => {
          return useSingleHookWithoutCompare(props, (prev, next) =>
            Counter.compare(prev, next),
          )
        },
        (props: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy) => {
          return useMultipleHookWithoutCompare(props, (prev, next) =>
            Counter.compare(prev, next),
          )
        },
      ],
      [
        "with memoized comparator",
        (props: WithImpulse & WithSpy) => {
          return useSingleHookWithoutCompare(props, Counter.compare)
        },
        (props: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy) => {
          return useMultipleHookWithoutCompare(props, Counter.compare)
        },
      ],
    ])("%s", (__, useSingleHook, useNestedHook) => {
      const setup = () => {
        const first = Impulse.of({ count: 1 })
        const second = Impulse.of({ count: 2 })
        const third = Impulse.of({ count: 3 })
        const impulse = Impulse.of({ first, second, third })
        const spySingle = vi.fn()
        const spyNested = vi.fn()

        const { result: resultSingle } = renderHook(useSingleHook, {
          initialProps: { impulse: first, spy: spySingle },
        })

        const { result: resultNested } = renderHook(useNestedHook, {
          initialProps: { impulse, spy: spyNested },
        })

        return {
          first,
          second,
          third,
          impulse,
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
              first.setValue(Counter.inc)
              second.setValue(Counter.inc)
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
              first.setValue(Counter.inc)
              third.setValue(Counter.inc)
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
                first.setValue(Counter.inc)
                second.setValue(Counter.inc)
              })

              third.setValue(Counter.inc)
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
              second.setValue(Counter.inc)
              third.setValue(Counter.inc)
            })
          })
          expect(resultSingle.current).toStrictEqual({ count: 1 })
          expect(resultNested.current).toStrictEqual({ count: 8 })
          expect(spySingle).not.toHaveBeenCalled()
          expect(spyNested).toHaveBeenCalled()
        },
      )

      it.concurrent("Impulse#setValue wraps the callback into batch", () => {
        const { second, third, impulse, spyNested, resultNested } = setup()

        spyNested.mockReset()

        act(() => {
          batch(() => {
            second.setValue(Counter.inc)
            third.setValue(Counter.inc)
          })
        })

        const spyCallsForBatch = spyNested.mock.calls.length

        spyNested.mockReset()

        act(() => {
          impulse.setValue((current) => {
            current.second.setValue(Counter.inc)
            current.third.setValue(Counter.inc)

            return current
          })
        })

        expect(spyNested).toHaveBeenCalledTimes(spyCallsForBatch)
        expect(resultNested.current).toStrictEqual({ count: 10 })
      })
    })
  },
)
