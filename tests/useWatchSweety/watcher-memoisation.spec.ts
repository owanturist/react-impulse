import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { Sweety, useWatchSweety } from "../../src"
import { Counter, WithSpy, WithStore } from "../common"

describe.each([
  [
    "without comparator",
    ({ store, spy }: WithStore & WithSpy) => {
      return useWatchSweety(() => {
        const value = store.getState()

        spy(value)

        return value
      })
    },
  ],
  [
    "with inline comparator",
    ({ store, spy }: WithStore & WithSpy) => {
      return useWatchSweety(
        () => {
          const value = store.getState()

          spy(value)

          return value
        },
        (prev, next) => Counter.compare(prev, next),
      )
    },
  ],
  [
    "with memoized comparator",
    ({ store, spy }: WithStore & WithSpy) => {
      return useWatchSweety(() => {
        const value = store.getState()

        spy(value)

        return value
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

  it.concurrent("should call watcher 1 time on init", () => {
    const { spy } = setup()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith({ count: 1 })
  })

  it.concurrent("should call watcher 1 time on subsequent renders", () => {
    const { spy, store, rerender } = setup()

    spy.mockReset()

    rerender({ spy, store })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith({ count: 1 })
  })

  it.concurrent(
    "should call watcher 2 times when a watching store changes",
    () => {
      const { spy, store } = setup()

      spy.mockReset()

      act(() => {
        store.setState(Counter.inc)
      })

      // 1st executes watcher to extract new result
      // --it causes reconciliation--
      // 2nd extracts the watcher result
      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenNthCalledWith(1, { count: 2 })
      expect(spy).toHaveBeenNthCalledWith(2, { count: 2 })
    },
  )
})

describe.each([
  [
    "without comparator",
    ({ store, spy }: WithStore & WithSpy) => {
      return useWatchSweety(
        useCallback(() => {
          const value = store.getState()

          spy(value)

          return value
        }, [store, spy]),
      )
    },
  ],
  [
    "with inline comparator",
    ({ store, spy }: WithStore & WithSpy) => {
      return useWatchSweety(
        useCallback(() => {
          const value = store.getState()

          spy(value)

          return value
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
          const value = store.getState()

          spy(value)

          return value
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

  it.concurrent("should call watcher 1 time on init", () => {
    const { spy } = setup()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith({ count: 1 })
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

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith({ count: 2 })
    },
  )
})
