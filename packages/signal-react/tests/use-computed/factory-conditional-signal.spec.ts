import { type Monitor, Signal } from "@owanturist/signal"
import { act, renderHook } from "@testing-library/react"

import { Counter } from "~/tools/testing/counter"

import { useComputed } from "../../src"
import type { WithIsActive, WithSignal, WithSpy } from "../common"

function factory(
  monitor: Monitor,
  { signal, isActive, spy }: WithSignal & WithIsActive & Partial<WithSpy>,
) {
  spy?.()

  return isActive ? signal.read(monitor) : { count: -1 }
}

describe.each([
  [
    "without deps",
    ({ signal, isActive, spy }: WithSignal & WithIsActive & Partial<WithSpy>) =>
      useComputed((monitor) => factory(monitor, { signal, isActive, spy })),
  ],
  [
    "without comparator",
    ({ signal, isActive, spy }: WithSignal & WithIsActive & Partial<WithSpy>) =>
      useComputed(
        (monitor) => factory(monitor, { signal, isActive, spy }),
        [signal, isActive, spy],
      ),
  ],
  [
    "with inline comparator",
    ({ signal, isActive, spy }: WithSignal & WithIsActive & Partial<WithSpy>) =>
      useComputed(
        (monitor) => factory(monitor, { signal, isActive, spy }),
        [signal, isActive, spy],
        {
          equals: (prev, next) => Counter.equals(prev, next),
        },
      ),
  ],
  [
    "with memoized comparator",
    ({ signal, isActive, spy }: WithSignal & WithIsActive & Partial<WithSpy>) =>
      useComputed(
        (monitor) => factory(monitor, { signal, isActive, spy }),
        [signal, isActive, spy],
        {
          equals: Counter.equals,
        },
      ),
  ],
])("conditional factory %s", (_, useHook) => {
  describe("when active", () => {
    it("should return Signal's value on init", () => {
      const signal = Signal({ count: 1 })
      const { result } = renderHook(useHook, {
        initialProps: { signal, isActive: true },
      })

      expect(result.current).toStrictEqual({ count: 1 })
      expect(signal).toHaveEmittersSize(1)
    })

    it("should return updated Signal's value", () => {
      const signal = Signal({ count: 1 })

      const { result } = renderHook(useHook, {
        initialProps: { signal, isActive: true },
      })

      act(() => {
        signal.write({ count: 2 })
      })
      expect(result.current).toStrictEqual({ count: 2 })
      expect(signal).toHaveEmittersSize(1)
    })

    it("should return replaced Signal's value", () => {
      const signal1 = Signal({ count: 1 })
      const signal2 = Signal({ count: 10 })

      const { result, rerender } = renderHook(useHook, {
        initialProps: { signal: signal1, isActive: true },
      })
      expect(signal1).toHaveEmittersSize(1)
      expect(signal2).toHaveEmittersSize(0)

      act(() => {
        rerender({ signal: signal2, isActive: true })
      })
      expect(result.current).toStrictEqual({ count: 10 })
      expect(signal1).toHaveEmittersSize(0)
      expect(signal2).toHaveEmittersSize(1)

      act(() => {
        signal2.write({ count: 20 })
      })
      expect(result.current).toStrictEqual({ count: 20 })

      act(() => {
        signal1.write({ count: 2 })
      })
      expect(result.current).toStrictEqual({ count: 20 })
      expect(signal1).toHaveEmittersSize(0)
      expect(signal2).toHaveEmittersSize(1)
    })

    it("should return fallback value when turns inactive", () => {
      const signal = Signal({ count: 1 })
      const { result, rerender } = renderHook(useHook, {
        initialProps: { signal, isActive: true },
      })

      rerender({ signal, isActive: false })
      expect(result.current).toStrictEqual({ count: -1 })
      expect(signal).toHaveEmittersSize(0)
    })
  })

  describe("when inactive", () => {
    it("should return fallback value when inactive", () => {
      const signal = Signal({ count: 1 })
      const { result } = renderHook(useHook, {
        initialProps: { signal, isActive: false },
      })

      expect(result.current).toStrictEqual({ count: -1 })
      expect(signal).toHaveEmittersSize(0)
    })

    it("should return fallback value when inactive when signal updates", () => {
      const signal = Signal({ count: 1 })
      const { result } = renderHook(useHook, {
        initialProps: { signal, isActive: false },
      })

      act(() => {
        signal.write({ count: 2 })
      })
      expect(result.current).toStrictEqual({ count: -1 })
      expect(signal).toHaveEmittersSize(0)
    })

    it("should return Signal's value when turns active", () => {
      const signal = Signal({ count: 1 })
      const { result, rerender } = renderHook(useHook, {
        initialProps: { signal, isActive: false },
      })

      rerender({ signal, isActive: true })
      expect(result.current).toStrictEqual({ count: 1 })
      expect(signal).toHaveEmittersSize(1)

      act(() => {
        signal.write({ count: 2 })
      })
      expect(result.current).toStrictEqual({ count: 2 })
      expect(signal).toHaveEmittersSize(1)
    })

    it("should not trigger the factory when the signal updates", () => {
      const spy = vi.fn()
      const signal = Signal({ count: 1 })
      renderHook(useHook, {
        initialProps: { signal, isActive: false, spy },
      })

      spy.mockReset()

      act(() => {
        signal.write(Counter.inc)
      })
      expect(spy).not.toHaveBeenCalled()
    })
  })
})
