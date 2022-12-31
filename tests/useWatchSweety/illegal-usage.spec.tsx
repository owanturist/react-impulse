import React from "react"
import { renderHook } from "@testing-library/react-hooks"
import { act, render, screen } from "@testing-library/react"

import {
  Sweety,
  useSweetyEffect,
  useSweetyLayoutEffect,
  useSweetyMemo,
  useWatchSweety,
  watch,
} from "../../src"
import {
  WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING,
} from "../../src/validation"
import { noop } from "../../src/utils"
import { WithStore, WithListener } from "../common"

const console$error = vi
  .spyOn(console, "error")
  .mockImplementation(vi.fn() as VoidFunction)

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  console$error.mockRestore()
})

describe("calling Sweety.of()", () => {
  describe.each([
    [
      "useSweetyMemo",
      WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING.useSweetyMemo,
      () => {
        return useSweetyMemo(() => Sweety.of(1).getState(), [])
      },
    ],
    [
      "inline useWatchSweety",
      WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING.useWatchSweety,
      () => {
        return useWatchSweety(() => Sweety.of(1).getState())
      },
    ],
    [
      "memoized useWatchSweety",
      WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING.useWatchSweety,
      () => {
        return useWatchSweety(
          React.useCallback(() => Sweety.of(1).getState(), []),
        )
      },
    ],
  ])("warns when called inside %s", (_, message, useHook) => {
    it.concurrent("calls console.error", () => {
      renderHook(useHook)

      expect(console$error).toHaveBeenLastCalledWith(message)
    })

    it.concurrent("returns the new store's value", () => {
      const { result } = renderHook(useHook)

      expect(result.current).toBe(1)
    })
  })

  it.concurrent.each([
    ["useSweetyEffect", useSweetyEffect],
    ["useSweetyLayoutEffect", useSweetyLayoutEffect],
  ])("fine when called inside %s", (_, useSweetyEffectHook) => {
    const { result } = renderHook(() => {
      const [state, setState] = React.useState(Sweety.of(1))

      useSweetyEffectHook(() => {
        setState(Sweety.of(10))
      }, [])

      return state
    })

    expect(console$error).not.toHaveBeenCalled()
    expect(result.current.getState()).toBe(10)
  })

  it("fine when called inside watch()", () => {
    const Component = watch(() => {
      const [state] = React.useState(Sweety.of(20))

      return <div data-testid="count">{state.getState()}</div>
    })

    render(<Component />)

    expect(console$error).not.toHaveBeenCalled()
    expect(screen.getByTestId("count")).toHaveTextContent("20")
  })
})

