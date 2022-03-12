import { useCallback } from "react"
import { renderHook } from "@testing-library/react-hooks"

import { InnerStore, useInnerWatch } from "../../src"
import {
  WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING,
  WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING,
} from "../../src/InnerStore"
import { noop } from "../../src/utils"
import { WithStore, WithListener } from "../common"

describe("illegal usage of useInnerWatch", () => {
  const console$error = jest
    .spyOn(console, "error")
    .mockImplementation(jest.fn())

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe.each([
    [
      "inline",
      () => {
        return useInnerWatch(() => InnerStore.of(1).getState())
      },
    ],
    [
      "memoized",
      () => {
        return useInnerWatch(useCallback(() => InnerStore.of(1).getState(), []))
      },
    ],
  ])("when calling InnerStore.of() inside of the %s watcher", (_, useHook) => {
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
        return useInnerWatch(() => store.clone().getState())
      },
    ],
    [
      "memoized",
      ({ store }: WithStore<number>) => {
        return useInnerWatch(
          useCallback(() => store.clone().getState(), [store]),
        )
      },
    ],
  ])(
    "warn on calling InnerStore#clone() inside of the %s watcher",
    (_, useHook) => {
      it.concurrent("calls console.error", () => {
        const store = InnerStore.of(2)
        renderHook(useHook, {
          initialProps: { store },
        })

        expect(console$error).toHaveBeenLastCalledWith(
          WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING,
        )
      })

      it.concurrent("returns the cloned store's value", () => {
        const store = InnerStore.of(2)
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
        return useInnerWatch(() => {
          store.setState(3)

          return store.getState()
        })
      },
    ],
    [
      "memoized",
      ({ store }: WithStore<number>) => {
        return useInnerWatch(
          useCallback(() => {
            store.setState(3)

            return store.getState()
          }, [store]),
        )
      },
    ],
  ])(
    "warn on calling InnerStore#setState() inside of the %s watcher",
    (_, useHook) => {
      it.concurrent("calls console.error", () => {
        const store = InnerStore.of(4)
        renderHook(useHook, {
          initialProps: { store },
        })

        expect(console$error).toHaveBeenLastCalledWith(
          WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING,
        )
      })

      it.concurrent("does not change the store's value", () => {
        const store = InnerStore.of(4)
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
        listener = jest.fn(),
      }: WithStore<number> & Partial<WithListener>) => {
        return useInnerWatch(() => {
          store.subscribe(listener)

          return store.getState()
        })
      },
    ],
    [
      "memoized",
      ({
        store,
        listener = jest.fn(),
      }: WithStore<number> & Partial<WithListener>) => {
        return useInnerWatch(
          useCallback(() => {
            store.subscribe(listener)

            return store.getState()
          }, [store, listener]),
        )
      },
    ],
  ])(
    "warn on calling InnerStore#subscribe() inside of the %s watcher",
    (_, useHook) => {
      it.concurrent("calls console.error", () => {
        const store = InnerStore.of(4)

        renderHook(useHook, {
          initialProps: { store },
        })

        expect(console$error).toHaveBeenLastCalledWith(
          WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING,
        )
      })

      it.concurrent("returns the store's value", () => {
        const store = InnerStore.of(4)
        const { result } = renderHook(useHook, {
          initialProps: { store },
        })

        expect(result.current).toBe(4)
      })

      it.concurrent("returns noop function as unsubscribe", () => {
        const store = InnerStore.of(4)
        const store$subscribe = jest.spyOn(store, "subscribe")

        renderHook(useHook, {
          initialProps: { store },
        })

        expect(store$subscribe).toHaveReturnedWith(noop)
      })

      it.concurrent("does not call the listener on store's change", () => {
        const store = InnerStore.of(4)
        const listener = jest.fn()
        const correctListener = jest.fn()

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
