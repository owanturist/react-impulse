import { act, renderHook } from "@testing-library/react"

import { type Equal, Impulse, type Monitor, type ReadableImpulse, useComputed } from "../../src"
import { Counter, type WithImpulse, type WithSpy } from "../common"

describe("impulse shortcut", () => {
  it("allows to use Impulse", () => {
    const impulse = Impulse(1)

    const { result } = renderHook(() => useComputed(impulse))

    expect(result.current).toBe(1)
  })

  it("allows to use ReadonlyImpulse", () => {
    let count = 1
    const impulse = Impulse(() => count)

    const { result, rerender } = renderHook(() => useComputed(impulse))

    expect(result.current).toBe(1)
    count = 2
    expect(result.current).toBe(1)

    rerender()
    expect(result.current).toBe(1)
  })

  it("allows to use ReadableImpulse", () => {
    class Custom implements ReadableImpulse<number> {
      public constructor(public value: number) {}

      public read(): number {
        return this.value
      }
    }

    const impulse = new Custom(1)

    const { result, rerender } = renderHook(() => useComputed(impulse))

    expect(result.current).toBe(1)
    impulse.value = 2
    expect(result.current).toBe(1)

    rerender()
    expect(result.current).toBe(1)
  })

  it("does not allow to pass dependencies", () => {
    const impulse = Impulse(1)

    // @ts-expect-error - should not allow to pass dependencies
    const { result } = renderHook(() => useComputed(impulse, []))

    expect(result.current).toBe(1)
  })
})

