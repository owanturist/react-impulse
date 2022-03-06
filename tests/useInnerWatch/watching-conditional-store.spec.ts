import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { Compare, InnerStore, useInnerWatch } from "../../src"
import { Counter, WithIsActive, WithStore } from "../helpers"

describe.each([
  [
    "inline watcher",
    (
      { store, isActive }: WithStore & WithIsActive,
      compare?: Compare<Counter>,
    ) => {
      return useInnerWatch(
        () => (isActive ? store.getState() : { count: -1 }),
        compare,
      )
    },
  ],
  [
    "memoized watcher",
    (
      { store, isActive }: WithStore & WithIsActive,
      compare?: Compare<Counter>,
    ) => {
      return useInnerWatch(
        useCallback(
          () => (isActive ? store.getState() : { count: -1 }),
          [store, isActive],
        ),
        compare,
      )
    },
  ],
])("direct %s", (_, usePrepareHook) => {
  describe.each([
    ["without comparator", usePrepareHook],
    [
      "with inline comparator",
      (props: WithStore & WithIsActive) => {
        return usePrepareHook(props, (prev, next) =>
          Counter.compare(prev, next),
        )
      },
    ],
    [
      "with memoized comparator",
      (props: WithStore & WithIsActive) => {
        return usePrepareHook(props, Counter.compare)
      },
    ],
  ])("%s", (__, useHook) => {
    describe("when active", () => {
      it.concurrent("should return store's value on init", () => {
        const store = InnerStore.of({ count: 1 })
        const { result } = renderHook(useHook, {
          initialProps: { store, isActive: true },
        })

        expect(result.current).toStrictEqual({ count: 1 })
      })

      it.concurrent("should return updated store's value", () => {
        const store = InnerStore.of({ count: 1 })

        const { result } = renderHook(useHook, {
          initialProps: { store, isActive: true },
        })

        act(() => {
          store.setState({ count: 2 })
        })
        expect(result.current).toStrictEqual({ count: 2 })
      })

      it.concurrent("should return replaced store's value", () => {
        const store_1 = InnerStore.of({ count: 1 })
        const store_2 = InnerStore.of({ count: 10 })

        const { result, rerender } = renderHook(useHook, {
          initialProps: { store: store_1, isActive: true },
        })

        act(() => {
          rerender({ store: store_2, isActive: true })
        })
        expect(result.current).toStrictEqual({ count: 10 })

        act(() => {
          store_2.setState({ count: 20 })
        })
        expect(result.current).toStrictEqual({ count: 20 })

        act(() => {
          store_1.setState({ count: 2 })
        })
        expect(result.current).toStrictEqual({ count: 20 })
      })

      it.concurrent("should return fallback value when turns inactive", () => {
        const store = InnerStore.of({ count: 1 })

        const { result, rerender } = renderHook(useHook, {
          initialProps: { store, isActive: true },
        })

        rerender({ store, isActive: false })
        expect(result.current).toStrictEqual({ count: -1 })
      })
    })

    describe("when inactive", () => {
      it.concurrent("should return fallback value when inactive", () => {
        const store = InnerStore.of({ count: 1 })
        const { result } = renderHook(useHook, {
          initialProps: { store, isActive: false },
        })

        expect(result.current).toStrictEqual({ count: -1 })
      })

      it.concurrent(
        "should return fallback value when inactive when store updates",
        () => {
          const store = InnerStore.of({ count: 1 })
          const { result } = renderHook(useHook, {
            initialProps: { store, isActive: false },
          })

          act(() => {
            store.setState({ count: 2 })
          })
          expect(result.current).toStrictEqual({ count: -1 })
        },
      )

      it.concurrent("should return fallback value when turns active", () => {
        const store = InnerStore.of({ count: 1 })
        const { result, rerender } = renderHook(useHook, {
          initialProps: { store, isActive: false },
        })

        rerender({ store, isActive: true })
        expect(result.current).toStrictEqual({ count: 1 })

        act(() => {
          store.setState({ count: 2 })
        })
        expect(result.current).toStrictEqual({ count: 2 })
      })
    })
  })
})
