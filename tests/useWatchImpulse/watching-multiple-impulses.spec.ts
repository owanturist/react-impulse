import { act, renderHook } from "@testing-library/react-hooks"

import { Compare, Impulse, useScoped, batch } from "../../src"
import {
  Counter,
  WithImpulse,
  WithFirst,
  WithSecond,
  WithThird,
  WithSpy,
} from "../common"

describe.each([
  [
    "inline watcher",
    ({ first, second }: WithFirst & WithSecond) => {
      return useScoped((scope) => {
        return Counter.merge(first.getValue(scope), second.getValue(scope))
      })
    },
  ],
  [
    "memoized watcher",
    ({ first, second }: WithFirst & WithSecond, compare?: Compare<Counter>) => {
      return useScoped(
        (scope) => {
          return Counter.merge(first.getValue(scope), second.getValue(scope))
        },
        [first, second],
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
      first,
      second,
      third,
    }: WithFirst & WithSecond & WithThird & WithSpy) => {
      return useScoped((scope) => {
        spy()

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
    ({ spy, impulse }: WithImpulse & WithSpy) => {
      return useScoped(
        (scope) => {
          spy()

          return impulse.getValue(scope)
        },
        [spy, impulse],
      )
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
      return useScoped(
        (scope) => {
          spy()

          return Counter.merge(
            first.getValue(scope),
            second.getValue(scope),
            third.getValue(scope),
          )
        },
        [spy, first, second, third],
        compare,
      )
    },
  ],
])(
  "triggering %s for multiple impulses vs single impulse",
  (_, useSingleHook, useMultipleHookWithoutCompare) => {
    describe.each([
      ["without comparator", useMultipleHookWithoutCompare],
      [
        "with inline comparator",
        (props: WithFirst & WithSecond & WithThird & WithSpy) => {
          return useMultipleHookWithoutCompare(props, (prev, next) =>
            Counter.compare(prev, next),
          )
        },
      ],
      [
        "with memoized comparator",
        (props: WithFirst & WithSecond & WithThird & WithSpy) => {
          return useMultipleHookWithoutCompare(props, Counter.compare)
        },
      ],
    ])("when second hook %s", (__, useMultipleHook) => {
      const setup = () => {
        const first = Impulse.of({ count: 1 })
        const second = Impulse.of({ count: 2 })
        const third = Impulse.of({ count: 3 })
        const spySingle = vi.fn()
        const spyMultiple = vi.fn()

        const { result: resultSingle } = renderHook(useSingleHook, {
          initialProps: { impulse: first, spy: spySingle },
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
              first.setValue(Counter.inc)
              second.setValue(Counter.inc)
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
              first.setValue(Counter.inc)
              third.setValue(Counter.inc)
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
                first.setValue(Counter.inc)
                second.setValue(Counter.inc)
              })

              third.setValue(Counter.inc)
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
              second.setValue(Counter.inc)
              third.setValue(Counter.inc)
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
