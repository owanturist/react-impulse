import React from "react"
import { renderHook } from "@testing-library/react-hooks"
import { act, render, screen } from "@testing-library/react"

import {
  Impulse,
  subscribe,
  useScopedEffect,
  useScopedLayoutEffect,
  useScopedMemo,
  useScoped,
  scoped,
} from "../src"
import {
  WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SET_VALUE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING,
} from "../src/validation"
import { noop } from "../src/utils"

import { WithImpulse, WithListener } from "./common"

const console$error = vi
  .spyOn(console, "error")
  .mockImplementation(vi.fn() as VoidFunction)

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  console$error.mockRestore()
})

describe("calling Impulse.of()", () => {
  describe.each([
    [
      "useScopedMemo",
      "You should not call Impulse#of inside of the useScopedMemo factory. The useScopedMemo hook is for read-only operations but Impulse#of creates a new Impulse.",
      () => {
        return useScopedMemo((scope) => Impulse.of(1).getValue(scope), [])
      },
    ],
    [
      "inline useScoped",
      "You should not call Impulse#of inside of the useScoped factory. The useScoped hook is for read-only operations but Impulse#of creates a new Impulse.",
      () => {
        return useScoped((scope) => Impulse.of(1).getValue(scope))
      },
    ],
    [
      "memoized useScoped",
      "You should not call Impulse#of inside of the useScoped factory. The useScoped hook is for read-only operations but Impulse#of creates a new Impulse.",
      () => {
        return useScoped((scope) => Impulse.of(1).getValue(scope), [])
      },
    ],
  ])("warns when called inside %s", (_, message, useHook) => {
    it.concurrent("calls console.error", () => {
      renderHook(useHook)

      expect(console$error).toHaveBeenLastCalledWith(message)
    })

    it.concurrent("returns the new Impulse's value", () => {
      const { result } = renderHook(useHook)

      expect(result.current).toBe(1)
    })
  })

  it.concurrent("warns when called inside subscribe()", () => {
    subscribe(() => {
      Impulse.of(1)
    })

    expect(console$error).toHaveBeenLastCalledWith(
      "You should not call Impulse#of inside of the subscribe listener. The listener is for read-only operations but Impulse#of creates a new Impulse.",
    )
  })

  describe.each([
    ["useScopedEffect", useScopedEffect],
    ["useScopedLayoutEffect", useScopedLayoutEffect],
  ])("fine when called inside %s", (_, useScopedEffectHook) => {
    it.concurrent("works fine, does not call console.error", ({ scope }) => {
      const { result } = renderHook(() => {
        const [state, setState] = React.useState(Impulse.of(1))

        useScopedEffectHook(() => {
          setState(Impulse.of(10))
        }, [])

        return state
      })

      expect(console$error).not.toHaveBeenCalled()
      expect(result.current.getValue(scope)).toBe(10)
    })
  })

  it.concurrent("fine when called inside scoped()", ({ scope }) => {
    const Component = scoped(() => {
      const [state] = React.useState(Impulse.of(20))

      return <div data-testid="count">{state.getValue(scope)}</div>
    })

    render(<Component />)

    expect(console$error).not.toHaveBeenCalled()
    expect(screen.getByTestId("count")).toHaveTextContent("20")
  })
})

describe.skip("calling Impulse#clone()", () => {
  describe.each([
    [
      "useScopedMemo",
      WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING.useScopedMemo,
      ({ impulse }: WithImpulse<number>) => {
        return useScopedMemo(() => impulse.clone().getValue(), [impulse])
      },
    ],
    [
      "inline useScoped",
      WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING.useScoped,
      ({ impulse }: WithImpulse<number>) => {
        return useScoped(() => impulse.clone().getValue())
      },
    ],
    [
      "memoized useScoped",
      WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING.useScoped,
      ({ impulse }: WithImpulse<number>) => {
        return useScoped(
          React.useCallback(() => impulse.clone().getValue(), [impulse]),
        )
      },
    ],
  ])("warn when called inside %s", (_, message, useHook) => {
    it.concurrent("calls console.error", () => {
      const impulse = Impulse.of(2)
      renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(console$error).toHaveBeenLastCalledWith(message)
    })

    it.concurrent("returns the cloned impulse's value", () => {
      const impulse = Impulse.of(2)
      const { result } = renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(result.current).toBe(2)
    })
  })

  it("warns when called inside subscribe()", () => {
    const impulse = Impulse.of(1)

    subscribe(() => {
      impulse.clone()
    })

    expect(console$error).toHaveBeenLastCalledWith(
      WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING.subscribe,
    )
  })

  it.concurrent.each([
    ["useScopedEffect", useScopedEffect],
    ["useScopedLayoutEffect", useScopedLayoutEffect],
  ])("fine when called inside %s", (_, useScopedEffectHook) => {
    const initial = Impulse.of(1)
    const { result } = renderHook(
      (impulse) => {
        const [state, setState] = React.useState(impulse)

        useScopedEffectHook(() => {
          setState((x) => x.clone())
        }, [])

        return state
      },
      {
        initialProps: initial,
      },
    )

    expect(console$error).not.toHaveBeenCalled()
    expect(result.current).not.toBe(initial)
    expect(result.current.getValue()).toBe(1)
  })

  it("fine when called inside scoped()", () => {
    const Component = scoped<{
      impulse: Impulse<number>
    }>(({ impulse }) => {
      const [state] = React.useState(impulse.clone())

      return <div data-testid="count">{state.getValue()}</div>
    })

    render(<Component impulse={Impulse.of(20)} />)

    expect(console$error).not.toHaveBeenCalled()
    expect(screen.getByTestId("count")).toHaveTextContent("20")
  })
})

