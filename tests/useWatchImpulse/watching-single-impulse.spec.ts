import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react"

import { type Compare, Impulse, useWatchImpulse } from "../../src"
import { Counter, type WithSpy, type WithImpulse } from "../common"

describe.each([
  [
    "inline watcher",
    ({ impulse }: WithImpulse, compare?: Compare<Counter>) => {
      return useWatchImpulse(() => impulse.getValue(), { compare })
    },
  ],
  [
    "memoized watcher",
    ({ impulse }: WithImpulse, compare?: Compare<Counter>) => {
      return useWatchImpulse(
        useCallback(() => impulse.getValue(), [impulse]),
        { compare },
      )
    },
  ],
])("direct %s", (_, useHookWithoutCompare) => {
  describe.each([
    ["without comparator", useHookWithoutCompare],
    [
      "with inline comparator",
      (props: WithImpulse) => {
        return useHookWithoutCompare(props, (prev, next) =>
          Counter.compare(prev, next),
        )
      },
    ],
    [
      "with memoized comparator",
      (props: WithImpulse) => {
        return useHookWithoutCompare(props, Counter.compare)
      },
    ],
  ])("%s", (__, useHook) => {
    it("watches the Impulse's changes", () => {
      const impulse = Impulse.of({ count: 1 })

      const { result } = renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(result.current).toStrictEqual({ count: 1 })

      act(() => {
        impulse.setValue(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 2 })

      act(() => {
        impulse.setValue(({ count }) => ({ count: count * 2 }))
      })
      expect(result.current).toStrictEqual({ count: 4 })
    })

    describe("watches the replaced impulse changes", () => {
      const setup = () => {
        const impulse_1 = Impulse.of({ count: 1 })
        const impulse_2 = Impulse.of({ count: 10 })

        const { result, rerender } = renderHook(useHook, {
          initialProps: { impulse: impulse_1 },
        })

        return { impulse_1, impulse_2, result, rerender }
      }

      it("initiates with correct result", () => {
        const { result } = setup()

        expect(result.current).toStrictEqual({ count: 1 })
      })

      it("replaces initial impulse_1 with impulse_2", () => {
        const { impulse_2, result, rerender } = setup()

        rerender({ impulse: impulse_2 })
        expect(result.current).toStrictEqual({ count: 10 })
      })

      it("stops watching impulse_1 changes after replacement with impulse_2", () => {
        const { impulse_1, impulse_2, result, rerender } = setup()
        expect(impulse_1).toHaveEmittersSize(1)

        rerender({ impulse: impulse_2 })
        expect(impulse_1).toHaveEmittersSize(0)

        act(() => {
          impulse_1.setValue(Counter.inc)
        })

        expect(impulse_1.getValue()).toStrictEqual({ count: 2 })
        expect(result.current).toStrictEqual({ count: 10 })
        expect(impulse_1).toHaveEmittersSize(0)
      })

      it("starts watching impulse_2 changes after replacement of impulse_1", () => {
        const { impulse_1, impulse_2, result, rerender } = setup()
        expect(impulse_2).toHaveEmittersSize(0)

        rerender({ impulse: impulse_2 })
        expect(impulse_2).toHaveEmittersSize(1)

        act(() => {
          impulse_2.setValue(Counter.inc)
        })

        expect(impulse_1.getValue()).toStrictEqual({ count: 1 })
        expect(result.current).toStrictEqual({ count: 11 })
        expect(impulse_2).toHaveEmittersSize(1)
      })

      it("replaces impulse_1 back", () => {
        const { impulse_1, impulse_2, result, rerender } = setup()

        rerender({ impulse: impulse_2 })
        rerender({ impulse: impulse_1 })

        expect(result.current).toStrictEqual({ count: 1 })
      })

      it("stops watching impulse_2 after replacement back impulse_1", () => {
        const { impulse_1, impulse_2, result, rerender } = setup()

        rerender({ impulse: impulse_2 })
        rerender({ impulse: impulse_1 })
        expect(impulse_1).toHaveEmittersSize(1)
        expect(impulse_2).toHaveEmittersSize(0)

        act(() => {
          impulse_2.setValue(Counter.inc)
        })

        expect(result.current).toStrictEqual({ count: 1 })
      })
    })
  })
})

describe("transform watched Impulse's", () => {
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
      ({ impulse }: WithImpulse, compare?: Compare<[boolean, boolean]>) => {
        return useWatchImpulse(() => impulse.getValue(toTuple), { compare })
      },
    ],
    [
      "memoized watcher",
      ({ impulse }: WithImpulse, compare?: Compare<[boolean, boolean]>) => {
        return useWatchImpulse(
          useCallback(() => impulse.getValue(toTuple), [impulse]),
          { compare },
        )
      },
    ],
  ])("%s", (__, useHookWithoutCompare) => {
    it("produces new value on each Impulse's update without comparator", () => {
      const impulse = Impulse.of({ count: 1 })

      const { result, rerender } = renderHook(useHookWithoutCompare, {
        initialProps: { impulse },
      })

      let prev = result.current

      // produces initial result
      expect(result.current).toStrictEqual([false, true])

      // increments 1 -> 2
      prev = result.current
      act(() => {
        impulse.setValue(Counter.inc)
      })
      expect(result.current).not.toBe(prev)
      expect(result.current).toStrictEqual([false, true])

      // increments 2 -> 3
      prev = result.current
      act(() => {
        impulse.setValue({ count: 3 })
      })
      expect(result.current).not.toBe(prev)
      expect(result.current).toStrictEqual([true, true])

      // rerender
      rerender({ impulse })
      expect(result.current).toStrictEqual([true, true])

      // increments 3 -> 4
      prev = result.current
      act(() => {
        impulse.setValue({ count: 4 })
      })
      expect(result.current).not.toBe(prev)
      expect(result.current).toStrictEqual([true, true])

      // increments 4 -> 5
      prev = result.current
      act(() => {
        impulse.setValue(Counter.inc)
      })
      expect(result.current).not.toBe(prev)
      expect(result.current).toStrictEqual([true, false])
    })

    it.each([
      [
        "inline comparator",
        (props: WithImpulse) => {
          return useHookWithoutCompare(props, (prev, next) =>
            compareTuple(prev, next),
          )
        },
      ],
      [
        "memoized comparator",
        (props: WithImpulse) => {
          return useHookWithoutCompare(props, compareTuple)
        },
      ],
    ])(
      "keeps the old value when it is comparably equal when %s",
      (_, useHookWithCompare) => {
        const impulse = Impulse.of({ count: 1 })

        const { result, rerender } = renderHook(useHookWithCompare, {
          initialProps: { impulse },
        })

        let prev = result.current

        // produces initial result
        expect(result.current).toStrictEqual([false, true])

        // increments 1 -> 2
        prev = result.current
        act(() => {
          impulse.setValue(Counter.inc)
        })
        expect(result.current).toBe(prev)
        expect(result.current).toStrictEqual([false, true])

        // increments 2 -> 3
        prev = result.current
        act(() => {
          impulse.setValue({ count: 3 })
        })
        expect(result.current).not.toBe(prev)
        expect(result.current).toStrictEqual([true, true])

        // rerender
        rerender({ impulse })
        expect(result.current).toStrictEqual([true, true])

        // increments 3 -> 4
        prev = result.current
        act(() => {
          impulse.setValue({ count: 4 })
        })
        expect(result.current).toBe(prev)
        expect(result.current).toStrictEqual([true, true])

        // increments 4 -> 5
        prev = result.current
        act(() => {
          impulse.setValue(Counter.inc)
        })
        expect(result.current).not.toBe(prev)
        expect(result.current).toStrictEqual([true, false])
      },
    )
  })

  describe.each([
    [
      "inline watcher",
      ({ spy, impulse }: WithImpulse & WithSpy, compare?: Compare<Counter>) => {
        return useWatchImpulse(
          () => {
            spy()

            return impulse.getValue()
          },
          { compare },
        )
      },
    ],
    [
      "memoized watcher",
      ({ spy, impulse }: WithImpulse & WithSpy, compare?: Compare<Counter>) => {
        return useWatchImpulse(
          useCallback(() => {
            spy()

            return impulse.getValue()
          }, [spy, impulse]),
          { compare },
        )
      },
    ],
  ])(
    "when Impulse's changes under %s are comparably equal with",
    (_, useHookWithoutCompare) => {
      it.each([
        ["without comparator", useHookWithoutCompare],
        [
          "with inline comparator",
          (props: WithImpulse & WithSpy) => {
            return useHookWithoutCompare(props, (prev, next) =>
              Counter.compare(prev, next),
            )
          },
        ],
        [
          "with memoized comparator",
          (props: WithImpulse & WithSpy) => {
            return useHookWithoutCompare(props, Counter.compare)
          },
        ],
      ])("should not trigger the watcher %s", () => {
        const impulse = Impulse.of({ count: 1 }, { compare: Counter.compare })
        const spy = vi.fn()

        renderHook(useHookWithoutCompare, {
          initialProps: { spy, impulse },
        })

        expect(spy).toHaveBeenCalledOnce()
        vi.clearAllMocks()

        act(() => {
          impulse.setValue(Counter.clone)
        })

        expect(spy).not.toHaveBeenCalled()
      })
    },
  )
})

