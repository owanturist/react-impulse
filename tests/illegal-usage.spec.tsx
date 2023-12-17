import React from "react"
import { render, screen, renderHook } from "@testing-library/react"

import {
  Impulse,
  subscribe,
  useImpulseEffect,
  useScopedLayoutEffect,
  useScopedMemo,
  useWatchImpulse,
  watch,
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
        return useScopedMemo(() => Impulse.of(1).getValue(), [])
      },
    ],
    [
      "useWatchImpulse",
      "You should not call Impulse.of inside of the useWatchImpulse watcher. The useWatchImpulse hook is for read-only operations but Impulse.of creates a new Impulse.",
      () => {
        return useWatchImpulse(() => Impulse.of(1).getValue())
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

  it.each([
    ["useImpulseEffect", useImpulseEffect],
    ["useScopedLayoutEffect", useScopedLayoutEffect],
  ])("fine when called inside %s", (_, useImpulseEffectHook) => {
    const { result } = renderHook(() => {
      const [state, setState] = React.useState(Impulse.of(1))

      useImpulseEffectHook(() => {
        setState(Impulse.of(10))
      }, [])

      return state
    })

    expect(console$error).not.toHaveBeenCalled()
    expect(result.current.getValue()).toBe(10)
  })

  it("fine when called inside watch()", () => {
    const Component = watch(() => {
      const [state] = React.useState(() => Impulse.of(20))

      return <div data-testid="count">{state.getValue()}</div>
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
        return useScopedMemo(() => impulse.clone().getValue(), [impulse])
      },
    ],
    [
      "useWatchImpulse",
      "You should not call Impulse#clone inside of the useWatchImpulse watcher. The useWatchImpulse hook is for read-only operations but Impulse#clone clones an existing Impulse.",
      ({ impulse }: WithImpulse<number>) => {
        return useWatchImpulse(() => impulse.clone().getValue())
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
    ["useImpulseEffect", useImpulseEffect],
    ["useScopedLayoutEffect", useScopedLayoutEffect],
  ])("when called inside %s", (_, useImpulseEffectHook) => {
    it("works fine, does not print an error", () => {
      const initial = Impulse.of(1)
      const { result } = renderHook(
        (impulse) => {
          const [state, setState] = React.useState(impulse)

          useImpulseEffectHook(() => {
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
  })

  it("fine when called inside watch()", () => {
    const Component = watch<{
      impulse: Impulse<number>
    }>(({ impulse }) => {
      const [state] = React.useState(() => impulse.clone())

      return <div data-testid="count">{state.getValue()}</div>
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
        return useScopedMemo(() => {
          impulse.setValue(3)

          return impulse.getValue()
        }, [impulse])
      },
    ],
    [
      "useWatchImpulse",
      "You should not call Impulse#setValue inside of the useWatchImpulse watcher. The useWatchImpulse hook is for read-only operations but Impulse#setValue changes an existing Impulse.",
      ({ impulse }: WithImpulse<number>) => {
        return useWatchImpulse(() => {
          impulse.setValue(3)

          return impulse.getValue()
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
    ["useImpulseEffect", useImpulseEffect],
    ["useScopedLayoutEffect", useScopedLayoutEffect],
  ])("fine when called inside %s", (_, useImpulseEffectHook) => {
    it("works fine, does not print an error", () => {
      const { result } = renderHook(
        (impulse) => {
          useImpulseEffectHook(() => {
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

  it("warns when called inside watch()", () => {
    const Component = watch<{
      impulse: Impulse<number>
    }>(({ impulse }) => {
      impulse.setValue(10)

      return <div data-testid="count">{impulse.getValue()}</div>
    })

    render(<Component impulse={Impulse.of(20)} />)

    expect(console$error).toHaveBeenCalledWith(
      "You should not call Impulse#setValue during rendering of watch(Component).",
    )
    expect(screen.getByTestId("count")).toHaveTextContent("20")
  })
})