describe.skip("calling Impulse#setValue()", () => {
  describe.each([
    [
      "useScopedMemo",
      WARNING_MESSAGE_CALLING_SET_VALUE_WHEN_WATCHING.useScopedMemo,
      ({ impulse }: WithImpulse<number>) => {
        return useScopedMemo(() => {
          impulse.setValue(3)

          return impulse.getValue()
        }, [impulse])
      },
    ],
    [
      "inline useScoped",
      WARNING_MESSAGE_CALLING_SET_VALUE_WHEN_WATCHING.useScoped,
      ({ impulse }: WithImpulse<number>) => {
        return useScoped(() => {
          impulse.setValue(3)

          return impulse.getValue()
        })
      },
    ],
    [
      "memoized useScoped",
      WARNING_MESSAGE_CALLING_SET_VALUE_WHEN_WATCHING.useScoped,
      ({ impulse }: WithImpulse<number>) => {
        return useScoped(
          React.useCallback(() => {
            impulse.setValue(3)

            return impulse.getValue()
          }, [impulse]),
        )
      },
    ],
  ])("warns when calling inside %s", (_, message, useHook) => {
    it.concurrent("calls console.error", () => {
      const impulse = Impulse.of(4)
      renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(console$error).toHaveBeenLastCalledWith(message)
    })

    it.concurrent("does not change the impulse's value", () => {
      const impulse = Impulse.of(4)
      const { result } = renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(result.current).toBe(4)
    })
  })

  it.concurrent.each([
    ["useScopedEffect", useScopedEffect],
    ["useScopedLayoutEffect", useScopedLayoutEffect],
  ])("fine when called inside %s", (_, useScopedEffectHook) => {
    const { result } = renderHook(
      (impulse) => {
        useScopedEffectHook(() => {
          impulse.setValue((x) => x + 1)
        }, [impulse])

        return impulse
      },
      {
        initialProps: Impulse.of(1),
      },
    )

    expect(console$error).not.toHaveBeenCalled()
    expect(result.current.getValue()).toBe(2)
  })

  it("fine when called inside subscribe()", () => {
    const spy = vi.fn()
    const impulse = Impulse.of(1)

    subscribe(() => {
      impulse.setValue(2)
      spy()
    })

    expect(spy).toHaveBeenCalledOnce()
    expect(console$error).not.toHaveBeenCalled()
    expect(impulse.getValue()).toBe(2)
  })

  it("warns when called inside scoped()", () => {
    const Component = scoped<{
      impulse: Impulse<number>
    }>(({ impulse }) => {
      impulse.setValue(10)

      return <div data-testid="count">{impulse.getValue()}</div>
    })

    render(<Component impulse={Impulse.of(20)} />)

    expect(console$error).toHaveBeenCalledWith(
      WARNING_MESSAGE_CALLING_SET_VALUE_WHEN_WATCHING.scoped,
    )
    expect(screen.getByTestId("count")).toHaveTextContent("20")
  })
})

