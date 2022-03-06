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

interface WithInitial<T = Counter> {
  initial?: T
}

describe("watcher memoisation", () => {
  it.concurrent("should call the inline watcher on each reconciliation", () => {
    const spy = jest.fn()
    const store = InnerStore.of({ count: 1 })

    const { rerender } = renderHook(() => {
      return useInnerWatch(() => {
        spy()

        return store.getState()
      })
    })

    // 1st extracts the watcher result
    // 2nd subscribes to the included stores' changes
    expect(spy).toHaveBeenCalledTimes(2)

    rerender()
    expect(spy).toHaveBeenCalledTimes(4)

    rerender()
    expect(spy).toHaveBeenCalledTimes(6)

    act(() => {
      store.setState(Counter.inc)
    })
    // 1st executes watcher to extract new result
    // --it causes reconciliation--
    // 2nd extracts the watcher result
    // 3rd subscribes to the included stores' changes
    expect(spy).toHaveBeenCalledTimes(9)
  })

  it.concurrent(
    "should not call the memoized watcher on each reconciliation",
    () => {
      const spy = jest.fn()
      const store = InnerStore.of({ count: 1 })

      const { rerender } = renderHook(() => {
        return useInnerWatch(
          useCallback(() => {
            spy()

            return store.getState()
          }, []),
        )
      })

      // 1st extracts the watcher result
      // 2nd subscribes to the included stores' changes
      expect(spy).toHaveBeenCalledTimes(2)

      rerender()
      expect(spy).toHaveBeenCalledTimes(2)

      rerender()
      expect(spy).toHaveBeenCalledTimes(2)

      act(() => {
        store.setState(Counter.inc)
      })
      // 1st executes watcher to extract new result
      expect(spy).toHaveBeenCalledTimes(3)
    },
  )
})

