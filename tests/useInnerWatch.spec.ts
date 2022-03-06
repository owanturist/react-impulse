import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { Compare, InnerStore, useInnerWatch, batch } from "../src"

import { Counter } from "./helpers"

interface WithStore<T = Counter> {
  store: InnerStore<T>
}

interface WithFirst<T = Counter> {
  first: InnerStore<T>
}

interface WithSecond<T = Counter> {
  second: InnerStore<T>
}

interface WithThird<T = Counter> {
  third: InnerStore<T>
}

interface WithSpy {
  spy: VoidFunction
}

describe("multiple stores are watching", () => {
  describe.each([
    [
      "inline watcher",
      (
        { first, second }: WithFirst & WithSecond,
        compare?: Compare<Counter>,
      ) => {
        return useInnerWatch(() => {
          return Counter.merge(first.getState(), second.getState())
        }, compare)
      },
    ],
    [
      "memoized watcher",
      (
        { first, second }: WithFirst & WithSecond,
        compare?: Compare<Counter>,
      ) => {
        return useInnerWatch(
          useCallback(() => {
            return Counter.merge(first.getState(), second.getState())
          }, [first, second]),
          compare,
        )
      },
    ],
  ])("direct %s", (_, useHook) => {
    describe.each([
      ["without comparator", useHook],
      [
        "with inline comparator",
        (props: WithFirst & WithSecond) => {
          return useHook(props, (prev, next) => Counter.compare(prev, next))
        },
      ],
      [
        "with memoized comparator",
        (props: WithFirst & WithSecond) => {
          return useHook(props, Counter.compare)
        },
      ],
    ])("%s", (__, hook) => {
      const setup = () => {
        const first = InnerStore.of({ count: 2 })
        const second = InnerStore.of({ count: 3 })
        const { result } = renderHook(hook, {
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
        return useInnerWatch(() => {
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
        return useInnerWatch(() => {
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
        return useInnerWatch(
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
        return useInnerWatch(
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
    (_, useSingleHook, useMultipleHook) => {
      describe.each([
        ["without comparator", useSingleHook, useMultipleHook],
        [
          "with inline comparator",
          (props: WithStore & WithSpy) => {
            return useSingleHook(props, (prev, next) =>
              Counter.compare(prev, next),
            )
          },
          (props: WithFirst & WithSecond & WithThird & WithSpy) => {
            return useMultipleHook(props, (prev, next) =>
              Counter.compare(prev, next),
            )
          },
        ],
        [
          "with memoized comparator",
          (props: WithStore & WithSpy) => {
            return useSingleHook(props, Counter.compare)
          },
          (props: WithFirst & WithSecond & WithThird & WithSpy) => {
            return useMultipleHook(props, Counter.compare)
          },
        ],
      ])("%s", (__, singleHook, multipleHook) => {
        const setup = () => {
          const first = InnerStore.of({ count: 1 })
          const second = InnerStore.of({ count: 2 })
          const third = InnerStore.of({ count: 3 })
          const spySingle = jest.fn()
          const spyMultiple = jest.fn()

          const { result: resultSingle } = renderHook(singleHook, {
            initialProps: { store: first, spy: spySingle },
          })

          const { result: resultMultiple } = renderHook(multipleHook, {
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
          const { spySingle, spyMultiple, resultSingle, resultMultiple } =
            setup()

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
            expect(spyMultiple).toHaveBeenCalledTimes(
              spySingle.mock.calls.length,
            )
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
            expect(spyMultiple).toHaveBeenCalledTimes(
              spySingle.mock.calls.length,
            )
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
            expect(spyMultiple).toHaveBeenCalledTimes(
              spySingle.mock.calls.length,
            )
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
})

describe("nested stores are watching", () => {
  describe.each([
    [
      "inline watcher",
      ({ store }: WithStore<WithFirst & WithSecond>) => {
        return useInnerWatch(() => {
          const { first, second } = store.getState()

          return (
            first.getState(Counter.getCount) * second.getState(Counter.getCount)
          )
        })
      },
    ],
    [
      "memoized watcher",
      ({ store }: WithStore<WithFirst & WithSecond>) => {
        return useInnerWatch(
          useCallback(() => {
            const { first, second } = store.getState()

            return (
              first.getState(Counter.getCount) *
              second.getState(Counter.getCount)
            )
          }, [store]),
        )
      },
    ],
  ])("direct %s watching", (_, hook) => {
    const setup = () => {
      const first = InnerStore.of({ count: 2 })
      const second = InnerStore.of({ count: 2 })
      const store = InnerStore.of({ first, second })
      const { result } = renderHook(hook, {
        initialProps: { store },
      })

      return { store, first, second, result }
    }

    it.concurrent("initiates with expected result", () => {
      const { result } = setup()

      expect(result.current).toBe(4)
    })

    it.concurrent("increments only first", () => {
      const { first, result } = setup()

      act(() => {
        first.setState(Counter.inc)
      })
      expect(result.current).toBe(6)
    })

    it.concurrent("increments only second", () => {
      const { second, result } = setup()

      act(() => {
        second.setState(Counter.inc)
      })
      expect(result.current).toBe(6)
    })

    it.concurrent("increments both first and second", () => {
      const { first, second, result } = setup()

      act(() => {
        first.setState(Counter.inc)
        second.setState(Counter.inc)
      })
      expect(result.current).toBe(9)
    })

    it.concurrent("replaces nested stores", () => {
      const newFirst = InnerStore.of({ count: 4 })
      const { store, result } = setup()

      act(() => {
        store.setState((state) => ({
          ...state,
          first: newFirst,
        }))
      })
      expect(result.current).toBe(8)
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
      expect(result.current).toBe(9)
    })
  })
})
