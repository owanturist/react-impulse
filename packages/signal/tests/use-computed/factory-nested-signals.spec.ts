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

describe("nested factory", () => {
  const factory = (monitor: Monitor, { signal }: WithSignal<WithFirst & WithSecond>) => {
    const { first, second } = signal.read(monitor)

    return Counter.merge(first.read(monitor), second.read(monitor))
  }

  describe.each([
    [
      "without deps",
      ({ signal }: WithSignal<WithFirst & WithSecond>) =>
        useComputed((monitor) => factory(monitor, { signal })),
    ],
    [
      "without comparator",
      ({ signal }: WithSignal<WithFirst & WithSecond>) =>
        useComputed((monitor) => factory(monitor, { signal }), [signal]),
    ],
    [
      "with inline comparator",
      ({ signal }: WithSignal<WithFirst & WithSecond>) =>
        useComputed((monitor) => factory(monitor, { signal }), [signal], {
          equals: (prev, next) => Counter.equals(prev, next),
        }),
    ],
    [
      "with memoized comparator",
      ({ signal }: WithSignal<WithFirst & WithSecond>) =>
        useComputed((monitor) => factory(monitor, { signal }), [signal], {
          equals: Counter.equals,
        }),
    ],
  ])("%s", (_, useCounter) => {
    const setup = () => {
      const first = Signal({ count: 2 })
      const second = Signal({ count: 3 })
      const signal = Signal({ first, second })
      const { result } = renderHook(useCounter, {
        initialProps: { signal },
      })

      return { signal, first, second, result }
    }

    it("initiates with expected result", () => {
      const { result } = setup()

      expect(result.current).toStrictEqual({ count: 5 })
    })

    it("increments only first", () => {
      const { first, result } = setup()

      act(() => {
        first.write(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 6 })
    })

    it("increments only second", () => {
      const { second, result } = setup()

      act(() => {
        second.write(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 6 })
    })

    it("increments both first and second", () => {
      const { first, second, result } = setup()

      act(() => {
        first.write(Counter.inc)
        second.write(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 7 })
    })

    it("replaces nested Signals", () => {
      const newFirst = Signal({ count: 5 })
      const { signal, result } = setup()

      act(() => {
        signal.write((current) => ({
          ...current,
          first: newFirst,
        }))
      })
      expect(result.current).toStrictEqual({ count: 8 })
    })

    it("updates nested Signals", () => {
      const { signal, result } = setup()

      act(() => {
        signal.write((current) => {
          current.first.write(Counter.inc)
          current.second.write(Counter.inc)

          return current
        })
      })
      expect(result.current).toStrictEqual({ count: 7 })
    })
  })
})

describe("triggering factory for nested Signals vs single Signal", () => {
  const factorySingle = (monitor: Monitor, { signal, spy }: WithSignal & WithSpy) => {
    spy()

    return signal.read(monitor)
  }

  const factoryNested = (
    monitor: Monitor,
    { spy, signal }: WithSignal<WithFirst & WithSecond & WithThird> & WithSpy,
  ) => {
    spy()

    const { first, second, third } = signal.read(monitor)

    return Counter.merge(first.read(monitor), second.read(monitor), third.read(monitor))
  }

  describe.each([
    [
      "without deps",
      ({ signal, spy }: WithSignal & WithSpy) =>
        useComputed((monitor) => factorySingle(monitor, { signal, spy })),
      ({ spy, signal }: WithSignal<WithFirst & WithSecond & WithThird> & WithSpy) =>
        useComputed((monitor) => factoryNested(monitor, { signal, spy })),
    ],
    [
      "without comparator",
      ({ signal, spy }: WithSignal & WithSpy) =>
        useComputed((monitor) => factorySingle(monitor, { signal, spy }), [signal, spy]),
      ({ spy, signal }: WithSignal<WithFirst & WithSecond & WithThird> & WithSpy) =>
        useComputed((monitor) => factoryNested(monitor, { signal, spy }), [signal, spy]),
    ],
    [
      "with inline comparator",
      ({ signal, spy }: WithSignal & WithSpy) =>
        useComputed((monitor) => factorySingle(monitor, { signal, spy }), [signal, spy], {
          equals: (prev, next) => Counter.equals(prev, next),
        }),
      ({ spy, signal }: WithSignal<WithFirst & WithSecond & WithThird> & WithSpy) =>
        useComputed((monitor) => factoryNested(monitor, { signal, spy }), [signal, spy], {
          equals: (prev, next) => Counter.equals(prev, next),
        }),
    ],
    [
      "with memoized comparator",
      ({ signal, spy }: WithSignal & WithSpy) =>
        useComputed((monitor) => factorySingle(monitor, { signal, spy }), [signal, spy], {
          equals: Counter.equals,
        }),
      ({ spy, signal }: WithSignal<WithFirst & WithSecond & WithThird> & WithSpy) =>
        useComputed((monitor) => factoryNested(monitor, { signal, spy }), [signal, spy], {
          equals: Counter.equals,
        }),
    ],
  ])("%s", (_, useSingleCounter, useNestedCounters) => {
    const setup = () => {
      const first = Signal({ count: 1 })
      const second = Signal({ count: 2 })
      const third = Signal({ count: 3 })
      const signal = Signal({ first, second, third })
      const spySingle = vi.fn()
      const spyNested = vi.fn()

      const { result: resultSingle } = renderHook(useSingleCounter, {
        initialProps: { signal: first, spy: spySingle },
      })

      const { result: resultNested } = renderHook(useNestedCounters, {
        initialProps: { signal, spy: spyNested },
      })

      return {
        first,
        second,
        third,
        signal,
        spySingle,
        spyNested,
        resultSingle,
        resultNested,
      }
    }

    it("calls factories the same amount when initiates", () => {
      const { spySingle, spyNested, resultSingle, resultNested } = setup()

      expect(resultSingle.current).toStrictEqual({ count: 1 })
      expect(resultNested.current).toStrictEqual({ count: 6 })
      expect(spyNested).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("calls factories the same amount when only first and second", () => {
      const { first, second, spySingle, spyNested, resultSingle, resultNested } = setup()

      act(() => {
        batch(() => {
          first.write(Counter.inc)
          second.write(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 2 })
      expect(resultNested.current).toStrictEqual({ count: 8 })
      expect(spyNested).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("calls factories the same amount when only first and third", () => {
      const { first, third, spySingle, spyNested, resultSingle, resultNested } = setup()

      act(() => {
        batch(() => {
          first.write(Counter.inc)
          third.write(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 2 })
      expect(resultNested.current).toStrictEqual({ count: 8 })
      expect(spyNested).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("calls factories the same amount when first, second and third", () => {
      const { first, second, third, spySingle, spyNested, resultSingle, resultNested } = setup()

      act(() => {
        batch(() => {
          batch(() => {
            first.write(Counter.inc)
            second.write(Counter.inc)
          })

          third.write(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 2 })
      expect(resultNested.current).toStrictEqual({ count: 9 })
      expect(spyNested).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("doesn't call single factory when changes only second and third", () => {
      const { second, third, spySingle, spyNested, resultSingle, resultNested } = setup()

      spySingle.mockReset()
      spyNested.mockReset()

      act(() => {
        batch(() => {
          second.write(Counter.inc)
          third.write(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 1 })
      expect(resultNested.current).toStrictEqual({ count: 8 })
      expect(spySingle).not.toHaveBeenCalled()
      expect(spyNested).toHaveBeenCalled()
    })

    it("Signal#write wraps the callback into batch", () => {
      const { second, third, signal, spyNested, resultNested } = setup()

      spyNested.mockReset()

      act(() => {
        batch(() => {
          second.write(Counter.inc)
          third.write(Counter.inc)
        })
      })

      const spyCallsForBatch = spyNested.mock.calls.length

      spyNested.mockReset()

      act(() => {
        signal.write((current) => {
          current.second.write(Counter.inc)
          current.third.write(Counter.inc)

          return current
        })
      })

      expect(spyNested).toHaveBeenCalledTimes(spyCallsForBatch)
      expect(resultNested.current).toStrictEqual({ count: 10 })
    })
  })
})