describe("single store is watching", () => {
  describe.each([
    [
      "inline watcher",
      ({ store }: WithStore) => {
        return useInnerWatch(() => store.getState())
      },
    ],
    [
      "inline watcher with inline comparator",
      ({ store }: WithStore) => {
        return useInnerWatch(
          () => store.getState(),
          (prev, next) => Counter.compare(prev, next),
        )
      },
    ],
    [
      "inline watcher with memoized comparator",
      ({ store }: WithStore) => {
        return useInnerWatch(() => store.getState(), Counter.compare)
      },
    ],
    [
      "memoized watcher",
      ({ store }: WithStore) => {
        return useInnerWatch(useCallback(() => store.getState(), [store]))
      },
    ],
    [
      "memoized watcher with inline comparator",
      ({ store }: WithStore) => {
        return useInnerWatch(
          useCallback(() => store.getState(), [store]),
          (prev, next) => Counter.compare(prev, next),
        )
      },
    ],
    [
      "memoized watcher with memoized comparator",
      ({ store }: WithStore) => {
        return useInnerWatch(
          useCallback(() => store.getState(), [store]),
          Counter.compare,
        )
      },
    ],
  ])("direct %s", (_, hook) => {
    it.concurrent("watches the store's changes", () => {
      const store = InnerStore.of({ count: 1 })

      const { result } = renderHook(hook, {
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
        const store_1 = InnerStore.of({ count: 1 })
        const store_2 = InnerStore.of({ count: 10 })

        const { result, rerender } = renderHook(hook, {
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

  describe.skip.each([
    [
      "inline",
      ({ store }: WithStore) => {
        return useInnerWatch(() => store.getState())
      },
    ],
    [
      "memoized",
      ({ store }: WithStore) => {
        return useInnerWatch(useCallback(() => store.getState(), [store]))
      },
    ],
  ])("conditional %s", () => {})

  describe("transform state's value inside watcher", () => {
    const toTuple = ({ count }: Counter): [boolean, boolean] => {
      return [count > 2, count < 5]
    }

    const compareTuple = (
      [prevLeft, prevRight]: [boolean, boolean],
      [nextLeft, nextRight]: [boolean, boolean],
    ): boolean => {
      return prevLeft === nextLeft && prevRight === nextRight
    }

    it.concurrent.each([
      [
        "inline",
        ({ store }: WithStore) => {
          return useInnerWatch(() => store.getState(toTuple))
        },
      ],
      [
        "memoized",
        ({ store }: WithStore) => {
          return useInnerWatch(
            useCallback(() => store.getState(toTuple), [store]),
          )
        },
      ],
    ])(
      "produces new value on each store's update with %s watcher",
      (_, hook) => {
        const store = InnerStore.of({ count: 1 })

        const { result, rerender } = renderHook(hook, {
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

    it.concurrent.each([
      [
        "inline watcher with inline comparator",
        ({ store }: WithStore) => {
          return useInnerWatch(
            () => store.getState(toTuple),
            (prev, next) => compareTuple(prev, next),
          )
        },
      ],
      [
        "inline watcher with memoized comparator",
        ({ store }: WithStore) => {
          return useInnerWatch(() => store.getState(toTuple), compareTuple)
        },
      ],
      [
        "memoized watcher with inline comparator",
        ({ store }: WithStore) => {
          return useInnerWatch(
            useCallback(() => store.getState(toTuple), [store]),
            (prev, next) => compareTuple(prev, next),
          )
        },
      ],
      [
        "memoized watcher with memoized comparator",
        ({ store }: WithStore) => {
          return useInnerWatch(
            useCallback(() => store.getState(toTuple), [store]),
            compareTuple,
          )
        },
      ],
    ])("keeps the old value when it is comparably equal when %s", (_, hook) => {
      const store = InnerStore.of({ count: 1 })

      const { result, rerender } = renderHook(hook, {
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
    })

    it.concurrent.each([
      [
        "inline watcher",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(() => {
            spy()

            return store.getState()
          })
        },
      ],
      [
        "inline watcher with inline comparator",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            () => {
              spy()

              return store.getState()
            },
            (prev, next) => Counter.compare(prev, next),
          )
        },
      ],
      [
        "inline watcher with memoized comparator",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(() => {
            spy()

            return store.getState()
          }, Counter.compare)
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
      ],
      [
        "memoized watcher with inline comparator",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            useCallback(() => {
              spy()

              return store.getState()
            }, [spy, store]),
            (prev, next) => Counter.compare(prev, next),
          )
        },
      ],
      [
        "memoized watcher with memoized comparator",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            useCallback(() => {
              spy()

              return store.getState()
            }, [spy, store]),
            Counter.compare,
          )
        },
      ],
    ])(
      "should not trigger the %s when store sets comparably equal state",
      (_, hook) => {
        const store = InnerStore.of({ count: 1 })
        const spy = jest.fn()

        renderHook(hook, {
          initialProps: { spy, store },
        })

        // 1st extracts the watcher result
        // 2nd subscribes to the included stores' changes
        expect(spy).toHaveBeenCalledTimes(2)

        act(() => {
          store.setState(Counter.clone, Counter.compare)
        })

        expect(spy).toHaveBeenCalledTimes(2)
      },
    )
  })

  it.concurrent.each([
    [
      "inline watcher",
      ({ initial, spy, store }: WithStore & WithSpy & WithInitial) => {
        return useInnerWatch(() => {
          spy()

          return initial ?? store.getState()
        })
      },
    ],
    [
      "inline watcher with inline comparator",
      ({ initial, spy, store }: WithStore & WithSpy & WithInitial) => {
        return useInnerWatch(
          () => {
            spy()

            return initial ?? store.getState()
          },
          (prev, next) => Counter.compare(prev, next),
        )
      },
    ],
    [
      "inline watcher with memoized comparator",
      ({ initial, spy, store }: WithStore & WithSpy & WithInitial) => {
        return useInnerWatch(() => {
          spy()

          return initial ?? store.getState()
        }, Counter.compare)
      },
    ],
    [
      "memoized watcher",
      ({ initial, spy, store }: WithStore & WithSpy & WithInitial) => {
        return useInnerWatch(
          useCallback(() => {
            spy()

            return initial ?? store.getState()
          }, [initial, spy, store]),
        )
      },
    ],
    [
      "memoized watcher with inline comparator",
      ({ initial, spy, store }: WithStore & WithSpy & WithInitial) => {
        return useInnerWatch(
          useCallback(() => {
            spy()

            return initial ?? store.getState()
          }, [initial, spy, store]),
          (prev, next) => Counter.compare(prev, next),
        )
      },
    ],
    [
      "memoized watcher with memoized comparator",
      ({ initial, spy, store }: WithStore & WithSpy & WithInitial) => {
        return useInnerWatch(
          useCallback(() => {
            spy()

            return initial ?? store.getState()
          }, [initial, spy, store]),
          Counter.compare,
        )
      },
    ],
  ])(
    "should not trigger %s when store#getState() is not part of the watcher execution",
    (_, hook) => {
      const initial = { count: 0 }
      const store = InnerStore.of({ count: 1 })
      const spy = jest.fn()

      const { result } = renderHook(hook, {
        initialProps: { initial, spy, store },
      })

      // 1st extracts the watcher result
      // 2nd subscribes to the included stores' changes
      expect(spy).toHaveBeenCalledTimes(2)
      expect(result.current).toBe(initial)

      act(() => {
        store.setState(Counter.inc)
      })

      expect(spy).toHaveBeenCalledTimes(2)
      expect(result.current).toBe(initial)
    },
  )

  describe("multiple store#getState() called for the same store", () => {
    describe.each([
      [
        "inline watcher",
        ({ spy, store }: WithStore & WithSpy, compare?: Compare<Counter>) => {
          return useInnerWatch(() => {
            spy()

            return store.getState()
          }, compare)
        },
        ({ spy, store }: WithStore & WithSpy, compare?: Compare<Counter>) => {
          return useInnerWatch(() => {
            spy()

            return Counter.merge(store.getState(), store.getState())
          }, compare)
        },
      ],
      [
        "memoized watcher",
        ({ spy, store }: WithStore & WithSpy, compare?: Compare<Counter>) => {
          return useInnerWatch(
            useCallback(() => {
              spy()

              return store.getState()
            }, [spy, store]),
            compare,
          )
        },
        ({ spy, store }: WithStore & WithSpy, compare?: Compare<Counter>) => {
          return useInnerWatch(
            useCallback(() => {
              spy()

              return Counter.merge(store.getState(), store.getState())
            }, [spy, store]),
            compare,
          )
        },
      ],
    ])(
      "triggering %s for multiple store#getState() calls the same as for a single",
      (_, useSingleHook, useDoubleHook) => {
        describe.each([
          ["without comparator", useSingleHook, useDoubleHook],
          [
            "with inline comparator",
            (props: WithStore & WithSpy) => {
              return useSingleHook(props, (prev, next) =>
                Counter.compare(prev, next),
              )
            },
            (props: WithStore & WithSpy) => {
              return useDoubleHook(props, (prev, next) =>
                Counter.compare(prev, next),
              )
            },
          ],
          [
            "with memoized comparator",
            (props: WithStore & WithSpy) => {
              return useSingleHook(props, Counter.compare)
            },
            (props: WithStore & WithSpy) => {
              return useDoubleHook(props, Counter.compare)
            },
          ],
        ])("%s", (__, singleHook, doubleHook) => {
          const setup = () => {
            const spySingle = jest.fn()
            const spyDouble = jest.fn()
            const store = InnerStore.of({ count: 1 })

            const { result: resultSingle } = renderHook(singleHook, {
              initialProps: { spy: spySingle, store },
            })
            const { result: resultDouble } = renderHook(doubleHook, {
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

          it.concurrent.each([
            // eslint-disable-next-line no-undefined
            ["without store#setState comparator", undefined],
            ["with store#setState comparator", Counter.compare],
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

          it.concurrent.each([
            // eslint-disable-next-line no-undefined
            ["without store#setState comparator", undefined],
            ["with store#setState comparator", Counter.compare],
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
})

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