describe("single factory", () => {
  const factory = (monitor: Monitor, { impulse }: WithImpulse) => impulse.read(monitor)

  describe.each([
    ["impulse shortcut", ({ impulse }: WithImpulse) => useComputed(impulse)],
    [
      "without deps",
      ({ impulse }: WithImpulse) => useComputed((monitor) => factory(monitor, { impulse })),
    ],
    [
      "without comparator",
      ({ impulse }: WithImpulse) =>
        useComputed((monitor) => factory(monitor, { impulse }), [impulse]),
    ],
    [
      "with inline comparator",
      ({ impulse }: WithImpulse) =>
        useComputed((monitor) => factory(monitor, { impulse }), [impulse], {
          equals: (prev, next) => Counter.equals(prev, next),
        }),
    ],
    [
      "with memoized comparator",
      ({ impulse }: WithImpulse) =>
        useComputed((monitor) => factory(monitor, { impulse }), [impulse], {
          equals: Counter.equals,
        }),
    ],
  ])("%s", (_, useCounter) => {
    it("watches the Impulse's changes", () => {
      const impulse = Impulse({ count: 1 })

      const { result } = renderHook(useCounter, {
        initialProps: { impulse },
      })

      expect(result.current).toStrictEqual({ count: 1 })

      act(() => {
        impulse.update(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 2 })

      act(() => {
        impulse.update(({ count }) => ({ count: count * 2 }))
      })
      expect(result.current).toStrictEqual({ count: 4 })
    })

    it("unsubscribes when swapped", () => {
      const counter1 = Impulse({ count: 1 })
      const counter2 = Impulse({ count: 3 })

      const { rerender } = renderHook(useCounter, {
        initialProps: { impulse: counter1 },
      })

      expect(counter1).toHaveEmittersSize(1)
      expect(counter2).toHaveEmittersSize(0)

      rerender({ impulse: counter2 })
      expect(counter1).toHaveEmittersSize(0)
      expect(counter2).toHaveEmittersSize(1)

      act(() => {
        counter1.update({ count: 10 })
      })
      expect(counter1).toHaveEmittersSize(0)
      expect(counter2).toHaveEmittersSize(1)

      act(() => {
        counter2.update({ count: 5 })
      })

      expect(counter1).toHaveEmittersSize(0)
      expect(counter2).toHaveEmittersSize(1)
    })

    describe("watches the replaced impulse changes", () => {
      const setup = () => {
        const impulse1 = Impulse({ count: 1 })
        const impulse2 = Impulse({ count: 10 })

        const { result, rerender } = renderHook(useCounter, {
          initialProps: { impulse: impulse1 },
        })

        return { impulse1, impulse2, result, rerender }
      }

      it("initiates with correct result", () => {
        const { result } = setup()

        expect(result.current).toStrictEqual({ count: 1 })
      })

      it("replaces initial impulse1 with impulse2", () => {
        const { impulse2, result, rerender } = setup()

        rerender({ impulse: impulse2 })
        expect(result.current).toStrictEqual({ count: 10 })
      })

      it("stops watching impulse1 changes after replacement with impulse2", ({ monitor }) => {
        const { impulse1, impulse2, result, rerender } = setup()
        expect(impulse1).toHaveEmittersSize(1)

        rerender({ impulse: impulse2 })
        expect(impulse1).toHaveEmittersSize(0)

        act(() => {
          impulse1.update(Counter.inc)
        })

        expect(impulse1.read(monitor)).toStrictEqual({ count: 2 })
        expect(result.current).toStrictEqual({ count: 10 })
        expect(impulse1).toHaveEmittersSize(0)
      })

      it("starts watching impulse2 changes after replacement of impulse1", ({ monitor }) => {
        const { impulse1, impulse2, result, rerender } = setup()
        expect(impulse2).toHaveEmittersSize(0)

        rerender({ impulse: impulse2 })
        expect(impulse2).toHaveEmittersSize(1)

        act(() => {
          impulse2.update(Counter.inc)
        })

        expect(impulse1.read(monitor)).toStrictEqual({ count: 1 })
        expect(result.current).toStrictEqual({ count: 11 })
        expect(impulse2).toHaveEmittersSize(1)
      })

      it("replaces impulse1 back", () => {
        const { impulse1, impulse2, result, rerender } = setup()

        rerender({ impulse: impulse2 })
        rerender({ impulse: impulse1 })

        expect(result.current).toStrictEqual({ count: 1 })
      })

      it("stops watching impulse2 after replacement back impulse1", () => {
        const { impulse1, impulse2, result, rerender } = setup()

        rerender({ impulse: impulse2 })
        rerender({ impulse: impulse1 })
        expect(impulse1).toHaveEmittersSize(1)
        expect(impulse2).toHaveEmittersSize(0)

        act(() => {
          impulse2.update(Counter.inc)
        })

        expect(result.current).toStrictEqual({ count: 1 })
      })
    })
  })
})

describe("transform computed Impulse's", () => {
  const toTuple = ({ count }: Counter): [boolean, boolean] => [count > 2, count < 5]

  const isTupleEqual: Equal<[boolean, boolean]> = ([prevLeft, prevRight], [nextLeft, nextRight]) =>
    prevLeft === nextLeft && prevRight === nextRight

  const factoryTuple = (monitor: Monitor, { impulse }: WithImpulse) =>
    toTuple(impulse.read(monitor))

  it.each([
    [
      "inline comparator",
      ({ impulse }: WithImpulse) =>
        useComputed((monitor) => factoryTuple(monitor, { impulse }), [impulse], {
          equals: (prev, next) => isTupleEqual(prev, next),
        }),
    ],
    [
      "memoized comparator",
      ({ impulse }: WithImpulse) =>
        useComputed((monitor) => factoryTuple(monitor, { impulse }), [impulse], {
          equals: isTupleEqual,
        }),
    ],
  ])("keeps the old value when it is comparably equal when %s", (_, useCounter) => {
    const impulse = Impulse({ count: 1 })

    const { result, rerender } = renderHook(useCounter, {
      initialProps: { impulse },
    })

    let prev = result.current

    // produces initial result
    expect(result.current).toStrictEqual([false, true])

    // increments 1 -> 2
    prev = result.current
    act(() => {
      impulse.update(Counter.inc)
    })
    expect(result.current).toBe(prev)
    expect(result.current).toStrictEqual([false, true])

    // increments 2 -> 3
    prev = result.current
    act(() => {
      impulse.update({ count: 3 })
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, true])

    // rerender
    rerender({ impulse })
    expect(result.current).toStrictEqual([true, true])

    // increments 3 -> 4
    prev = result.current
    act(() => {
      impulse.update({ count: 4 })
    })
    expect(result.current).toBe(prev)
    expect(result.current).toStrictEqual([true, true])

    // increments 4 -> 5
    prev = result.current
    act(() => {
      impulse.update(Counter.inc)
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, false])
  })

  it.each([
    [
      "without deps",
      ({ impulse }: WithImpulse) => useComputed((monitor) => factoryTuple(monitor, { impulse })),
    ],
    [
      "without equals",
      ({ impulse }: WithImpulse) =>
        useComputed((monitor) => factoryTuple(monitor, { impulse }), [impulse]),
    ],
  ])("produces new value on each Impulse's update %s", (_, useCounter) => {
    const impulse = Impulse({ count: 1 })

    const { result, rerender } = renderHook(useCounter, {
      initialProps: { impulse },
    })

    let prev = result.current

    // produces initial result
    expect(result.current).toStrictEqual([false, true])

    // increments 1 -> 2
    prev = result.current
    act(() => {
      impulse.update(Counter.inc)
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([false, true])

    // increments 2 -> 3
    prev = result.current
    act(() => {
      impulse.update({ count: 3 })
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, true])

    // rerender
    rerender({ impulse })
    expect(result.current).toStrictEqual([true, true])

    // increments 3 -> 4
    prev = result.current
    act(() => {
      impulse.update({ count: 4 })
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, true])

    // increments 4 -> 5
    prev = result.current
    act(() => {
      impulse.update(Counter.inc)
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, false])
  })

  describe("when Impulse's changes under factory are comparably equal with", () => {
    const factory = (monitor: Monitor, { impulse }: WithImpulse) => impulse.read(monitor)

    it.each([
      [
        "without deps",
        ({ impulse, spy }: WithImpulse & WithSpy) =>
          useComputed((monitor) => {
            spy()

            return factory(monitor, { impulse })
          }),
      ],
      [
        "without comparator",
        ({ impulse, spy }: WithImpulse & WithSpy) =>
          useComputed(
            (monitor) => {
              spy()

              return factory(monitor, { impulse })
            },
            [impulse, spy],
          ),
      ],
      [
        "with inline comparator",
        ({ impulse, spy }: WithImpulse & WithSpy) =>
          useComputed(
            (monitor) => {
              spy()

              return factory(monitor, { impulse })
            },
            [impulse, spy],
            {
              equals: (prev, next) => Counter.equals(prev, next),
            },
          ),
      ],
      [
        "with memoized comparator",
        ({ impulse, spy }: WithImpulse & WithSpy) =>
          useComputed(
            (monitor) => {
              spy()

              return factory(monitor, { impulse })
            },
            [impulse, spy],
            {
              equals: Counter.equals,
            },
          ),
      ],
    ])("should not trigger the factory %s", (_, useCounter) => {
      const impulse = Impulse({ count: 1 }, { equals: Counter.equals })
      const spy = vi.fn()

      renderHook(useCounter, {
        initialProps: { impulse, spy },
      })

      expect(spy).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      act(() => {
        impulse.update(Counter.clone)
      })

      expect(spy).not.toHaveBeenCalled()
    })
  })
})

describe("multiple Impulse#read(monitor) calls", () => {
  const factorySingle = (monitor: Monitor, { impulse, spy }: WithImpulse & WithSpy) => {
    spy()

    return impulse.read(monitor)
  }
  const factoryDouble = (monitor: Monitor, { impulse, spy }: WithImpulse & WithSpy) => {
    spy()

    return Counter.merge(impulse.read(monitor), impulse.read(monitor))
  }

  describe("triggering factory for multiple Impulse#read(monitor) calls the same as for a single", () => {
    describe.each([
      [
        "without deps",
        ({ impulse, spy }: WithImpulse & WithSpy) =>
          useComputed((monitor) => factorySingle(monitor, { impulse, spy })),
        ({ impulse, spy }: WithImpulse & WithSpy) =>
          useComputed((monitor) => factoryDouble(monitor, { impulse, spy })),
      ],
      [
        "without comparator",
        ({ impulse, spy }: WithImpulse & WithSpy) =>
          useComputed((monitor) => factorySingle(monitor, { impulse, spy }), [impulse, spy]),
        ({ impulse, spy }: WithImpulse & WithSpy) =>
          useComputed((monitor) => factoryDouble(monitor, { impulse, spy }), [impulse, spy]),
      ],
      [
        "with inline comparator",
        ({ impulse, spy }: WithImpulse & WithSpy) =>
          useComputed((monitor) => factorySingle(monitor, { impulse, spy }), [impulse, spy], {
            equals: (prev, next) => Counter.equals(prev, next),
          }),
        ({ impulse, spy }: WithImpulse & WithSpy) =>
          useComputed((monitor) => factoryDouble(monitor, { impulse, spy }), [impulse, spy], {
            equals: (prev, next) => Counter.equals(prev, next),
          }),
      ],
      [
        "with memoized comparator",
        ({ impulse, spy }: WithImpulse & WithSpy) =>
          useComputed((monitor) => factorySingle(monitor, { impulse, spy }), [impulse, spy], {
            equals: Counter.equals,
          }),
        ({ impulse, spy }: WithImpulse & WithSpy) =>
          useComputed((monitor) => factoryDouble(monitor, { impulse, spy }), [impulse, spy], {
            equals: Counter.equals,
          }),
      ],
    ])("%s", (_, useSingleHook, useDoubleHook) => {
      const setup = () => {
        const spySingle = vi.fn()
        const spyDouble = vi.fn()
        const impulse = Impulse({ count: 1 })

        const { result: resultSingle } = renderHook(useSingleHook, {
          initialProps: { spy: spySingle, impulse },
        })
        const { result: resultDouble } = renderHook(useDoubleHook, {
          initialProps: { spy: spyDouble, impulse },
        })

        return {
          impulse,
          spySingle,
          spyDouble,
          resultSingle,
          resultDouble,
        }
      }

      it("initiates with expected results", () => {
        const { spySingle, spyDouble, resultSingle, resultDouble } = setup()

        expect(resultSingle.current).toStrictEqual({ count: 1 })
        expect(resultDouble.current).toStrictEqual({ count: 2 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
      })

      it("increments %s", () => {
        const { impulse, spySingle, spyDouble, resultSingle, resultDouble } = setup()

        act(() => {
          impulse.update(Counter.inc)
        })

        expect(resultSingle.current).toStrictEqual({ count: 2 })
        expect(resultDouble.current).toStrictEqual({ count: 4 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
      })

      it("clones %s", () => {
        const { impulse, spySingle, spyDouble, resultSingle, resultDouble } = setup()

        act(() => {
          impulse.update(Counter.clone)
        })

        expect(resultSingle.current).toStrictEqual({ count: 1 })
        expect(resultDouble.current).toStrictEqual({ count: 2 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
      })
    })
  })
})
