import React from "react"
import { act, render, screen, renderHook } from "@testing-library/react"

import {
  Impulse,
  subscribe,
  useImpulseEffect,
  useImpulseLayoutEffect,
  useImpulseMemo,
  useWatchImpulse,
  watch,
} from "../src"
import { noop, usePermanent } from "../src/utils"
import {
  SUBSCRIBE_CALLING_IMPULSE_CLONE_MESSAGE,
  SUBSCRIBE_CALLING_IMPULSE_OF_MESSAGE,
  SUBSCRIBE_CALLING_IMPULSE_SUBSCRIBE_MESSAGE,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_CLONE_MESSAGE,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_OF_MESSAGE,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_SET_VALUE_MESSAGE,
  USE_IMPULSE_MEMO_CALLING_IMPULSE_SUBSCRIBE_MESSAGE,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_CLONE_MESSAGE,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_OF_MESSAGE,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_SET_VALUE_MESSAGE,
  USE_WATCH_IMPULSE_CALLING_IMPULSE_SUBSCRIBE_MESSAGE,
  WATCH_CALLING_IMPULSE_SET_VALUE_MESSAGE,
  WATCH_CALLING_IMPULSE_SUBSCRIBE_MESSAGE,
} from "../src/Impulse"

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
      "useImpulseMemo",
      USE_IMPULSE_MEMO_CALLING_IMPULSE_OF_MESSAGE,
      () => {
        return useImpulseMemo(() => Impulse.of(1).getValue(), [])
      },
    ],
    [
      "useWatchImpulse",
      USE_WATCH_IMPULSE_CALLING_IMPULSE_OF_MESSAGE,
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
      SUBSCRIBE_CALLING_IMPULSE_OF_MESSAGE,
    )
  })

  it.each([
    ["useImpulseEffect", useImpulseEffect],
    ["useImpulseLayoutEffect", useImpulseLayoutEffect],
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
      const state = usePermanent(() => Impulse.of(20))

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
      "useImpulseMemo",
      USE_IMPULSE_MEMO_CALLING_IMPULSE_CLONE_MESSAGE,
      ({ impulse }: WithImpulse<number>) => {
        return useImpulseMemo(() => impulse.clone().getValue(), [impulse])
      },
    ],
    [
      "useWatchImpulse",
      USE_WATCH_IMPULSE_CALLING_IMPULSE_CLONE_MESSAGE,
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
      SUBSCRIBE_CALLING_IMPULSE_CLONE_MESSAGE,
    )
  })

  describe.each([
    ["useImpulseEffect", useImpulseEffect],
    ["useImpulseLayoutEffect", useImpulseLayoutEffect],
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
      const state = usePermanent(() => impulse.clone())

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
      "useImpulseMemo",
      USE_IMPULSE_MEMO_CALLING_IMPULSE_SET_VALUE_MESSAGE,
      ({ impulse }: WithImpulse<number>) => {
        return useImpulseMemo(() => {
          impulse.setValue(3)

          return impulse.getValue()
        }, [impulse])
      },
    ],
    [
      "useWatchImpulse",
      USE_WATCH_IMPULSE_CALLING_IMPULSE_SET_VALUE_MESSAGE,
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
    ["useImpulseLayoutEffect", useImpulseLayoutEffect],
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
      WATCH_CALLING_IMPULSE_SET_VALUE_MESSAGE,
    )
    expect(screen.getByTestId("count")).toHaveTextContent("20")
  })
})

describe("calling Impulse#subscribe()", () => {
  describe.each([
    [
      "useImpulseMemo",
      USE_IMPULSE_MEMO_CALLING_IMPULSE_SUBSCRIBE_MESSAGE,
      ({
        impulse,
        listener = vi.fn(),
      }: WithImpulse<number> & Partial<WithListener>) => {
        return useImpulseMemo(() => {
          impulse.subscribe(listener)

          return impulse.getValue()
        }, [listener, impulse])
      },
    ],
    [
      "useWatchImpulse",
      USE_WATCH_IMPULSE_CALLING_IMPULSE_SUBSCRIBE_MESSAGE,
      ({
        impulse,
        listener = vi.fn(),
      }: WithImpulse<number> & Partial<WithListener>) => {
        return useWatchImpulse(() => {
          impulse.subscribe(listener)

          return impulse.getValue()
        })
      },
    ],
  ])("warn when called inside %s", (_, message, useHook) => {
    it("calls console.error", () => {
      const impulse = Impulse.of(4)

      renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(console$error).toHaveBeenLastCalledWith(message)
    })

    it("returns the Impulse's value", () => {
      const impulse = Impulse.of(4)
      const { result } = renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(result.current).toBe(4)
    })

    it("returns noop function as unsubscribe", () => {
      const impulse = Impulse.of(4)
      const impulse$subscribe = vi.spyOn(impulse, "subscribe")

      renderHook(useHook, {
        initialProps: { impulse },
      })

      expect(impulse$subscribe).toHaveReturnedWith(noop)
    })

    it("does not call the listener on Impulse's change", () => {
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
    ["useImpulseEffect", useImpulseEffect],
    ["useImpulseLayoutEffect", useImpulseLayoutEffect],
  ])("fine when called inside %s", (_, useImpulseEffectHook) => {
    it("calls subscribed listener", () => {
      const initial = Impulse.of(1)
      const listener = vi.fn()
      const { result } = renderHook(
        (impulse) => {
          useImpulseEffectHook(() => {
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

    it("un-subscribers on cleanup", () => {
      const impulse_1 = Impulse.of(1)
      const impulse_2 = Impulse.of(10)
      const listener = vi.fn()
      const { result, rerender } = renderHook(
        (impulse) => {
          useImpulseEffectHook(() => {
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

  describe("warns when called inside watch()", () => {
    const listener = vi.fn()
    const Component = watch<{
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
        WATCH_CALLING_IMPULSE_SUBSCRIBE_MESSAGE,
      )
    })

    it("renders the Impulse's value", () => {
      render(<Component impulse={Impulse.of(20)} />)

      expect(screen.getByTestId("count")).toHaveTextContent("20")
    })

    it("returns noop function as unsubscribe", () => {
      const impulse = Impulse.of(4)
      const impulse$subscribe = vi.spyOn(impulse, "subscribe")
      render(<Component impulse={impulse} />)

      expect(impulse$subscribe).toHaveReturnedWith(noop)
    })

    it("does not call the listener on Impulse's change", () => {
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
        SUBSCRIBE_CALLING_IMPULSE_SUBSCRIBE_MESSAGE,
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

    it("does not call the listener on Impulse's change", () => {
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
