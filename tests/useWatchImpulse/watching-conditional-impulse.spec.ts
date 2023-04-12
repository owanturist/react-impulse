import { act, renderHook } from "@testing-library/react-hooks"

import { Compare, Impulse, useWatchImpulse } from "../../src"
import { Counter, WithIsActive, WithImpulse, WithSpy } from "../common"

describe.each([
  [
    "inline watcher",
    ({
      impulse: impulse,
      isActive,
      spy,
    }: WithImpulse & WithIsActive & Partial<WithSpy>) => {
      return useWatchImpulse((scope) => {
        spy?.()

        return isActive ? impulse.getValue(scope) : { count: -1 }
      })
    },
  ],
  [
    "memoized watcher",
    (
      {
        impulse: impulse,
        isActive,
        spy,
      }: WithImpulse & WithIsActive & Partial<WithSpy>,
      compare?: Compare<Counter>,
    ) => {
      return useWatchImpulse(
        (scope) => {
          spy?.()

          return isActive ? impulse.getValue(scope) : { count: -1 }
        },
        [impulse, isActive, spy],
        compare,
      )
    },
  ],
])("direct %s", (_, useHookWithoutCompare) => {
  describe.each([
    ["without comparator", useHookWithoutCompare],
    [
      "with inline comparator",
      (props: WithImpulse & WithIsActive & Partial<WithSpy>) => {
        return useHookWithoutCompare(props, (prev, next) =>
          Counter.compare(prev, next),
        )
      },
    ],
    [
      "with memoized comparator",
      (props: WithImpulse & WithIsActive & Partial<WithSpy>) => {
        return useHookWithoutCompare(props, Counter.compare)
      },
    ],
  ])("%s", (__, useHook) => {
    describe("when active", () => {
      it.concurrent("should return impulse's value on init", () => {
        const impulse = Impulse.of({ count: 1 })
        const { result } = renderHook(useHook, {
          initialProps: { impulse: impulse, isActive: true },
        })

        expect(result.current).toStrictEqual({ count: 1 })
        expect(impulse).toHaveProperty("scopes.size", 1)
      })

      it.concurrent("should return updated impulse's value", () => {
        const impulse = Impulse.of({ count: 1 })

        const { result } = renderHook(useHook, {
          initialProps: { impulse: impulse, isActive: true },
        })

        act(() => {
          impulse.setValue({ count: 2 })
        })
        expect(result.current).toStrictEqual({ count: 2 })
        expect(impulse).toHaveProperty("scopes.size", 1)
      })

      it.concurrent("should return replaced impulse's value", () => {
        const impulse_1 = Impulse.of({ count: 1 })
        const impulse_2 = Impulse.of({ count: 10 })

        const { result, rerender } = renderHook(useHook, {
          initialProps: { impulse: impulse_1, isActive: true },
        })
        expect(impulse_1).toHaveProperty("scopes.size", 1)
        expect(impulse_2).toHaveProperty("scopes.size", 0)

        act(() => {
          rerender({ impulse: impulse_2, isActive: true })
        })
        expect(result.current).toStrictEqual({ count: 10 })
        expect(impulse_1).toHaveProperty("scopes.size", 0)
        expect(impulse_2).toHaveProperty("scopes.size", 1)

        act(() => {
          impulse_2.setValue({ count: 20 })
        })
        expect(result.current).toStrictEqual({ count: 20 })

        act(() => {
          impulse_1.setValue({ count: 2 })
        })
        expect(result.current).toStrictEqual({ count: 20 })
        expect(impulse_1).toHaveProperty("scopes.size", 0)
        expect(impulse_2).toHaveProperty("scopes.size", 1)
      })

      it.concurrent("should return fallback value when turns inactive", () => {
        const impulse = Impulse.of({ count: 1 })
        const { result, rerender } = renderHook(useHook, {
          initialProps: { impulse: impulse, isActive: true },
        })

        rerender({ impulse: impulse, isActive: false })
        expect(result.current).toStrictEqual({ count: -1 })
        expect(impulse).toHaveProperty("scopes.size", 0)
      })
    })

    describe("when inactive", () => {
      it.concurrent("should return fallback value when inactive", () => {
        const impulse = Impulse.of({ count: 1 })
        const { result } = renderHook(useHook, {
          initialProps: { impulse: impulse, isActive: false },
        })

        expect(result.current).toStrictEqual({ count: -1 })
        expect(impulse).toHaveProperty("scopes.size", 0)
      })

      it.concurrent(
        "should return fallback value when inactive when impulse updates",
        () => {
          const impulse = Impulse.of({ count: 1 })
          const { result } = renderHook(useHook, {
            initialProps: { impulse: impulse, isActive: false },
          })

          act(() => {
            impulse.setValue({ count: 2 })
          })
          expect(result.current).toStrictEqual({ count: -1 })
          expect(impulse).toHaveProperty("scopes.size", 0)
        },
      )

      it.concurrent("should return impulse value when turns active", () => {
        const impulse = Impulse.of({ count: 1 })
        const { result, rerender } = renderHook(useHook, {
          initialProps: { impulse: impulse, isActive: false },
        })

        rerender({ impulse: impulse, isActive: true })
        expect(result.current).toStrictEqual({ count: 1 })
        expect(impulse).toHaveProperty("scopes.size", 1)

        act(() => {
          impulse.setValue({ count: 2 })
        })
        expect(result.current).toStrictEqual({ count: 2 })
        expect(impulse).toHaveProperty("scopes.size", 1)
      })

      it.concurrent(
        "should not trigger the watcher when the impulse updates",
        () => {
          const spy = vi.fn()
          const impulse = Impulse.of({ count: 1 })
          renderHook(useHook, {
            initialProps: { impulse, isActive: false, spy },
          })

          spy.mockReset()

          act(() => {
            impulse.setValue(Counter.inc)
          })
          expect(spy).not.toHaveBeenCalled()
        },
      )
    })
  })
})
