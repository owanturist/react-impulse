import { act, renderHook } from "@testing-library/react"

import { Impulse, type Monitor, batch, useComputed } from "../../src"
import {
  Counter,
  type WithFirst,
  type WithImpulse,
  type WithSecond,
  type WithSpy,
  type WithThird,
} from "../common"

describe("nested factory", () => {
  const factory = (monitor: Monitor, { impulse }: WithImpulse<WithFirst & WithSecond>) => {
    const { first, second } = impulse.read(monitor)

    return Counter.merge(first.read(monitor), second.read(monitor))
  }

  describe.each([
    [
      "without deps",
      ({ impulse }: WithImpulse<WithFirst & WithSecond>) =>
        useComputed((monitor) => factory(monitor, { impulse })),
    ],
    [
      "without comparator",
      ({ impulse }: WithImpulse<WithFirst & WithSecond>) =>
        useComputed((monitor) => factory(monitor, { impulse }), [impulse]),
    ],
    [
      "with inline comparator",
      ({ impulse }: WithImpulse<WithFirst & WithSecond>) =>
        useComputed((monitor) => factory(monitor, { impulse }), [impulse], {
          equals: (prev, next) => Counter.equals(prev, next),
        }),
    ],
    [
      "with memoized comparator",
      ({ impulse }: WithImpulse<WithFirst & WithSecond>) =>
        useComputed((monitor) => factory(monitor, { impulse }), [impulse], {
          equals: Counter.equals,
        }),
    ],
  ])("%s", (_, useCounter) => {
    const setup = () => {
      const first = Impulse({ count: 2 })
      const second = Impulse({ count: 3 })
      const impulse = Impulse({ first, second })
      const { result } = renderHook(useCounter, {
        initialProps: { impulse },
      })

      return { impulse, first, second, result }
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

    it("replaces nested impulses", () => {
      const newFirst = Impulse({ count: 5 })
      const { impulse, result } = setup()

      act(() => {
        impulse.update((current) => ({
          ...current,
          first: newFirst,
        }))
      })
      expect(result.current).toStrictEqual({ count: 8 })
    })

    it("updates nested impulses", () => {
      const { impulse, result } = setup()

      act(() => {
        impulse.update((current) => {
          current.first.update(Counter.inc)
          current.second.update(Counter.inc)

          return current
        })
      })
      expect(result.current).toStrictEqual({ count: 7 })
    })
  })
})

describe("triggering factory for nested impulses vs single impulse", () => {
  const factorySingle = (monitor: Monitor, { impulse, spy }: WithImpulse & WithSpy) => {
    spy()

    return impulse.read(monitor)
  }

  const factoryNested = (
    monitor: Monitor,
    { spy, impulse }: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy,
  ) => {
    spy()

    const { first, second, third } = impulse.read(monitor)

    return Counter.merge(first.read(monitor), second.read(monitor), third.read(monitor))
  }

  describe.each([
    [
      "without deps",
      ({ impulse, spy }: WithImpulse & WithSpy) =>
        useComputed((monitor) => factorySingle(monitor, { impulse, spy })),
      ({ spy, impulse }: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy) =>
        useComputed((monitor) => factoryNested(monitor, { impulse, spy })),
    ],
    [
      "without comparator",
      ({ impulse, spy }: WithImpulse & WithSpy) =>
        useComputed((monitor) => factorySingle(monitor, { impulse, spy }), [impulse, spy]),
      ({ spy, impulse }: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy) =>
        useComputed((monitor) => factoryNested(monitor, { impulse, spy }), [impulse, spy]),
    ],
    [
      "with inline comparator",
      ({ impulse, spy }: WithImpulse & WithSpy) =>
        useComputed((monitor) => factorySingle(monitor, { impulse, spy }), [impulse, spy], {
          equals: (prev, next) => Counter.equals(prev, next),
        }),
      ({ spy, impulse }: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy) =>
        useComputed((monitor) => factoryNested(monitor, { impulse, spy }), [impulse, spy], {
          equals: (prev, next) => Counter.equals(prev, next),
        }),
    ],
    [
      "with memoized comparator",
      ({ impulse, spy }: WithImpulse & WithSpy) =>
        useComputed((monitor) => factorySingle(monitor, { impulse, spy }), [impulse, spy], {
          equals: Counter.equals,
        }),
      ({ spy, impulse }: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy) =>
        useComputed((monitor) => factoryNested(monitor, { impulse, spy }), [impulse, spy], {
          equals: Counter.equals,
        }),
    ],
  ])("%s", (_, useSingleCounter, useNestedCounters) => {
    const setup = () => {
      const first = Impulse({ count: 1 })
      const second = Impulse({ count: 2 })
      const third = Impulse({ count: 3 })
      const impulse = Impulse({ first, second, third })
      const spySingle = vi.fn()
      const spyNested = vi.fn()

      const { result: resultSingle } = renderHook(useSingleCounter, {
        initialProps: { impulse: first, spy: spySingle },
      })

      const { result: resultNested } = renderHook(useNestedCounters, {
        initialProps: { impulse, spy: spyNested },
      })

      return {
        first,
        second,
        third,
        impulse,
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
          first.update(Counter.inc)
          second.update(Counter.inc)
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
          first.update(Counter.inc)
          third.update(Counter.inc)
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
            first.update(Counter.inc)
            second.update(Counter.inc)
          })

          third.update(Counter.inc)
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
          second.update(Counter.inc)
          third.update(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 1 })
      expect(resultNested.current).toStrictEqual({ count: 8 })
      expect(spySingle).not.toHaveBeenCalled()
      expect(spyNested).toHaveBeenCalled()
    })

    it("Impulse#update wraps the callback into batch", () => {
      const { second, third, impulse, spyNested, resultNested } = setup()

      spyNested.mockReset()

      act(() => {
        batch(() => {
          second.update(Counter.inc)
          third.update(Counter.inc)
        })
      })

      const spyCallsForBatch = spyNested.mock.calls.length

      spyNested.mockReset()

      act(() => {
        impulse.update((current) => {
          current.second.update(Counter.inc)
          current.third.update(Counter.inc)

          return current
        })
      })

      expect(spyNested).toHaveBeenCalledTimes(spyCallsForBatch)
      expect(resultNested.current).toStrictEqual({ count: 10 })
    })
  })
})
