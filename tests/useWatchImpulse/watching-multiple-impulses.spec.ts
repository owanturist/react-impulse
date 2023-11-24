import { act, renderHook } from "@testing-library/react"

import { Impulse, useWatchImpulse, batch } from "../../src"
import {
  Counter,
  type WithImpulse,
  type WithFirst,
  type WithSecond,
  type WithThird,
  type WithSpy,
} from "../common"

describe("multiple watcher", () => {
  const watcher = ({ first, second }: WithFirst & WithSecond) => {
    return Counter.merge(first.getValue(), second.getValue())
  }

  describe.each([
    [
      "without deps",
      ({ first, second }: WithFirst & WithSecond) => {
        return useWatchImpulse(() => watcher({ first, second }))
      },
    ],
    [
      "without comparator",
      ({ first, second }: WithFirst & WithSecond) => {
        return useWatchImpulse(
          () => watcher({ first, second }),
          [first, second],
        )
      },
    ],
    [
      "with inline comparator",
      ({ first, second }: WithFirst & WithSecond) => {
        return useWatchImpulse(
          () => watcher({ first, second }),
          [first, second],
          {
            compare: (prev, next) => Counter.compare(prev, next),
          },
        )
      },
    ],
    [
      "with memoized comparator",
      ({ first, second }: WithFirst & WithSecond) => {
        return useWatchImpulse(
          () => watcher({ first, second }),
          [first, second],
          { compare: Counter.compare },
        )
      },
    ],
  ])("%s", (__, useHook) => {
    const setup = () => {
      const first = Impulse.of({ count: 2 })
      const second = Impulse.of({ count: 3 })
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
  })
})

describe("triggering watcher for multiple impulses vs single impulse", () => {
  const watcherSingle = ({ impulse, spy }: WithImpulse & WithSpy) => {
    spy()

    return impulse.getValue()
  }

  const watcherMultiple = ({
    spy,
    first,
    second,
    third,
  }: WithFirst & WithSecond & WithThird & WithSpy) => {
    spy()

    return Counter.merge(first.getValue(), second.getValue(), third.getValue())
  }

  describe.each([
    [
      "without deps",
      ({ impulse, spy }: WithImpulse & WithSpy) => {
        return useWatchImpulse(() => watcherSingle({ impulse, spy }))
      },
      ({
        first,
        second,
        third,
        spy,
      }: WithFirst & WithSecond & WithThird & WithSpy) => {
        return useWatchImpulse(() =>
          watcherMultiple({ first, second, third, spy }),
        )
      },
    ],
    [
      "without comparator",
      ({ impulse, spy }: WithImpulse & WithSpy) => {
        return useWatchImpulse(
          () => watcherSingle({ impulse, spy }),
          [impulse, spy],
        )
      },
      ({
        first,
        second,
        third,
        spy,
      }: WithFirst & WithSecond & WithThird & WithSpy) => {
        return useWatchImpulse(
          () => watcherMultiple({ first, second, third, spy }),
          [first, second, third, spy],
        )
      },
    ],
    [
      "with inline comparator",
      ({ impulse, spy }: WithImpulse & WithSpy) => {
        return useWatchImpulse(
          () => watcherSingle({ impulse, spy }),
          [impulse, spy],
          {
            compare: (prev, next) => Counter.compare(prev, next),
          },
        )
      },
      ({
        first,
        second,
        third,
        spy,
      }: WithFirst & WithSecond & WithThird & WithSpy) => {
        return useWatchImpulse(
          () => watcherMultiple({ first, second, third, spy }),
          [first, second, third, spy],
          {
            compare: (prev, next) => Counter.compare(prev, next),
          },
        )
      },
    ],
    [
      "with memoized comparator",
      ({ impulse, spy }: WithImpulse & WithSpy) => {
        return useWatchImpulse(
          () => watcherSingle({ impulse, spy }),
          [impulse, spy],
          { compare: Counter.compare },
        )
      },
      ({
        first,
        second,
        third,
        spy,
      }: WithFirst & WithSecond & WithThird & WithSpy) => {
        return useWatchImpulse(
          () => watcherMultiple({ first, second, third, spy }),
          [first, second, third, spy],
          { compare: Counter.compare },
        )
      },
    ],
  ])("%s", (__, useSingleHook, useMultipleHook) => {
    const setup = () => {
      const first = Impulse.of({ count: 1 })
      const second = Impulse.of({ count: 2 })
      const third = Impulse.of({ count: 3 })
      const spySingle = vi.fn()
      const spyMultiple = vi.fn()

      const { result: resultSingle } = renderHook(useSingleHook, {
        initialProps: { impulse: first, spy: spySingle },
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

    it("calls watchers the same amount when initiates", () => {
      const { spySingle, spyMultiple, resultSingle, resultMultiple } = setup()

      expect(resultSingle.current).toStrictEqual({ count: 1 })
      expect(resultMultiple.current).toStrictEqual({ count: 6 })
      expect(spyMultiple).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("calls watchers the same amount when only first and second", () => {
      const {
        first,
        second,
        spySingle,
        spyMultiple,
        resultSingle,
        resultMultiple,
      } = setup()

      act(() => {
        batch(() => {
          first.setValue(Counter.inc)
          second.setValue(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 2 })
      expect(resultMultiple.current).toStrictEqual({ count: 8 })
      expect(spyMultiple).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("calls watchers the same amount when only first and third", () => {
      const {
        first,
        third,
        spySingle,
        spyMultiple,
        resultSingle,
        resultMultiple,
      } = setup()

      act(() => {
        batch(() => {
          first.setValue(Counter.inc)
          third.setValue(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 2 })
      expect(resultMultiple.current).toStrictEqual({ count: 8 })
      expect(spyMultiple).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("calls watchers the same amount when first, second and third", () => {
      const {
        first,
        second,
        third,
        spySingle,
        spyMultiple,
        resultSingle,
        resultMultiple,
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
      expect(resultMultiple.current).toStrictEqual({ count: 9 })
      expect(spyMultiple).toHaveBeenCalledTimes(spySingle.mock.calls.length)
    })

    it("doesn't call single watcher when changes only second and third", () => {
      const {
        second,
        third,
        spySingle,
        spyMultiple,
        resultSingle,
        resultMultiple,
      } = setup()

      spySingle.mockReset()
      spyMultiple.mockReset()

      act(() => {
        batch(() => {
          second.setValue(Counter.inc)
          third.setValue(Counter.inc)
        })
      })
      expect(resultSingle.current).toStrictEqual({ count: 1 })
      expect(resultMultiple.current).toStrictEqual({ count: 8 })
      expect(spySingle).not.toHaveBeenCalled()
      expect(spyMultiple).toHaveBeenCalled()
    })
  })
})
