import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { Sweety, useWatchSweety } from "../../src"
import { Counter, WithSpy, WithStore } from "../common"

describe.each([
  [
    "without comparator",
    ({ store, spy }: WithStore & WithSpy) => {
      return useWatchSweety(() => {
        spy()

        return store.getState()
      })
    },
  ],
  [
    "with inline comparator",
    ({ store, spy }: WithStore & WithSpy) => {
      return useWatchSweety(
        () => {
          spy()

          return store.getState()
        },
        (prev, next) => Counter.compare(prev, next),
      )
    },
  ],
  [
    "with memoized comparator",
    ({ store, spy }: WithStore & WithSpy) => {
      return useWatchSweety(() => {
        spy()

        return store.getState()
      }, Counter.compare)
    },
  ],
])("inline watcher %s", (_, useHook) => {
  const setup = () => {
    const spy = vi.fn()
    const store = Sweety.of({ count: 1 })

    const { rerender } = renderHook(useHook, {
      initialProps: { store, spy },
    })

    return { spy, store, rerender }
  }

  it.concurrent("should call watcher 2 times on init", () => {
    const { spy } = setup()

    // 1st extracts the watcher result
    // 2nd subscribes to the included stores' changes
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it.concurrent("should call watcher 2 times on subsequent renders", () => {
    const { spy, store, rerender } = setup()

    spy.mockReset()

    rerender({ spy, store })
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it.concurrent(
    "should call watcher 3 times when a watching store changes",
    () => {
      const { spy, store } = setup()

      spy.mockReset()

      act(() => {
        store.setState(Counter.inc)
      })

      // 1st executes watcher to extract new result
      // --it causes reconciliation--
      // 2nd extracts the watcher result
      // 3rd subscribes to the included stores' changes
      expect(spy).toHaveBeenCalledTimes(3)
    },
  )
})

describe.each([
  [
    "without comparator",
    ({ store, spy }: WithStore & WithSpy) => {
      return useWatchSweety(
        useCallback(() => {
          spy()

          return store.getState()
        }, [store, spy]),
      )
    },
  ],
  [
    "with inline comparator",
    ({ store, spy }: WithStore & WithSpy) => {
      return useWatchSweety(
        useCallback(() => {
          spy()

          return store.getState()
        }, [store, spy]),
        (prev, next) => Counter.compare(prev, next),
      )
    },
  ],
  [
    "with memoized comparator",
    ({ store, spy }: WithStore & WithSpy) => {
      return useWatchSweety(
        useCallback(() => {
          spy()

          return store.getState()
        }, [store, spy]),
        Counter.compare,
      )
    },
  ],
])("memoized watcher %s", (__, useHook) => {
  const setup = () => {
    const spy = vi.fn()
    const store = Sweety.of({ count: 1 })

    const { rerender } = renderHook(useHook, {
      initialProps: { store, spy },
    })

    return { spy, store, rerender }
  }

  it.concurrent("should call watcher 2 times on init", () => {
    const { spy } = setup()

    // 1st extracts the watcher result
    // 2nd subscribes to the included stores' changes
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it.concurrent("should not call watcher on subsequent renders", () => {
    const { spy, store, rerender } = setup()

    spy.mockReset()

    rerender({ spy, store })
    expect(spy).not.toHaveBeenCalled()
  })

  it.concurrent(
    "should call watcher 1 time when a watching store changes",
    () => {
      const { spy, store } = setup()

      spy.mockReset()

      act(() => {
        store.setState(Counter.inc)
      })

      // 1st executes watcher to extract new result
      expect(spy).toHaveBeenCalledTimes(1)
    },
  )
})
