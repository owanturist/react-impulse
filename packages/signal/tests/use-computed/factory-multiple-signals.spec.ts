import { act, renderHook } from "@testing-library/react"

import { type Monitor, Signal, batch, useComputed } from "../../src"
import {
  Counter,
  type WithFirst,
  type WithSecond,
  type WithSignal,
  type WithSpy,
  type WithThird,
} from "../common"

describe("multiple factory", () => {
  const factory = (monitor: Monitor, { first, second }: WithFirst & WithSecond) =>
    Counter.merge(first.read(monitor), second.read(monitor))

  describe.each([
    [
      "without deps",
      ({ first, second }: WithFirst & WithSecond) =>
        useComputed((monitor) => factory(monitor, { first, second })),
    ],
    [
      "without comparator",
      ({ first, second }: WithFirst & WithSecond) =>
        useComputed((monitor) => factory(monitor, { first, second }), [first, second]),
    ],
    [
      "with inline comparator",
      ({ first, second }: WithFirst & WithSecond) =>
        useComputed((monitor) => factory(monitor, { first, second }), [first, second], {
          equals: (prev, next) => Counter.equals(prev, next),
        }),
    ],
    [
      "with memoized comparator",
      ({ first, second }: WithFirst & WithSecond) =>
        useComputed((monitor) => factory(monitor, { first, second }), [first, second], {
          equals: Counter.equals,
        }),
    ],
  ])("%s", (_, useHook) => {
    const setup = () => {
      const first = Signal({ count: 2 })
      const second = Signal({ count: 3 })
      const { result } = renderHook(useHook, {
        initialProps: { first, second },
      })

      return { first, second, result }
    }

    it("initiates with expected result", () => {
      const { result } = setup()

      expect(result.current).toStrictEqual({ count: 5 })
    })

    it("increments only first", () => {
      const { first, result } = setup()

      act(() => {
        first.update(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 6 })
    })

    it("increments only second", () => {
      const { second, result } = setup()

      act(() => {
        second.update(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 6 })
    })

    it("increments both first and second", () => {
      const { first, second, result } = setup()

      act(() => {
        first.update(Counter.inc)
        second.update(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 7 })
    })
  })
})

describe("triggering factory for multiple Signals vs single Signal", () => {
  const factorySingle = (monitor: Monitor, { signal, spy }: WithSignal & WithSpy) => {
    spy()

    return signal.read(monitor)
  }

  const factoryMultiple = (
    monitor: Monitor,
    { spy, first, second, third }: WithFirst & WithSecond & WithThird & WithSpy,
  ) => {
    spy()

    return Counter.merge(first.read(monitor), second.read(monitor), third.read(monitor))
  }

  describe.each([
    [
      "without deps",
      ({ signal, spy }: WithSignal & WithSpy) =>
        useComputed((monitor) => factorySingle(monitor, { signal, spy })),
      ({ first, second, third, spy }: WithFirst & WithSecond & WithThird & WithSpy) =>
        useComputed((monitor) => factoryMultiple(monitor, { first, second, third, spy })),
    ],
    [
      "without comparator",
      ({ signal, spy }: WithSignal & WithSpy) =>
        useComputed((monitor) => factorySingle(monitor, { signal, spy }), [signal, spy]),
      ({ first, second, third, spy }: WithFirst & WithSecond & WithThird & WithSpy) =>
        useComputed(
          (monitor) => factoryMultiple(monitor, { first, second, third, spy }),
          [first, second, third, spy],
        ),
    ],
    [
      "with inline comparator",
      ({ signal, spy }: WithSignal & WithSpy) =>
        useComputed((monitor) => factorySingle(monitor, { signal, spy }), [signal, spy], {
          equals: (prev, next) => Counter.equals(prev, next),
        }),
      ({ first, second, third, spy }: WithFirst & WithSecond & WithThird & WithSpy) =>
        useComputed(
          (monitor) => factoryMultiple(monitor, { first, second, third, spy }),
          [first, second, third, spy],
          {
            equals: (prev, next) => Counter.equals(prev, next),
          },
        ),
    ],
    [
      "with memoized comparator",
      ({ signal, spy }: WithSignal & WithSpy) =>
        useComputed((monitor) => factorySingle(monitor, { signal, spy }), [signal, spy], {
          equals: Counter.equals,
        }),
      ({ first, second, third, spy }: WithFirst & WithSecond & WithThird & WithSpy) =>
        useComputed(
          (monitor) => factoryMultiple(monitor, { first, second, third, spy }),
          [first, second, third, spy],
          { equals: Counter.equals },
        ),
    ],
  ])("%s", (_, useSingleHook, useMultipleHook) => {
    const setup = () => {
      const first = Signal({ count: 1 })
      const second = Signal({ count: 2 })
      const third = Signal({ count: 3 })
      const spySingle = vi.fn()
      const spyMultiple = vi.fn()

      const { result: resultSingle } = renderHook(useSingleHook, {
        initialProps: { signal: first, spy: spySingle },
      })

      const { result: resultMultiple } = renderHook(useMultipleHook, {
        initialProps: { first, second, third, spy: spyMultiple },
      })

      return {
        first,
        second,
        third,
        spySingle,
        spyMultiple,
        resultSingle,
        resultMultiple,
      }
    }

    it("calls factories the same amount when initiates", () => {
      const { spySingle, spyMultiple, resultSingle, resultMultiple } = setup()

      expect(resultSingle.current).toStrictEqual({ count: 1 })
      expect(resultMultiple.current).toStrictEqual({ count: 6 })
      expect(spyMultiple).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("calls factories the same amount when only first and second", () => {
      const { first, second, spySingle, spyMultiple, resultSingle, resultMultiple } = setup()

      act(() => {
        batch(() => {
          first.update(Counter.inc)
          second.update(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 2 })
      expect(resultMultiple.current).toStrictEqual({ count: 8 })
      expect(spyMultiple).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("calls factories the same amount when only first and third", () => {
      const { first, third, spySingle, spyMultiple, resultSingle, resultMultiple } = setup()

      act(() => {
        batch(() => {
          first.update(Counter.inc)
          third.update(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 2 })
      expect(resultMultiple.current).toStrictEqual({ count: 8 })
      expect(spyMultiple).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("calls factories the same amount when first, second and third", () => {
      const { first, second, third, spySingle, spyMultiple, resultSingle, resultMultiple } = setup()

      act(() => {
        batch(() => {
          batch(() => {
            first.update(Counter.inc)
            second.update(Counter.inc)
          })

          third.update(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 2 })
      expect(resultMultiple.current).toStrictEqual({ count: 9 })
      expect(spyMultiple).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("doesn't call single factory when changes only second and third", () => {
      const { second, third, spySingle, spyMultiple, resultSingle, resultMultiple } = setup()

      spySingle.mockReset()
      spyMultiple.mockReset()

      act(() => {
        batch(() => {
          second.update(Counter.inc)
          third.update(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 1 })
      expect(resultMultiple.current).toStrictEqual({ count: 8 })
      expect(spySingle).not.toHaveBeenCalled()
      expect(spyMultiple).toHaveBeenCalled()
    })
  })
})