describe("calling Sweety#clone()", () => {
  describe.each([
    [
      "useSweetyMemo",
      WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING.useSweetyMemo,
      ({ store }: WithStore<number>) => {
        return useSweetyMemo(() => store.clone().getState(), [store])
      },
    ],
    [
      "inline useWatchSweety",
      WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING.useWatchSweety,
      ({ store }: WithStore<number>) => {
        return useWatchSweety(() => store.clone().getState())
      },
    ],
    [
      "memoized useWatchSweety",
      WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING.useWatchSweety,
      ({ store }: WithStore<number>) => {
        return useWatchSweety(
          React.useCallback(() => store.clone().getState(), [store]),
        )
      },
    ],
  ])("warn when called inside %s", (_, message, useHook) => {
    it.concurrent("calls console.error", () => {
      const store = Sweety.of(2)
      renderHook(useHook, {
        initialProps: { store },
      })

      expect(console$error).toHaveBeenLastCalledWith(message)
    })

    it.concurrent("returns the cloned store's value", () => {
      const store = Sweety.of(2)
      const { result } = renderHook(useHook, {
        initialProps: { store },
      })

      expect(result.current).toBe(2)
    })
  })

  it.concurrent.each([
    ["useSweetyEffect", useSweetyEffect],
    ["useSweetyLayoutEffect", useSweetyLayoutEffect],
  ])("fine when called inside %s", (_, useSweetyEffectHook) => {
    const initial = Sweety.of(1)
    const { result } = renderHook(
      (store) => {
        const [state, setState] = React.useState(store)

        useSweetyEffectHook(() => {
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
    expect(result.current.getState()).toBe(1)
  })

  it("fine when called inside watch()", () => {
    const Component = watch<{
      store: Sweety<number>
    }>(({ store }) => {
      const [state] = React.useState(store.clone())

      return <div data-testid="count">{state.getState()}</div>
    })

    render(<Component store={Sweety.of(20)} />)

    expect(console$error).not.toHaveBeenCalled()
    expect(screen.getByTestId("count")).toHaveTextContent("20")
  })
})

describe("calling Sweety#setState()", () => {
  describe.each([
    [
      "useSweetyMemo",
      WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING.useSweetyMemo,
      ({ store }: WithStore<number>) => {
        return useSweetyMemo(() => {
          store.setState(3)

          return store.getState()
        }, [store])
      },
    ],
    [
      "inline useWatchSweety",
      WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING.useWatchSweety,
      ({ store }: WithStore<number>) => {
        return useWatchSweety(() => {
          store.setState(3)

          return store.getState()
        })
      },
    ],
    [
      "memoized useWatchSweety",
      WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING.useWatchSweety,
      ({ store }: WithStore<number>) => {
        return useWatchSweety(
          React.useCallback(() => {
            store.setState(3)

            return store.getState()
          }, [store]),
        )
      },
    ],
  ])("warns when calling inside %s", (_, message, useHook) => {
    it.concurrent("calls console.error", () => {
      const store = Sweety.of(4)
      renderHook(useHook, {
        initialProps: { store },
      })

      expect(console$error).toHaveBeenLastCalledWith(message)
    })

    it.concurrent("does not change the store's value", () => {
      const store = Sweety.of(4)
      const { result } = renderHook(useHook, {
        initialProps: { store },
      })

      expect(result.current).toBe(4)
    })
  })

  it.concurrent.each([
    ["useSweetyEffect", useSweetyEffect],
    ["useSweetyLayoutEffect", useSweetyLayoutEffect],
  ])("fine when called inside %s", (_, useSweetyEffectHook) => {
    const { result } = renderHook(
      (store) => {
        useSweetyEffectHook(() => {
          store.setState((x) => x + 1)
        }, [store])

        return store
      },
      {
        initialProps: Sweety.of(1),
      },
    )

    expect(console$error).not.toHaveBeenCalled()
    expect(result.current.getState()).toBe(2)
  })

  it("warns when called inside watch()", () => {
    const Component = watch<{
      store: Sweety<number>
    }>(({ store }) => {
      store.setState(10)

      return <div data-testid="count">{store.getState()}</div>
    })

    render(<Component store={Sweety.of(20)} />)

    expect(console$error).toHaveBeenCalledWith(
      WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING.watch,
    )
    expect(screen.getByTestId("count")).toHaveTextContent("20")
  })
})

describe("calling Sweety#subscribe()", () => {
  describe.each([
    [
      "useSweetyMemo",
      WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING.useSweetyMemo,
      ({
        store,
        listener = vi.fn(),
      }: WithStore<number> & Partial<WithListener>) => {
        return useSweetyMemo(() => {
          store.subscribe(listener)

          return store.getState()
        }, [listener, store])
      },
    ],
    [
      "inline useWatchSweety",
      WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING.useWatchSweety,
      ({
        store,
        listener = vi.fn(),
      }: WithStore<number> & Partial<WithListener>) => {
        return useWatchSweety(() => {
          store.subscribe(listener)

          return store.getState()
        })
      },
    ],
    [
      "memoized useWatchSweety",
      WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING.useWatchSweety,
      ({
        store,
        listener = vi.fn(),
      }: WithStore<number> & Partial<WithListener>) => {
        return useWatchSweety(
          React.useCallback(() => {
            store.subscribe(listener)

            return store.getState()
          }, [store, listener]),
        )
      },
    ],
  ])("warn when called inside %s", (_, message, useHook) => {
    it.concurrent("calls console.error", () => {
      const store = Sweety.of(4)

      renderHook(useHook, {
        initialProps: { store },
      })

      expect(console$error).toHaveBeenLastCalledWith(message)
    })

    it.concurrent("returns the store's value", () => {
      const store = Sweety.of(4)
      const { result } = renderHook(useHook, {
        initialProps: { store },
      })

      expect(result.current).toBe(4)
    })

    it.concurrent("returns noop function as unsubscribe", () => {
      const store = Sweety.of(4)
      const store$subscribe = vi.spyOn(store, "subscribe")

      renderHook(useHook, {
        initialProps: { store },
      })

      expect(store$subscribe).toHaveReturnedWith(noop)
    })

    it.concurrent("does not call the listener on store's change", () => {
      const store = Sweety.of(4)
      const listener = vi.fn()
      const correctListener = vi.fn()

      renderHook(useHook, {
        initialProps: { store, listener },
      })

      const unsubscribe = store.subscribe(correctListener)

      expect(listener).not.toHaveBeenCalled()
      expect(correctListener).not.toHaveBeenCalled()

      store.setState(1)
      expect(listener).not.toHaveBeenCalled()
      expect(correctListener).toHaveBeenCalledTimes(1)

      unsubscribe()
    })
  })

  describe.each([
    ["useSweetyEffect", useSweetyEffect],
    ["useSweetyLayoutEffect", useSweetyLayoutEffect],
  ])("fine when called inside %s", (_, useSweetyEffectHook) => {
    it.concurrent("calls subscribed listener", () => {
      const initial = Sweety.of(1)
      const listener = vi.fn()
      const { result } = renderHook(
        (store) => {
          useSweetyEffectHook(() => {
            return store.subscribe(listener)
          }, [store])

          return store
        },
        {
          initialProps: initial,
        },
      )

      expect(console$error).not.toHaveBeenCalled()
      expect(result.current.getState()).toBe(1)
      expect(listener).not.toHaveBeenCalled()

      act(() => {
        initial.setState(2)
      })

      expect(result.current.getState()).toBe(2)
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it.concurrent("un-subscribers on cleanup", () => {
      const store_1 = Sweety.of(1)
      const store_2 = Sweety.of(10)
      const listener = vi.fn()
      const { result, rerender } = renderHook(
        (store) => {
          useSweetyEffectHook(() => {
            return store.subscribe(listener)
          }, [store])

          return store
        },
        {
          initialProps: store_1,
        },
      )

      rerender(store_2)

      expect(console$error).not.toHaveBeenCalled()
      expect(result.current.getState()).toBe(10)
      expect(listener).not.toHaveBeenCalled()

      act(() => {
        store_2.setState(20)
      })

      expect(result.current.getState()).toBe(20)
      expect(listener).toHaveBeenCalledTimes(1)
      vi.clearAllMocks()

      act(() => {
        store_1.setState(2)
      })

      expect(result.current.getState()).toBe(20)
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe("warns when called inside watch()", () => {
    const listener = vi.fn()
    const Component = watch<{
      store: Sweety<number>
    }>(({ store }) => {
      store.subscribe(listener)

      return <div data-testid="count">{store.getState()}</div>
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it("calls console.error", () => {
      render(<Component store={Sweety.of(20)} />)

      expect(console$error).toHaveBeenCalledWith(
        WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING.watch,
      )
    })

    it("renders the store's value", () => {
      render(<Component store={Sweety.of(20)} />)

      expect(screen.getByTestId("count")).toHaveTextContent("20")
    })

    it("returns noop function as unsubscribe", () => {
      const store = Sweety.of(4)
      const store$subscribe = vi.spyOn(store, "subscribe")
      render(<Component store={store} />)

      expect(store$subscribe).toHaveReturnedWith(noop)
    })

    it("does not call the listener on store's change", () => {
      const store = Sweety.of(4)
      const correctListener = vi.fn()

      render(<Component store={store} />)

      const unsubscribe = store.subscribe(correctListener)

      expect(listener).not.toHaveBeenCalled()
      expect(correctListener).not.toHaveBeenCalled()

      store.setState(1)
      expect(listener).not.toHaveBeenCalled()
      expect(correctListener).toHaveBeenCalledTimes(1)
      unsubscribe()
    })
  })
})
