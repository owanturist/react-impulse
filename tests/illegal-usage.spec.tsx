import React from "react"
import { renderHook } from "@testing-library/react-hooks"
import { render, screen } from "@testing-library/react"

import {
  Impulse,
  subscribe,
  useScopedEffect,
  useScopedLayoutEffect,
  useScopedMemo,
  useScoped,
  scoped,
} from "../src"
import { getMessageFor } from "../src/validation"

import type { WithImpulse } from "./common"

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
      getMessageFor("of", "useScopedMemo"),
      () => {
        return useScopedMemo((scope) => Impulse.of(1).getValue(scope), [])
      },
    ],
    [
      "inline useScoped",
      getMessageFor("of", "useScoped"),
      () => {
        return useScoped((scope) => Impulse.of(1).getValue(scope))
      },
    ],
    [
      "memoized useScoped",
      getMessageFor("of", "useScoped"),
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
      getMessageFor("of", "subscribe"),
    )
  })

  describe.each([
    ["useScopedEffect", useScopedEffect],
    ["useScopedLayoutEffect", useScopedLayoutEffect],
  ])("fine when called inside %s", (_, useScopedEffectHook) => {
    it.concurrent("works fine, does not print an error", ({ scope }) => {
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

describe("calling Impulse#clone()", () => {
  describe.each([
    [
      "useScopedMemo",
      getMessageFor("clone", "useScopedMemo"),
      ({ impulse }: WithImpulse<number>) => {
        return useScopedMemo(
          (scope) => impulse.clone().getValue(scope),
          [impulse],
        )
      },
    ],
    [
      "inline useScoped",
      getMessageFor("clone", "useScoped"),
      ({ impulse }: WithImpulse<number>) => {
        return useScoped((scope) => impulse.clone().getValue(scope))
      },
    ],
    [
      "memoized useScoped",
      getMessageFor("clone", "useScoped"),
      ({ impulse }: WithImpulse<number>) => {
        return useScoped((scope) => impulse.clone().getValue(scope), [impulse])
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

  it.concurrent("warns when called inside subscribe()", () => {
    const impulse = Impulse.of(1)

    subscribe(() => {
      impulse.clone()
    })

    expect(console$error).toHaveBeenLastCalledWith(
      getMessageFor("clone", "subscribe"),
    )
  })

  describe.each([
    ["useScopedEffect", useScopedEffect],
    ["useScopedLayoutEffect", useScopedLayoutEffect],
  ])("when called inside %s", (_, useScopedEffectHook) => {
    it.concurrent("works fine, does not print an error", ({ scope }) => {
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
      expect(result.current.getValue(scope)).toBe(1)
    })
  })

  it("fine when called inside scoped()", () => {
    const Component = scoped<{
      impulse: Impulse<number>
    }>(({ scope, impulse }) => {
      const [state] = React.useState(impulse.clone())

      return <div data-testid="count">{state.getValue(scope)}</div>
    })

    render(<Component impulse={Impulse.of(20)} />)

    expect(console$error).not.toHaveBeenCalled()
    expect(screen.getByTestId("count")).toHaveTextContent("20")
  })
})

describe("calling Impulse#setValue()", () => {
  describe.each([
    [
      "useScopedMemo",
      getMessageFor("setValue", "useScopedMemo"),
      ({ impulse }: WithImpulse<number>) => {
        return useScopedMemo(
          (scope) => {
            impulse.setValue(3)

            return impulse.getValue(scope)
          },
          [impulse],
        )
      },
    ],
    [
      "inline useScoped",
      getMessageFor("setValue", "useScoped"),
      ({ impulse }: WithImpulse<number>) => {
        return useScoped((scope) => {
          impulse.setValue(3)

          return impulse.getValue(scope)
        })
      },
    ],
    [
      "memoized useScoped",
      getMessageFor("setValue", "useScoped"),
      ({ impulse }: WithImpulse<number>) => {
        return useScoped(
          (scope) => {
            impulse.setValue(3)

            return impulse.getValue(scope)
          },
          [impulse],
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

  describe.each([
    ["useScopedEffect", useScopedEffect],
    ["useScopedLayoutEffect", useScopedLayoutEffect],
  ])("fine when called inside %s", (_, useScopedEffectHook) => {
    it.concurrent("works fine, does not print an error", ({ scope }) => {
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
      expect(result.current.getValue(scope)).toBe(2)
    })
  })

  it.concurrent("fine when called inside subscribe()", ({ scope }) => {
    const spy = vi.fn()
    const impulse = Impulse.of(1)

    subscribe(() => {
      impulse.setValue(2)
      spy()
    })

    expect(spy).toHaveBeenCalledOnce()
    expect(console$error).not.toHaveBeenCalled()
    expect(impulse.getValue(scope)).toBe(2)
  })

  it("warns when called inside scoped()", () => {
    const Component = scoped<{
      impulse: Impulse<number>
    }>(({ scope, impulse }) => {
      impulse.setValue(10)

      return <div data-testid="count">{impulse.getValue(scope)}</div>
    })

    render(<Component impulse={Impulse.of(20)} />)

    expect(console$error).toHaveBeenCalledWith(
      getMessageFor("setValue", "scoped"),
    )
    expect(screen.getByTestId("count")).toHaveTextContent("20")
  })
})
