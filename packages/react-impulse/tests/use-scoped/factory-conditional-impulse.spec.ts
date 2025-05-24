import { act, renderHook } from "@testing-library/react"

import { Impulse, type Scope, useScoped } from "../../src"
import {
  Counter,
  type WithIsActive,
  type WithImpulse,
  type WithSpy,
} from "../common"

const factory = (
  scope: Scope,
  { impulse, isActive, spy }: WithImpulse & WithIsActive & Partial<WithSpy>,
) => {
  spy?.()

  return isActive ? impulse.getValue(scope) : { count: -1 }
}

describe.each([
  [
    "without deps",
    ({
      impulse,
      isActive,
      spy,
    }: WithImpulse & WithIsActive & Partial<WithSpy>) => {
      return useScoped((scope) => factory(scope, { impulse, isActive, spy }))
    },
  ],
  [
    "without comparator",
    ({
      impulse,
      isActive,
      spy,
    }: WithImpulse & WithIsActive & Partial<WithSpy>) => {
      return useScoped(
        (scope) => factory(scope, { impulse, isActive, spy }),
        [impulse, isActive, spy],
      )
    },
  ],
  [
    "with inline comparator",
    ({
      impulse,
      isActive,
      spy,
    }: WithImpulse & WithIsActive & Partial<WithSpy>) => {
      return useScoped(
        (scope) => factory(scope, { impulse, isActive, spy }),
        [impulse, isActive, spy],
        {
          compare: (prev, next) => Counter.compare(prev, next),
        },
      )
    },
  ],
  [
    "with memoized comparator",
    ({
      impulse,
      isActive,
      spy,
    }: WithImpulse & WithIsActive & Partial<WithSpy>) => {
      return useScoped(
        (scope) => factory(scope, { impulse, isActive, spy }),
        [impulse, isActive, spy],
        { compare: Counter.compare },
      )
    },
  ],
])("conditional factory %s", (_, useHook) => {
  describe("when active", () => {
    it("should return Impulse's value on init", () => {
      const impulse = Impulse({ count: 1 })
      const { result } = renderHook(useHook, {
        initialProps: { impulse: impulse, isActive: true },
      })

      expect(result.current).toStrictEqual({ count: 1 })
      expect(impulse).toHaveEmittersSize(1)
    })

    it("should return updated Impulse's value", () => {
      const impulse = Impulse({ count: 1 })

      const { result } = renderHook(useHook, {
        initialProps: { impulse: impulse, isActive: true },
      })

      act(() => {
        impulse.setValue({ count: 2 })
      })
      expect(result.current).toStrictEqual({ count: 2 })
      expect(impulse).toHaveEmittersSize(1)
    })

    it("should return replaced Impulse's value", () => {
      const impulse_1 = Impulse({ count: 1 })
      const impulse_2 = Impulse({ count: 10 })

      const { result, rerender } = renderHook(useHook, {
        initialProps: { impulse: impulse_1, isActive: true },
      })
      expect(impulse_1).toHaveEmittersSize(1)
      expect(impulse_2).toHaveEmittersSize(0)

      act(() => {
        rerender({ impulse: impulse_2, isActive: true })
      })
      expect(result.current).toStrictEqual({ count: 10 })
      expect(impulse_1).toHaveEmittersSize(0)
      expect(impulse_2).toHaveEmittersSize(1)

      act(() => {
        impulse_2.setValue({ count: 20 })
      })
      expect(result.current).toStrictEqual({ count: 20 })

      act(() => {
        impulse_1.setValue({ count: 2 })
      })
      expect(result.current).toStrictEqual({ count: 20 })
      expect(impulse_1).toHaveEmittersSize(0)
      expect(impulse_2).toHaveEmittersSize(1)
    })

    it("should return fallback value when turns inactive", () => {
      const impulse = Impulse({ count: 1 })
      const { result, rerender } = renderHook(useHook, {
        initialProps: { impulse: impulse, isActive: true },
      })

      rerender({ impulse: impulse, isActive: false })
      expect(result.current).toStrictEqual({ count: -1 })
      expect(impulse).toHaveEmittersSize(0)
    })
  })

  describe("when inactive", () => {
    it("should return fallback value when inactive", () => {
      const impulse = Impulse({ count: 1 })
      const { result } = renderHook(useHook, {
        initialProps: { impulse: impulse, isActive: false },
      })

      expect(result.current).toStrictEqual({ count: -1 })
      expect(impulse).toHaveEmittersSize(0)
    })

    it("should return fallback value when inactive when impulse updates", () => {
      const impulse = Impulse({ count: 1 })
      const { result } = renderHook(useHook, {
        initialProps: { impulse: impulse, isActive: false },
      })

      act(() => {
        impulse.setValue({ count: 2 })
      })
      expect(result.current).toStrictEqual({ count: -1 })
      expect(impulse).toHaveEmittersSize(0)
    })

    it("should return Impulse's value when turns active", () => {
      const impulse = Impulse({ count: 1 })
      const { result, rerender } = renderHook(useHook, {
        initialProps: { impulse: impulse, isActive: false },
      })

      rerender({ impulse: impulse, isActive: true })
      expect(result.current).toStrictEqual({ count: 1 })
      expect(impulse).toHaveEmittersSize(1)

      act(() => {
        impulse.setValue({ count: 2 })
      })
      expect(result.current).toStrictEqual({ count: 2 })
      expect(impulse).toHaveEmittersSize(1)
    })

    it("should not trigger the factory when the impulse updates", () => {
      const spy = vi.fn()
      const impulse = Impulse({ count: 1 })
      renderHook(useHook, {
        initialProps: { impulse, isActive: false, spy },
      })

      spy.mockReset()

      act(() => {
        impulse.setValue(Counter.inc)
      })
      expect(spy).not.toHaveBeenCalled()
    })
  })
})
