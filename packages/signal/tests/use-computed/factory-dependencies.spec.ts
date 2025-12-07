import { act, renderHook } from "@testing-library/react"

import { type Monitor, Signal, useComputed } from "../../src"
import { Counter, type WithSignal, type WithSpy } from "../common"

function factory(monitor: Monitor, { signal, spy }: WithSignal & WithSpy) {
  const value = signal.read(monitor)

  spy(value)

  return value
}

describe("factory without deps", () => {
  const setup = () => {
    const spy = vi.fn()
    const signal = Signal({ count: 1 })

    const { rerender } = renderHook((props) => useComputed((monitor) => factory(monitor, props)), {
      initialProps: { signal, spy },
    })

    return { spy, signal, rerender }
  }

  it("should call factory 1 time on init", () => {
    const { spy } = setup()

    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
  })

  it("should call factory 1 time on subsequent renders", () => {
    const { spy, signal, rerender } = setup()

    spy.mockReset()

    rerender({ spy, signal })
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
  })

  it("should call factory 2 times when a watching signal changes", () => {
    const { spy, signal } = setup()

    spy.mockReset()

    act(() => {
      signal.update(Counter.inc)
    })

    // 1st executes factory to extract new result
    // --it causes reconciliation--
    // 2nd extracts the factory result
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenNthCalledWith(1, { count: 2 })
    expect(spy).toHaveBeenNthCalledWith(2, { count: 2 })
  })
})

describe.each([
  [
    "without",
    ({ signal, spy }: WithSignal & WithSpy) =>
      useComputed(
        (monitor) => {
          const value = signal.read(monitor)

          spy(value)

          return value
        },
        [signal, spy],
      ),
  ],
  [
    "with inline",
    ({ signal, spy }: WithSignal & WithSpy) =>
      useComputed(
        (monitor) => {
          const value = signal.read(monitor)

          spy(value)

          return value
        },
        [signal, spy],
        {
          equals: (prev, next) => Counter.equals(prev, next),
        },
      ),
  ],
  [
    "with memoized",
    ({ signal, spy }: WithSignal & WithSpy) =>
      useComputed(
        (monitor) => {
          const value = signal.read(monitor)

          spy(value)

          return value
        },
        [signal, spy],
        { equals: Counter.equals },
      ),
  ],
])("factory with deps and %s comparator", (_, useCounter) => {
  const setup = () => {
    const spy = vi.fn()
    const signal = Signal({ count: 1 })

    const { rerender } = renderHook(useCounter, {
      initialProps: { signal, spy },
    })

    return { spy, signal, rerender }
  }

  it("should call factory 1 time on init", () => {
    const { spy } = setup()

    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
  })

  it("should not call factory on subsequent renders", () => {
    const { spy, signal, rerender } = setup()

    spy.mockReset()

    rerender({ spy, signal })
    expect(spy).not.toHaveBeenCalled()
  })

  it("should call factory 1 time when a watching signal changes", () => {
    const { spy, signal } = setup()

    spy.mockReset()

    act(() => {
      signal.update(Counter.inc)
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 2 })
  })
})
