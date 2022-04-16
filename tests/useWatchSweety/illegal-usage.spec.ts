import { useCallback } from "react"
import { renderHook } from "@testing-library/react"

import { Sweety, useWatchSweety } from "../../src"
import {
  WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING,
} from "../../src/Sweety"
import { noop } from "../../src/utils"
import { WithStore, WithListener } from "../common"

describe("illegal usage of useWatchSweety", () => {
  const console$error = vi
    .spyOn(console, "error")
    .mockImplementation(vi.fn() as VoidFunction)

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe.each([
    [
      "inline",
      () => {
        return useWatchSweety(() => Sweety.of(1).getState())
      },
    ],
    [
      "memoized",
      () => {
        return useWatchSweety(useCallback(() => Sweety.of(1).getState(), []))
      },
    ],
  ])("when calling Sweety.of() inside of the %s watcher", (_, useHook) => {
    it.concurrent("calls console.error", () => {
      renderHook(useHook)

      expect(console$error).toHaveBeenLastCalledWith(
        WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING,
      )
    })

    it.concurrent("returns the new store's value", () => {
      const { result } = renderHook(useHook)

      expect(result.current).toBe(1)
    })
  })

  describe.each([
    [
      "inline",
      ({ store }: WithStore<number>) => {
        return useWatchSweety(() => store.clone().getState())
      },
    ],
    [
      "memoized",
      ({ store }: WithStore<number>) => {
        return useWatchSweety(
          useCallback(() => store.clone().getState(), [store]),
        )
      },
    ],
  ])(
    "warn on calling Sweety#clone() inside of the %s watcher",
    (_, useHook) => {
      it.concurrent("calls console.error", () => {
        const store = Sweety.of(2)
        renderHook(useHook, {
          initialProps: { store },
        })

        expect(console$error).toHaveBeenLastCalledWith(
          WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING,
        )
      })

      it.concurrent("returns the cloned store's value", () => {
        const store = Sweety.of(2)
        const { result } = renderHook(useHook, {
          initialProps: { store },
        })

        expect(result.current).toBe(2)
      })
    },
  )

  describe.each([
    [
      "inline",
      ({ store }: WithStore<number>) => {
        return useWatchSweety(() => {
          store.setState(3)

          return store.getState()
        })
      },
    ],
    [
      "memoized",
      ({ store }: WithStore<number>) => {
        return useWatchSweety(
          useCallback(() => {
            store.setState(3)

            return store.getState()
          }, [store]),
        )
      },
    ],
  ])(
    "warn on calling Sweety#setState() inside of the %s watcher",
    (_, useHook) => {
      it.concurrent("calls console.error", () => {
        const store = Sweety.of(4)
        renderHook(useHook, {
          initialProps: { store },
        })

        expect(console$error).toHaveBeenLastCalledWith(
          WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING,
        )
      })

      it.concurrent("does not change the store's value", () => {
        const store = Sweety.of(4)
        const { result } = renderHook(useHook, {
          initialProps: { store },
        })

        expect(result.current).toBe(4)
      })
    },
  )

  describe.each([
    [
      "inline",
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
      "memoized",
      ({
        store,
        listener = vi.fn(),
      }: WithStore<number> & Partial<WithListener>) => {
        return useWatchSweety(
          useCallback(() => {
            store.subscribe(listener)

            return store.getState()
          }, [store, listener]),
        )
      },
    ],
  ])(
    "warn on calling Sweety#subscribe() inside of the %s watcher",
    (_, useHook) => {
      it.concurrent("calls console.error", () => {
        const store = Sweety.of(4)

        renderHook(useHook, {
          initialProps: { store },
        })

        expect(console$error).toHaveBeenLastCalledWith(
          WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING,
        )
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

        store.subscribe(correctListener)

        expect(listener).not.toHaveBeenCalled()
        expect(correctListener).not.toHaveBeenCalled()

        store.setState(1)
        expect(listener).not.toHaveBeenCalled()
        expect(correctListener).toHaveBeenCalledTimes(1)
      })
    },
  )
})
