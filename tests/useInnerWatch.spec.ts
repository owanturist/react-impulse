import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { InnerStore, useInnerWatch } from "../src"
import {
  WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING,
} from "../src/InnerStore"
import { noop } from "../src/utils"

import { Counter } from "./helpers"

interface WithStore<T = Counter> {
  store: InnerStore<T>
}

interface WithSpy<T = (counter: Counter) => Counter> {
  spy: T
}

interface WithInitial<T = Counter> {
  initial?: T
}

describe("no store is watching", () => {
  it.concurrent.each([
    [
      "inline",
      () => {
        return useInnerWatch(() => 1)
      },
    ],
    [
      "memoized",
      () => {
        return useInnerWatch(useCallback(() => 1, []))
      },
    ],
  ])("returns %s watcher result", (_, hook) => {
    const { result } = renderHook(hook)

    expect(result.current).toBe(1)
  })

  it.concurrent.each([
    [
      "inline",
      ({ value }: { value: number }) => {
        return useInnerWatch(() => 2 * value)
      },
    ],
    [
      "memoized",
      ({ value }: { value: number }) => {
        return useInnerWatch(useCallback(() => 2 * value, [value]))
      },
    ],
  ])("returns %s watcher result from clojure", (_, hook) => {
    const { result, rerender } = renderHook(hook, {
      initialProps: { value: 2 },
    })

    expect(result.current).toBe(4)

    rerender({ value: 3 })
    expect(result.current).toBe(6)
  })
})

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
  ])("direct %s watcher", (_, hook) => {
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

    it.concurrent("watches the replaced store changes", () => {
      const store_1 = InnerStore.of({ count: 1 })
      const store_2 = InnerStore.of({ count: 10 })

      const { result, rerender } = renderHook(hook, {
        initialProps: { store: store_1 },
      })

      rerender({ store: store_2 })
      expect(result.current).toStrictEqual({ count: 10 })

      act(() => {
        store_1.setState(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 10 })

      act(() => {
        store_2.setState(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 11 })

      rerender({ store: store_1 })
      expect(result.current).toStrictEqual({ count: 2 })

      act(() => {
        store_1.setState(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 3 })

      act(() => {
        store_2.setState(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 3 })
    })
  })

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
          return useInnerWatch(() => store.getState(spy))
        },
      ],
      [
        "inline watcher with inline comparator",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            () => store.getState(spy),
            (prev, next) => Counter.compare(prev, next),
          )
        },
      ],
      [
        "inline watcher with memoized comparator",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(() => store.getState(spy), Counter.compare)
        },
      ],
      [
        "memoized watcher",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            useCallback(() => store.getState(spy), [spy, store]),
          )
        },
      ],
      [
        "memoized watcher with inline comparator",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            useCallback(() => store.getState(spy), [spy, store]),
            (prev, next) => Counter.compare(prev, next),
          )
        },
      ],
      [
        "memoized watcher with memoized comparator",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            useCallback(() => store.getState(spy), [spy, store]),
            Counter.compare,
          )
        },
      ],
    ])(
      "should not trigger the %s when store sets comparably equal state",
      (_, hook) => {
        const store = InnerStore.of({ count: 1 })
        const spy = jest.fn((counter: Counter) => counter)

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
          return spy(initial ?? store.getState())
        })
      },
    ],
    [
      "inline watcher with inline comparator",
      ({ initial, spy, store }: WithStore & WithSpy & WithInitial) => {
        return useInnerWatch(
          () => {
            return spy(initial ?? store.getState())
          },
          (prev, next) => Counter.compare(prev, next),
        )
      },
    ],
    [
      "inline watcher with memoized comparator",
      ({ initial, spy, store }: WithStore & WithSpy & WithInitial) => {
        return useInnerWatch(() => {
          return spy(initial ?? store.getState())
        }, Counter.compare)
      },
    ],
    [
      "memoized watcher",
      ({ initial, spy, store }: WithStore & WithSpy & WithInitial) => {
        return useInnerWatch(
          useCallback(() => {
            return spy(initial ?? store.getState())
          }, [initial, spy, store]),
        )
      },
    ],
    [
      "memoized watcher with inline comparator",
      ({ initial, spy, store }: WithStore & WithSpy & WithInitial) => {
        return useInnerWatch(
          useCallback(() => {
            return spy(initial ?? store.getState())
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
            return spy(initial ?? store.getState())
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
      const spy = jest.fn((counter: Counter) => counter)

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
    it.concurrent.each([
      [
        "inline watcher",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(() => store.getState(spy))
        },
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(() => {
            return spy(Counter.merge(store.getState(), store.getState()))
          })
        },
      ],
      [
        "inline watcher with inline comparator",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            () => store.getState(spy),
            (prev, next) => Counter.compare(prev, next),
          )
        },
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            () => {
              return spy(Counter.merge(store.getState(), store.getState()))
            },
            (prev, next) => Counter.compare(prev, next),
          )
        },
      ],
      [
        "inline watcher with memoized comparator",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(() => store.getState(spy), Counter.compare)
        },
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(() => {
            return spy(Counter.merge(store.getState(), store.getState()))
          }, Counter.compare)
        },
      ],
      [
        "memoized watcher",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            useCallback(() => store.getState(spy), [spy, store]),
          )
        },
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            useCallback(() => {
              return spy(Counter.merge(store.getState(), store.getState()))
            }, [spy, store]),
          )
        },
      ],
      [
        "memoized watcher with inline comparator",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            useCallback(() => store.getState(spy), [spy, store]),
            (prev, next) => Counter.compare(prev, next),
          )
        },
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            useCallback(() => {
              return spy(Counter.merge(store.getState(), store.getState()))
            }, [spy, store]),
            (prev, next) => Counter.compare(prev, next),
          )
        },
      ],
      [
        "memoized watcher with memoized comparator",
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            useCallback(() => store.getState(spy), [spy, store]),
            Counter.compare,
          )
        },
        ({ spy, store }: WithStore & WithSpy) => {
          return useInnerWatch(
            useCallback(() => {
              return spy(Counter.merge(store.getState(), store.getState()))
            }, [spy, store]),
            Counter.compare,
          )
        },
      ],
    ])(
      "multiple calls triggers %s the same amount as for a single call",
      (_, single, double) => {
        const spySingle = jest.fn((counter: Counter) => counter)
        const spyDouble = jest.fn((counter: Counter) => counter)
        const store = InnerStore.of({ count: 1 })

        const { result: resultSingle } = renderHook(single, {
          initialProps: { spy: spySingle, store },
        })
        const { result: resultDouble } = renderHook(double, {
          initialProps: { spy: spyDouble, store },
        })

        expect(resultSingle.current).toStrictEqual({ count: 1 })
        expect(resultDouble.current).toStrictEqual({ count: 2 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)

        act(() => {
          store.setState(Counter.inc)
        })

        expect(resultSingle.current).toStrictEqual({ count: 2 })
        expect(resultDouble.current).toStrictEqual({ count: 4 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)

        act(() => {
          store.setState(Counter.clone)
        })

        expect(resultSingle.current).toStrictEqual({ count: 2 })
        expect(resultDouble.current).toStrictEqual({ count: 4 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)

        act(() => {
          store.setState(Counter.clone, Counter.compare)
        })

        expect(resultSingle.current).toStrictEqual({ count: 2 })
        expect(resultDouble.current).toStrictEqual({ count: 4 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)

        act(() => {
          store.setState(Counter.inc, Counter.compare)
        })

        expect(resultSingle.current).toStrictEqual({ count: 3 })
        expect(resultDouble.current).toStrictEqual({ count: 6 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
      },
    )
  })
})

describe("illegal usage", () => {
  const console$error = jest
    .spyOn(console, "error")
    .mockImplementation(jest.fn())

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe.each([
    [
      "inline",
      () => {
        return useInnerWatch(() => InnerStore.of(1).getState())
      },
    ],
    [
      "memoized",
      () => {
        return useInnerWatch(useCallback(() => InnerStore.of(1).getState(), []))
      },
    ],
  ])("when calling InnerStore.of() inside of the %s watcher", (_, hook) => {
    it.concurrent("calls console.error", () => {
      renderHook(hook)

      expect(console$error).toHaveBeenLastCalledWith(
        WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING,
      )
    })

    it.concurrent("returns the new store's value", () => {
      const { result } = renderHook(hook)

      expect(result.current).toBe(1)
    })
  })

  describe.each([
    [
      "inline",
      ({ store }: WithStore<number>) => {
        return useInnerWatch(() => store.clone().getState())
      },
    ],
    [
      "memoized",
      ({ store }: WithStore<number>) => {
        return useInnerWatch(
          useCallback(() => store.clone().getState(), [store]),
        )
      },
    ],
  ])(
    "warn on calling InnerStore#clone() inside of the %s watcher",
    (_, hook) => {
      it.concurrent("calls console.error", () => {
        const store = InnerStore.of(2)
        renderHook(hook, {
          initialProps: { store },
        })

        expect(console$error).toHaveBeenLastCalledWith(
          WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING,
        )
      })

      it.concurrent("returns the cloned store's value", () => {
        const store = InnerStore.of(2)
        const { result } = renderHook(hook, {
          initialProps: { store },
        })

        expect(result.current).toBe(2)
      })
    },
  )

  describe.each([
    [
      "inline",
      ({ store }: WithStore<number>) => {
        return useInnerWatch(() => {
          store.setState(3)

          return store.getState()
        })
      },
    ],
    [
      "memoized",
      ({ store }: WithStore<number>) => {
        return useInnerWatch(
          useCallback(() => {
            store.setState(3)

            return store.getState()
          }, [store]),
        )
      },
    ],
  ])(
    "warn on calling InnerStore#setState() inside of the %s watcher",
    (_, hook) => {
      it.concurrent("calls console.error", () => {
        const store = InnerStore.of(4)
        renderHook(hook, {
          initialProps: { store },
        })

        expect(console$error).toHaveBeenLastCalledWith(
          WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING,
        )
      })

      it.concurrent("does not change the store's value", () => {
        const store = InnerStore.of(4)
        const { result } = renderHook(hook, {
          initialProps: { store },
        })

        expect(result.current).toBe(4)
      })
    },
  )

  describe.each([
    [
      "inline",
      ({
        store,
        listener = jest.fn(),
      }: {
        store: InnerStore<number>
        listener?: VoidFunction
      }) => {
        return useInnerWatch(() => {
          store.subscribe(listener)

          return store.getState()
        })
      },
    ],
    [
      "memoized",
      ({
        store,
        listener = jest.fn(),
      }: {
        store: InnerStore<number>
        listener?: VoidFunction
      }) => {
        return useInnerWatch(
          useCallback(() => {
            store.subscribe(listener)

            return store.getState()
          }, [store, listener]),
        )
      },
    ],
  ])(
    "warn on calling InnerStore#subscribe() inside of the %s watcher",
    (_, hook) => {
      it.concurrent("calls console.error", () => {
        const store = InnerStore.of(4)

        renderHook(hook, {
          initialProps: { store },
        })

        expect(console$error).toHaveBeenLastCalledWith(
          WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING,
        )
      })

      it.concurrent("returns the store's value", () => {
        const store = InnerStore.of(4)
        const { result } = renderHook(hook, {
          initialProps: { store },
        })

        expect(result.current).toBe(4)
      })

      it.concurrent("returns noop function as unsubscribe", () => {
        const store = InnerStore.of(4)
        const store$subscribe = jest.spyOn(store, "subscribe")

        renderHook(hook, {
          initialProps: { store },
        })

        expect(store$subscribe).toHaveReturnedWith(noop)
      })

      it.concurrent("does not call the listener on store's change", () => {
        const store = InnerStore.of(4)
        const listener = jest.fn()
        const correctListener = jest.fn()

        renderHook(hook, {
          initialProps: { store, listener },
        })

        store.subscribe(correctListener)

        expect(listener).not.toHaveBeenCalled()
        expect(correctListener).not.toHaveBeenCalled()

        store.setState(1)
        expect(listener).not.toHaveBeenCalled()
        expect(correctListener).toHaveBeenCalledTimes(1)
      })
    },
  )
})
