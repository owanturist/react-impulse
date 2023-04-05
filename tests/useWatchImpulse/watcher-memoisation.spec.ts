import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { Impulse, useWatchImpulse } from "../../src"
import { Counter, WithSpy, WithImpulse } from "../common"

describe.each([
  [
    "without comparator",
    ({ impulse, spy }: WithImpulse & WithSpy) => {
      return useWatchImpulse((scope) => {
        const value = impulse.getValue(scope)

        spy(value)

        return value
      })
    },
  ],
  [
    "with inline comparator",
    ({ impulse, spy }: WithImpulse & WithSpy) => {
      return useWatchImpulse(
        (scope) => {
          const value = impulse.getValue(scope)

          spy(value)

          return value
        },
        (prev, next) => Counter.compare(prev, next),
      )
    },
  ],
  [
    "with memoized comparator",
    ({ impulse, spy }: WithImpulse & WithSpy) => {
      return useWatchImpulse((scope) => {
        const value = impulse.getValue(scope)

        spy(value)

        return value
      }, Counter.compare)
    },
  ],
])("inline watcher %s", (_, useHook) => {
  const setup = () => {
    const spy = vi.fn()
    const impulse = Impulse.of({ count: 1 })

    const { rerender } = renderHook(useHook, {
      initialProps: { impulse, spy },
    })

    return { spy, impulse, rerender }
  }

  it.concurrent("should call watcher 1 time on init", () => {
    const { spy } = setup()

    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith({ count: 1 })
  })

  it.concurrent("should call watcher 1 time on subsequent renders", () => {
    const { spy, impulse, rerender } = setup()

    spy.mockReset()

    rerender({ spy, impulse })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith({ count: 1 })
  })

  it.concurrent(
    "should call watcher 2 times when a watching impulse changes",
    () => {
      const { spy, impulse } = setup()

      spy.mockReset()

      act(() => {
        impulse.setValue(Counter.inc)
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
    ({ impulse, spy }: WithImpulse & WithSpy) => {
      return useWatchImpulse(
        useCallback(
          (scope) => {
            const value = impulse.getValue(scope)

            spy(value)

            return value
          },
          [impulse, spy],
        ),
      )
    },
  ],
  [
    "with inline comparator",
    ({ impulse, spy }: WithImpulse & WithSpy) => {
      return useWatchImpulse(
        useCallback(
          (scope) => {
            const value = impulse.getValue(scope)

            spy(value)

            return value
          },
          [impulse, spy],
        ),
        (prev, next) => Counter.compare(prev, next),
      )
    },
  ],
  [
    "with memoized comparator",
    ({ impulse, spy }: WithImpulse & WithSpy) => {
      return useWatchImpulse(
        useCallback(
          (scope) => {
            const value = impulse.getValue(scope)

            spy(value)

            return value
          },
          [impulse, spy],
        ),
        Counter.compare,
      )
    },
  ],
])("memoized watcher %s", (__, useHook) => {
  const setup = () => {
    const spy = vi.fn()
    const impulse = Impulse.of({ count: 1 })

    const { rerender } = renderHook(useHook, {
      initialProps: { impulse, spy },
    })

    return { spy, impulse, rerender }
  }

  it.concurrent("should call watcher 1 time on init", () => {
    const { spy } = setup()

    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith({ count: 1 })
  })

  it.concurrent("should not call watcher on subsequent renders", () => {
    const { spy, impulse, rerender } = setup()

    spy.mockReset()

    rerender({ spy, impulse })
    expect(spy).not.toHaveBeenCalled()
  })

  it.concurrent(
    "should call watcher 1 time when a watching impulse changes",
    () => {
      const { spy, impulse } = setup()

      spy.mockReset()

      act(() => {
        impulse.setValue(Counter.inc)
      })

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenLastCalledWith({ count: 2 })
    },
  )
})
