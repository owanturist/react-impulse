import { act, renderHook } from "@testing-library/react"

import { Impulse, type Scope, useScoped } from "../../src"
import { Counter, type WithImpulse, type WithSpy } from "../common"

function factory(scope: Scope, { impulse, spy }: WithImpulse & WithSpy) {
  const value = impulse.read(scope)

  spy(value)

  return value
}

describe("factory without deps", () => {
  const setup = () => {
    const spy = vi.fn()
    const impulse = Impulse({ count: 1 })

    const { rerender } = renderHook((props) => useScoped((scope) => factory(scope, props)), {
      initialProps: { impulse, spy },
    })

    return { spy, impulse, rerender }
  }

  it("should call factory 1 time on init", () => {
    const { spy } = setup()

    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
  })

  it("should call factory 1 time on subsequent renders", () => {
    const { spy, impulse, rerender } = setup()

    spy.mockReset()

    rerender({ spy, impulse })
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
  })

  it("should call factory 2 times when a watching impulse changes", () => {
    const { spy, impulse } = setup()

    spy.mockReset()

    act(() => {
      impulse.setValue(Counter.inc)
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
    ({ impulse, spy }: WithImpulse & WithSpy) =>
      useScoped(
        (scope) => {
          const value = impulse.read(scope)

          spy(value)

          return value
        },
        [impulse, spy],
      ),
  ],
  [
    "with inline",
    ({ impulse, spy }: WithImpulse & WithSpy) =>
      useScoped(
        (scope) => {
          const value = impulse.read(scope)

          spy(value)

          return value
        },
        [impulse, spy],
        {
          equals: (prev, next) => Counter.equals(prev, next),
        },
      ),
  ],
  [
    "with memoized",
    ({ impulse, spy }: WithImpulse & WithSpy) =>
      useScoped(
        (scope) => {
          const value = impulse.read(scope)

          spy(value)

          return value
        },
        [impulse, spy],
        { equals: Counter.equals },
      ),
  ],
])("factory with deps and %s comparator", (_, useCounter) => {
  const setup = () => {
    const spy = vi.fn()
    const impulse = Impulse({ count: 1 })

    const { rerender } = renderHook(useCounter, {
      initialProps: { impulse, spy },
    })

    return { spy, impulse, rerender }
  }

  it("should call factory 1 time on init", () => {
    const { spy } = setup()

    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
  })

  it("should not call factory on subsequent renders", () => {
    const { spy, impulse, rerender } = setup()

    spy.mockReset()

    rerender({ spy, impulse })
    expect(spy).not.toHaveBeenCalled()
  })

  it("should call factory 1 time when a watching impulse changes", () => {
    const { spy, impulse } = setup()

    spy.mockReset()

    act(() => {
      impulse.setValue(Counter.inc)
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 2 })
  })
})
