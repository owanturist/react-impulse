import { act, renderHook } from "@testing-library/react"

import { batch, Impulse, type Scope, useScoped } from "../../src"
import {
  Counter,
  type WithFirst,
  type WithSecond,
  type WithSpy,
  type WithImpulse,
  type WithThird,
} from "../common"

describe("nested factory", () => {
  const factory = (
    scope: Scope,
    { impulse }: WithImpulse<WithFirst & WithSecond>,
  ) => {
    const { first, second } = impulse.getValue(scope)

    return Counter.merge(first.getValue(scope), second.getValue(scope))
  }

  describe.each([
    [
      "without deps",
      ({ impulse }: WithImpulse<WithFirst & WithSecond>) => {
        return useScoped((scope) => factory(scope, { impulse }))
      },
    ],
    [
      "without comparator",
      ({ impulse }: WithImpulse<WithFirst & WithSecond>) => {
        return useScoped((scope) => factory(scope, { impulse }), [impulse])
      },
    ],
    [
      "with inline comparator",
      ({ impulse }: WithImpulse<WithFirst & WithSecond>) => {
        return useScoped((scope) => factory(scope, { impulse }), [impulse], {
          compare: (prev, next) => Counter.compare(prev, next),
        })
      },
    ],
    [
      "with memoized comparator",
      ({ impulse }: WithImpulse<WithFirst & WithSecond>) => {
        return useScoped((scope) => factory(scope, { impulse }), [impulse], {
          compare: Counter.compare,
        })
      },
    ],
  ])("%s", (_, useCounter) => {
    const setup = () => {
      const first = Impulse.of({ count: 2 })
      const second = Impulse.of({ count: 3 })
      const impulse = Impulse.of({ first, second })
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
        first.setValue(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 6 })
    })

    it("increments only second", () => {
      const { second, result } = setup()

      act(() => {
        second.setValue(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 6 })
    })

    it("increments both first and second", () => {
      const { first, second, result } = setup()

      act(() => {
        first.setValue(Counter.inc)
        second.setValue(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 7 })
    })

    it("replaces nested impulses", () => {
      const newFirst = Impulse.of({ count: 5 })
      const { impulse, result } = setup()

      act(() => {
        impulse.setValue((current) => ({
          ...current,
          first: newFirst,
        }))
      })
      expect(result.current).toStrictEqual({ count: 8 })
    })

    it("updates nested impulses", () => {
      const { impulse, result } = setup()

      act(() => {
        impulse.setValue((current) => {
          current.first.setValue(Counter.inc)
          current.second.setValue(Counter.inc)

          return current
        })
      })
      expect(result.current).toStrictEqual({ count: 7 })
    })
  })
})