describe("multiple Impulse#getValue() calls", () => {
  describe.each([
    [
      "inline watcher",
      ({ spy, impulse }: WithImpulse & WithSpy, compare?: Compare<Counter>) => {
        return useWatchImpulse(
          () => {
            spy()

            return impulse.getValue()
          },
          { compare },
        )
      },
      ({ spy, impulse }: WithImpulse & WithSpy, compare?: Compare<Counter>) => {
        return useWatchImpulse(
          () => {
            spy()

            return Counter.merge(impulse.getValue(), impulse.getValue())
          },
          { compare },
        )
      },
    ],
    [
      "memoized watcher",
      ({ spy, impulse }: WithImpulse & WithSpy, compare?: Compare<Counter>) => {
        return useWatchImpulse(
          useCallback(() => {
            spy()

            return impulse.getValue()
          }, [spy, impulse]),
          { compare },
        )
      },
      ({ spy, impulse }: WithImpulse & WithSpy, compare?: Compare<Counter>) => {
        return useWatchImpulse(
          useCallback(() => {
            spy()

            return Counter.merge(impulse.getValue(), impulse.getValue())
          }, [spy, impulse]),
          { compare },
        )
      },
    ],
  ])(
    "triggering %s for multiple Impulse#getValue() calls the same as for a single",
    (_, useSingleHookWithoutCompare, useDoubleHookWithoutCompare) => {
      describe.each([
        [
          "without comparator",
          useSingleHookWithoutCompare,
          useDoubleHookWithoutCompare,
        ],
        [
          "with inline comparator",
          (props: WithImpulse & WithSpy) => {
            return useSingleHookWithoutCompare(props, (prev, next) =>
              Counter.compare(prev, next),
            )
          },
          (props: WithImpulse & WithSpy) => {
            return useDoubleHookWithoutCompare(props, (prev, next) =>
              Counter.compare(prev, next),
            )
          },
        ],
        [
          "with memoized comparator",
          (props: WithImpulse & WithSpy) => {
            return useSingleHookWithoutCompare(props, Counter.compare)
          },
          (props: WithImpulse & WithSpy) => {
            return useDoubleHookWithoutCompare(props, Counter.compare)
          },
        ],
      ])("%s", (__, useSingleHook, useDoubleHook) => {
        const setup = () => {
          const spySingle = vi.fn()
          const spyDouble = vi.fn()
          const impulse = Impulse.of({ count: 1 })

          const { result: resultSingle } = renderHook(useSingleHook, {
            initialProps: { spy: spySingle, impulse },
          })
          const { result: resultDouble } = renderHook(useDoubleHook, {
            initialProps: { spy: spyDouble, impulse },
          })

          return { impulse, spySingle, spyDouble, resultSingle, resultDouble }
        }

        it("initiates with expected results", () => {
          const { spySingle, spyDouble, resultSingle, resultDouble } = setup()

          expect(resultSingle.current).toStrictEqual({ count: 1 })
          expect(resultDouble.current).toStrictEqual({ count: 2 })
          expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
        })

        it("increments %s", () => {
          const { impulse, spySingle, spyDouble, resultSingle, resultDouble } =
            setup()

          act(() => {
            impulse.setValue(Counter.inc)
          })

          expect(resultSingle.current).toStrictEqual({ count: 2 })
          expect(resultDouble.current).toStrictEqual({ count: 4 })
          expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
        })

        it("clones %s", () => {
          const { impulse, spySingle, spyDouble, resultSingle, resultDouble } =
            setup()

          act(() => {
            impulse.setValue(Counter.clone)
          })

          expect(resultSingle.current).toStrictEqual({ count: 1 })
          expect(resultDouble.current).toStrictEqual({ count: 2 })
          expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
        })
      })
    },
  )
})