describe.skip("calling Impulse#subscribe()", () => {
  describe.each([
    [
      "useScopedMemo",
      WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING.useScopedMemo,
      ({
        impulse,
        listener = vi.fn(),
      }: WithImpulse<number> & Partial<WithListener>) => {
        return useScopedMemo(() => {
          impulse.subscribe(listener)

          return impulse.getValue()
        }, [listener, impulse])
      },
    ],
    [
      "inline useScoped",
      WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING.useScoped,
      ({
        impulse,
        listener = vi.fn(),
      }: WithImpulse<number> & Partial<WithListener>) => {
        return useScoped(() => {
          impulse.subscribe(listener)

          return impulse.getValue()
        })
      },
    ],
    [
      "memoized useScoped",
      WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING.useScoped,
      ({
        impulse,
        listener = vi.fn(),
      }: WithImpulse<number> & Partial<WithListener>) => {
        return useScoped(
          React.useCallback(() => {
            impulse.subscribe(listener)

            return impulse.getValue()
          }, [impulse, listener]),
        )
      },
    ],
  ])("warn when called inside %s", (_, message, useHook) => {
    it.concurrent("calls console.error", () => {
      const impulse = Impulse.of(4)

      renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(console$error).toHaveBeenLastCalledWith(message)
    })

    it.concurrent("returns the impulse's value", () => {
      const impulse = Impulse.of(4)
      const { result } = renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(result.current).toBe(4)
    })

    it.concurrent("returns noop function as unsubscribe", () => {
      const impulse = Impulse.of(4)
      const impulse$subscribe = vi.spyOn(impulse, "subscribe")

      renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(impulse$subscribe).toHaveReturnedWith(noop)
    })

    it.concurrent("does not call the listener on impulse's change", () => {
      const impulse = Impulse.of(4)
      const listener = vi.fn()
      const correctListener = vi.fn()

      renderHook(useHook, {
        initialProps: { impulse, listener },
      })

      impulse.subscribe(correctListener)

      expect(listener).not.toHaveBeenCalled()
      expect(correctListener).not.toHaveBeenCalled()

      impulse.setValue(1)
      expect(listener).not.toHaveBeenCalled()
      expect(correctListener).toHaveBeenCalledOnce()
    })
  })

  describe.each([
    ["useScopedEffect", useScopedEffect],
    ["useScopedLayoutEffect", useScopedLayoutEffect],
  ])("fine when called inside %s", (_, useScopedEffectHook) => {
    it.concurrent("calls subscribed listener", () => {
      const initial = Impulse.of(1)
      const listener = vi.fn()
      const { result } = renderHook(
        (impulse) => {
          useScopedEffectHook(() => {
            return impulse.subscribe(listener)
          }, [impulse])

          return impulse
        },
        {
          initialProps: initial,
        },
      )

      expect(console$error).not.toHaveBeenCalled()
      expect(result.current.getValue()).toBe(1)
      expect(listener).not.toHaveBeenCalled()

      act(() => {
        initial.setValue(2)
      })

      expect(result.current.getValue()).toBe(2)
      expect(listener).toHaveBeenCalledOnce()
    })

    it.concurrent("un-subscribers on cleanup", () => {
      const impulse_1 = Impulse.of(1)
      const impulse_2 = Impulse.of(10)
      const listener = vi.fn()
      const { result, rerender } = renderHook(
        (impulse) => {
          useScopedEffectHook(() => {
            return impulse.subscribe(listener)
          }, [impulse])

          return impulse
        },
        {
          initialProps: impulse_1,
        },
      )

      rerender(impulse_2)

      expect(console$error).not.toHaveBeenCalled()
      expect(result.current.getValue()).toBe(10)
      expect(listener).not.toHaveBeenCalled()

      act(() => {
        impulse_2.setValue(20)
      })

      expect(result.current.getValue()).toBe(20)
      expect(listener).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      act(() => {
        impulse_1.setValue(2)
      })

      expect(result.current.getValue()).toBe(20)
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe("warns when called inside scoped()", () => {
    const listener = vi.fn()
    const Component = scoped<{
      impulse: Impulse<number>
    }>(({ impulse }) => {
      impulse.subscribe(listener)

      return <div data-testid="count">{impulse.getValue()}</div>
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it("calls console.error", () => {
      render(<Component impulse={Impulse.of(20)} />)

      expect(console$error).toHaveBeenCalledWith(
        WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING.scoped,
      )
    })

    it("renders the impulse's value", () => {
      render(<Component impulse={Impulse.of(20)} />)

      expect(screen.getByTestId("count")).toHaveTextContent("20")
    })

    it("returns noop function as unsubscribe", () => {
      const impulse = Impulse.of(4)
      const impulse$subscribe = vi.spyOn(impulse, "subscribe")
      render(<Component impulse={impulse} />)

      expect(impulse$subscribe).toHaveReturnedWith(noop)
    })

    it("does not call the listener on impulse's change", () => {
      const impulse = Impulse.of(4)
      const correctListener = vi.fn()

      render(<Component impulse={impulse} />)

      impulse.subscribe(correctListener)

      expect(listener).not.toHaveBeenCalled()
      expect(correctListener).not.toHaveBeenCalled()

      impulse.setValue(1)
      expect(listener).not.toHaveBeenCalled()
      expect(correctListener).toHaveBeenCalledOnce()
    })
  })

  describe("warns when called inside subscribe()", () => {
    const listener = vi.fn()

    afterEach(() => {
      vi.clearAllMocks()
    })

    it("calls console.error", () => {
      const impulse = Impulse.of(4)

      subscribe(() => {
        impulse.subscribe(listener)
      })

      expect(console$error).toHaveBeenCalledWith(
        WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING.subscribe,
      )
    })

    it("returns noop function as unsubscribe", () => {
      const impulse = Impulse.of(4)
      const impulse$subscribe = vi.spyOn(impulse, "subscribe")

      subscribe(() => {
        impulse.subscribe(listener)
      })

      expect(impulse$subscribe).toHaveReturnedWith(noop)
    })

    it("does not call the listener on impulse's change", () => {
      const impulse = Impulse.of(4)
      const correctListener = vi.fn()

      subscribe(() => {
        impulse.subscribe(listener)
      })

      impulse.subscribe(correctListener)

      expect(listener).not.toHaveBeenCalled()
      expect(correctListener).not.toHaveBeenCalled()

      impulse.setValue(1)
      expect(listener).not.toHaveBeenCalled()
      expect(correctListener).toHaveBeenCalledOnce()
    })
  })
})
