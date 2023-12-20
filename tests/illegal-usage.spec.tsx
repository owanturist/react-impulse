import React from "react"
import { render, screen, renderHook } from "@testing-library/react"

import {
  Impulse,
  subscribe,
  useScopedEffect,
  useScopedLayoutEffect,
  useScopedMemo,
  useScoped,
  scoped,
} from "../src"

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
      "You should not call Impulse.of inside of the useScopedMemo factory. The useScopedMemo hook is for read-only operations but Impulse.of creates a new Impulse.",
      () => {
        return useScopedMemo((scope) => Impulse.of(1).getValue(scope), [])
      },
    ],
    [
      "useScoped",
      "You should not call Impulse.of inside of the useScoped factory. The useScoped hook is for read-only operations but Impulse.of creates a new Impulse.",
      () => {
        return useScoped((scope) => Impulse.of(1).getValue(scope))
      },
    ],
  ])("warns when called inside %s", (_, message, useHook) => {
    it("calls console.error", () => {
      renderHook(useHook)

      expect(console$error).toHaveBeenLastCalledWith(message)
    })

    it("returns the new Impulse's value", () => {
      const { result } = renderHook(useHook)

      expect(result.current).toBe(1)
    })
  })

  it("warns when called inside subscribe()", () => {
    subscribe(() => {
      Impulse.of(1)
    })

    expect(console$error).toHaveBeenLastCalledWith(
      "You should not call Impulse.of inside of the subscribe listener. The listener is for read-only operations but Impulse.of creates a new Impulse.",
    )
  })

  describe.each([
    ["useScopedEffect", useScopedEffect],
    ["useScopedLayoutEffect", useScopedLayoutEffect],
  ])("when called inside %s", (_, useScopedEffectHook) => {
    it("works fine, does not print an error", ({ scope }) => {
      const { result } = renderHook(() => {
        const [state, setState] = React.useState(Impulse.of(1))

        // eslint-disable-next-line no-restricted-syntax
        useScopedEffectHook(() => {
          setState(Impulse.of(10))
        }, [])

        return state
      })

      expect(console$error).not.toHaveBeenCalled()
      expect(result.current.getValue(scope)).toBe(10)
    })
  })

  it("fine when called inside scoped()", () => {
    const Component = scoped(({ scope }) => {
      const [state] = React.useState(() => Impulse.of(20))

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
      "You should not call Impulse#clone inside of the useScopedMemo factory. The useScopedMemo hook is for read-only operations but Impulse#clone clones an existing Impulse.",
      ({ impulse }: WithImpulse<number>) => {
        return useScopedMemo(
          (scope) => impulse.clone().getValue(scope),
          [impulse],
        )
      },
    ],
    [
      "useScoped",
      "You should not call Impulse#clone inside of the useScoped factory. The useScoped hook is for read-only operations but Impulse#clone clones an existing Impulse.",
      ({ impulse }: WithImpulse<number>) => {
        return useScoped((scope) => impulse.clone().getValue(scope))
      },
    ],
  ])("warn when called inside %s", (_, message, useHook) => {
    it("calls console.error", () => {
      const impulse = Impulse.of(2)
      renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(console$error).toHaveBeenLastCalledWith(message)
    })

    it("returns the cloned Impulse's value", () => {
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
      "You should not call Impulse#clone inside of the subscribe listener. The listener is for read-only operations but Impulse#clone clones an existing Impulse.",
    )
  })

  describe.each([
    ["useScopedEffect", useScopedEffect],
    ["useScopedLayoutEffect", useScopedLayoutEffect],
  ])("when called inside %s", (_, useScopedEffectHook) => {
    it("works fine, does not print an error", ({ scope }) => {
      const initial = Impulse.of(1)
      const { result } = renderHook(
        (impulse) => {
          const [state, setState] = React.useState(impulse)

          // eslint-disable-next-line no-restricted-syntax
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
      const [state] = React.useState(() => impulse.clone())

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
      "You should not call Impulse#setValue inside of the useScopedMemo factory. The useScopedMemo hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
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
      "useScoped",
      "You should not call Impulse#setValue inside of the useScoped factory. The useScoped hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
      ({ impulse }: WithImpulse<number>) => {
        return useScoped((scope) => {
          impulse.setValue(3)

          return impulse.getValue(scope)
        })
      },
    ],
  ])("warns when calling inside %s", (_, message, useHook) => {
    it("calls console.error", () => {
      const impulse = Impulse.of(4)
      renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(console$error).toHaveBeenLastCalledWith(message)
    })

    it("does not change the Impulse's value", () => {
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
    it("works fine, does not print an error", ({ scope }) => {
      const { result } = renderHook(
        (impulse) => {
          // eslint-disable-next-line no-restricted-syntax
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

  it("fine when called inside subscribe()", ({ scope }) => {
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
      "You should not call Impulse#setValue during rendering of scoped(Component).",
    )
    expect(screen.getByTestId("count")).toHaveTextContent("20")
  })
})