describe("triggering factory for nested impulses vs single impulse", () => {
  const factorySingle = (
    scope: Scope,
    { impulse, spy }: WithImpulse & WithSpy,
  ) => {
    spy()

    return impulse.getValue(scope)
  }

  const factoryNested = (
    scope: Scope,
    { spy, impulse }: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy,
  ) => {
    spy()

    const { first, second, third } = impulse.getValue(scope)

    return Counter.merge(
      first.getValue(scope),
      second.getValue(scope),
      third.getValue(scope),
    )
  }

  describe.each([
    [
      "without deps",
      ({ impulse, spy }: WithImpulse & WithSpy) => {
        return useScoped((scope) => factorySingle(scope, { impulse, spy }))
      },
      ({
        spy,
        impulse,
      }: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy) => {
        return useScoped((scope) => factoryNested(scope, { impulse, spy }))
      },
    ],
    [
      "without comparator",
      ({ impulse, spy }: WithImpulse & WithSpy) => {
        return useScoped(
          (scope) => factorySingle(scope, { impulse, spy }),
          [impulse, spy],
        )
      },
      ({
        spy,
        impulse,
      }: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy) => {
        return useScoped(
          (scope) => factoryNested(scope, { impulse, spy }),
          [impulse, spy],
        )
      },
    ],
    [
      "with inline comparator",
      ({ impulse, spy }: WithImpulse & WithSpy) => {
        return useScoped(
          (scope) => factorySingle(scope, { impulse, spy }),
          [impulse, spy],
          {
            compare: (prev, next) => Counter.compare(prev, next),
          },
        )
      },
      ({
        spy,
        impulse,
      }: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy) => {
        return useScoped(
          (scope) => factoryNested(scope, { impulse, spy }),
          [impulse, spy],
          {
            compare: (prev, next) => Counter.compare(prev, next),
          },
        )
      },
    ],
    [
      "with memoized comparator",
      ({ impulse, spy }: WithImpulse & WithSpy) => {
        return useScoped(
          (scope) => factorySingle(scope, { impulse, spy }),
          [impulse, spy],
          { compare: Counter.compare },
        )
      },
      ({
        spy,
        impulse,
      }: WithImpulse<WithFirst & WithSecond & WithThird> & WithSpy) => {
        return useScoped(
          (scope) => factoryNested(scope, { impulse, spy }),
          [impulse, spy],
          { compare: Counter.compare },
        )
      },
    ],
  ])("%s", (_, useSingleCounter, useNestedCounters) => {
    const setup = () => {
      const first = Impulse.of({ count: 1 })
      const second = Impulse.of({ count: 2 })
      const third = Impulse.of({ count: 3 })
      const impulse = Impulse.of({ first, second, third })
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
      const {
        first,
        second,
        spySingle,
        spyNested,
        resultSingle,
        resultNested,
      } = setup()

      act(() => {
        batch(() => {
          first.setValue(Counter.inc)
          second.setValue(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 2 })
      expect(resultNested.current).toStrictEqual({ count: 8 })
      expect(spyNested).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("calls factories the same amount when only first and third", () => {
      const { first, third, spySingle, spyNested, resultSingle, resultNested } =
        setup()

      act(() => {
        batch(() => {
          first.setValue(Counter.inc)
          third.setValue(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 2 })
      expect(resultNested.current).toStrictEqual({ count: 8 })
      expect(spyNested).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("calls factories the same amount when first, second and third", () => {
      const {
        first,
        second,
        third,
        spySingle,
        spyNested,
        resultSingle,
        resultNested,
      } = setup()

      act(() => {
        batch(() => {
          batch(() => {
            first.setValue(Counter.inc)
            second.setValue(Counter.inc)
          })

          third.setValue(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 2 })
      expect(resultNested.current).toStrictEqual({ count: 9 })
      expect(spyNested).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("doesn't call single factory when changes only second and third", () => {
      const {
        second,
        third,
        spySingle,
        spyNested,
        resultSingle,
        resultNested,
      } = setup()

      spySingle.mockReset()
      spyNested.mockReset()

      act(() => {
        batch(() => {
          second.setValue(Counter.inc)
          third.setValue(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 1 })
      expect(resultNested.current).toStrictEqual({ count: 8 })
      expect(spySingle).not.toHaveBeenCalled()
      expect(spyNested).toHaveBeenCalled()
    })

    it("Impulse#setValue wraps the callback into batch", () => {
      const { second, third, impulse, spyNested, resultNested } = setup()

      spyNested.mockReset()

      act(() => {
        batch(() => {
          second.setValue(Counter.inc)
          third.setValue(Counter.inc)
        })
      })

      const spyCallsForBatch = spyNested.mock.calls.length

      spyNested.mockReset()

      act(() => {
        impulse.setValue((current) => {
          current.second.setValue(Counter.inc)
          current.third.setValue(Counter.inc)

          return current
        })
      })

      expect(spyNested).toHaveBeenCalledTimes(spyCallsForBatch)
      expect(resultNested.current).toStrictEqual({ count: 10 })
    })
  })
})
