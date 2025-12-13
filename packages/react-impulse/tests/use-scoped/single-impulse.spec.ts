import { act, renderHook } from "@testing-library/react"

import { type Equal, type Monitor, type ReadableSignal, Signal, useComputed } from "../../src"
import { Counter, type WithSignal, type WithSpy } from "../common"

describe("Signal shortcut", () => {
  it("allows to use Signal", () => {
    const signal = Signal(1)

    const { result } = renderHook(() => useComputed(signal))

    expect(result.current).toBe(1)
  })

  it("allows to use ReadonlySignal", () => {
    let count = 1
    const signal = Signal(() => count)

    const { result, rerender } = renderHook(() => useComputed(signal))

    expect(result.current).toBe(1)
    count = 2
    expect(result.current).toBe(1)

    rerender()
    expect(result.current).toBe(1)
  })

  it("allows to use ReadableSignal", () => {
    class Custom implements ReadableSignal<number> {
      public constructor(public value: number) {}

      public read(): number {
        return this.value
      }
    }

    const signal = new Custom(1)

    const { result, rerender } = renderHook(() => useComputed(signal))

    expect(result.current).toBe(1)
    signal.value = 2
    expect(result.current).toBe(1)

    rerender()
    expect(result.current).toBe(1)
  })

  it("does not allow to pass dependencies", () => {
    const signal = Signal(1)

    // @ts-expect-error - should not allow to pass dependencies
    const { result } = renderHook(() => useComputed(signal, []))

    expect(result.current).toBe(1)
  })
})

describe("single factory", () => {
  const factory = (monitor: Monitor, { signal }: WithSignal) => signal.read(monitor)

  describe.each([
    ["signal shortcut", ({ signal }: WithSignal) => useComputed(signal)],
    [
      "without deps",
      ({ signal }: WithSignal) => useComputed((monitor) => factory(monitor, { signal })),
    ],
    [
      "without comparator",
      ({ signal }: WithSignal) => useComputed((monitor) => factory(monitor, { signal }), [signal]),
    ],
    [
      "with inline comparator",
      ({ signal }: WithSignal) =>
        useComputed((monitor) => factory(monitor, { signal }), [signal], {
          equals: (prev, next) => Counter.equals(prev, next),
        }),
    ],
    [
      "with memoized comparator",
      ({ signal }: WithSignal) =>
        useComputed((monitor) => factory(monitor, { signal }), [signal], {
          equals: Counter.equals,
        }),
    ],
  ])("%s", (_, useCounter) => {
    it("watches the Signal's changes", () => {
      const signal = Signal({ count: 1 })

      const { result } = renderHook(useCounter, {
        initialProps: { signal },
      })

      expect(result.current).toStrictEqual({ count: 1 })

      act(() => {
        signal.write(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 2 })

      act(() => {
        signal.write(({ count }) => ({ count: count * 2 }))
      })
      expect(result.current).toStrictEqual({ count: 4 })
    })

    it("unsubscribes when swapped", () => {
      const counter1 = Signal({ count: 1 })
      const counter2 = Signal({ count: 3 })

      const { rerender } = renderHook(useCounter, {
        initialProps: { signal: counter1 },
      })

      expect(counter1).toHaveEmittersSize(1)
      expect(counter2).toHaveEmittersSize(0)

      rerender({ signal: counter2 })
      expect(counter1).toHaveEmittersSize(0)
      expect(counter2).toHaveEmittersSize(1)

      act(() => {
        counter1.write({ count: 10 })
      })
      expect(counter1).toHaveEmittersSize(0)
      expect(counter2).toHaveEmittersSize(1)

      act(() => {
        counter2.write({ count: 5 })
      })

      expect(counter1).toHaveEmittersSize(0)
      expect(counter2).toHaveEmittersSize(1)
    })

    describe("watches the replaced signal changes", () => {
      const setup = () => {
        const signal1 = Signal({ count: 1 })
        const signal2 = Signal({ count: 10 })

        const { result, rerender } = renderHook(useCounter, {
          initialProps: { signal: signal1 },
        })

        return { signal1, signal2, result, rerender }
      }

      it("initiates with correct result", () => {
        const { result } = setup()

        expect(result.current).toStrictEqual({ count: 1 })
      })

      it("replaces initial signal1 with signal2", () => {
        const { signal2, result, rerender } = setup()

        rerender({ signal: signal2 })
        expect(result.current).toStrictEqual({ count: 10 })
      })

      it("stops watching signal1 changes after replacement with signal2", ({ monitor }) => {
        const { signal1, signal2, result, rerender } = setup()
        expect(signal1).toHaveEmittersSize(1)

        rerender({ signal: signal2 })
        expect(signal1).toHaveEmittersSize(0)

        act(() => {
          signal1.write(Counter.inc)
        })

        expect(signal1.read(monitor)).toStrictEqual({ count: 2 })
        expect(result.current).toStrictEqual({ count: 10 })
        expect(signal1).toHaveEmittersSize(0)
      })

      it("starts watching signal2 changes after replacement of signal1", ({ monitor }) => {
        const { signal1, signal2, result, rerender } = setup()
        expect(signal2).toHaveEmittersSize(0)

        rerender({ signal: signal2 })
        expect(signal2).toHaveEmittersSize(1)

        act(() => {
          signal2.write(Counter.inc)
        })

        expect(signal1.read(monitor)).toStrictEqual({ count: 1 })
        expect(result.current).toStrictEqual({ count: 11 })
        expect(signal2).toHaveEmittersSize(1)
      })

      it("replaces signal1 back", () => {
        const { signal1, signal2, result, rerender } = setup()

        rerender({ signal: signal2 })
        rerender({ signal: signal1 })

        expect(result.current).toStrictEqual({ count: 1 })
      })

      it("stops watching signal2 after replacement back signal1", () => {
        const { signal1, signal2, result, rerender } = setup()

        rerender({ signal: signal2 })
        rerender({ signal: signal1 })
        expect(signal1).toHaveEmittersSize(1)
        expect(signal2).toHaveEmittersSize(0)

        act(() => {
          signal2.write(Counter.inc)
        })

        expect(result.current).toStrictEqual({ count: 1 })
      })
    })
  })
})

describe("transform computed Signal's", () => {
  const toTuple = ({ count }: Counter): [boolean, boolean] => [count > 2, count < 5]

  const isTupleEqual: Equal<[boolean, boolean]> = ([prevLeft, prevRight], [nextLeft, nextRight]) =>
    prevLeft === nextLeft && prevRight === nextRight

  const factoryTuple = (monitor: Monitor, { signal }: WithSignal) => toTuple(signal.read(monitor))

  it.each([
    [
      "inline comparator",
      ({ signal }: WithSignal) =>
        useComputed((monitor) => factoryTuple(monitor, { signal }), [signal], {
          equals: (prev, next) => isTupleEqual(prev, next),
        }),
    ],
    [
      "memoized comparator",
      ({ signal }: WithSignal) =>
        useComputed((monitor) => factoryTuple(monitor, { signal }), [signal], {
          equals: isTupleEqual,
        }),
    ],
  ])("keeps the old value when it is comparably equal when %s", (_, useCounter) => {
    const signal = Signal({ count: 1 })

    const { result, rerender } = renderHook(useCounter, {
      initialProps: { signal },
    })

    let prev = result.current

    // produces initial result
    expect(result.current).toStrictEqual([false, true])

    // increments 1 -> 2
    prev = result.current
    act(() => {
      signal.write(Counter.inc)
    })
    expect(result.current).toBe(prev)
    expect(result.current).toStrictEqual([false, true])

    // increments 2 -> 3
    prev = result.current
    act(() => {
      signal.write({ count: 3 })
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, true])

    // rerender
    rerender({ signal })
    expect(result.current).toStrictEqual([true, true])

    // increments 3 -> 4
    prev = result.current
    act(() => {
      signal.write({ count: 4 })
    })
    expect(result.current).toBe(prev)
    expect(result.current).toStrictEqual([true, true])

    // increments 4 -> 5
    prev = result.current
    act(() => {
      signal.write(Counter.inc)
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, false])
  })

  it.each([
    [
      "without deps",
      ({ signal }: WithSignal) => useComputed((monitor) => factoryTuple(monitor, { signal })),
    ],
    [
      "without equals",
      ({ signal }: WithSignal) =>
        useComputed((monitor) => factoryTuple(monitor, { signal }), [signal]),
    ],
  ])("produces new value on each Signal's write %s", (_, useCounter) => {
    const signal = Signal({ count: 1 })

    const { result, rerender } = renderHook(useCounter, {
      initialProps: { signal },
    })

    let prev = result.current

    // produces initial result
    expect(result.current).toStrictEqual([false, true])

    // increments 1 -> 2
    prev = result.current
    act(() => {
      signal.write(Counter.inc)
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([false, true])

    // increments 2 -> 3
    prev = result.current
    act(() => {
      signal.write({ count: 3 })
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, true])

    // rerender
    rerender({ signal })
    expect(result.current).toStrictEqual([true, true])

    // increments 3 -> 4
    prev = result.current
    act(() => {
      signal.write({ count: 4 })
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, true])

    // increments 4 -> 5
    prev = result.current
    act(() => {
      signal.write(Counter.inc)
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, false])
  })

  describe("when Signal's changes under factory are comparably equal with", () => {
    const factory = (monitor: Monitor, { signal }: WithSignal) => signal.read(monitor)

    it.each([
      [
        "without deps",
        ({ signal, spy }: WithSignal & WithSpy) =>
          useComputed((monitor) => {
            spy()

            return factory(monitor, { signal })
          }),
      ],
      [
        "without comparator",
        ({ signal, spy }: WithSignal & WithSpy) =>
          useComputed(
            (monitor) => {
              spy()

              return factory(monitor, { signal })
            },
            [signal, spy],
          ),
      ],
      [
        "with inline comparator",
        ({ signal, spy }: WithSignal & WithSpy) =>
          useComputed(
            (monitor) => {
              spy()

              return factory(monitor, { signal })
            },
            [signal, spy],
            {
              equals: (prev, next) => Counter.equals(prev, next),
            },
          ),
      ],
      [
        "with memoized comparator",
        ({ signal, spy }: WithSignal & WithSpy) =>
          useComputed(
            (monitor) => {
              spy()

              return factory(monitor, { signal })
            },
            [signal, spy],
            {
              equals: Counter.equals,
            },
          ),
      ],
    ])("should not trigger the factory %s", (_, useCounter) => {
      const signal = Signal({ count: 1 }, { equals: Counter.equals })
      const spy = vi.fn()

      renderHook(useCounter, {
        initialProps: { signal, spy },
      })

      expect(spy).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      act(() => {
        signal.write(Counter.clone)
      })

      expect(spy).not.toHaveBeenCalled()
    })
  })
})

describe("multiple Signal#read(monitor) calls", () => {
  const factorySingle = (monitor: Monitor, { signal, spy }: WithSignal & WithSpy) => {
    spy()

    return signal.read(monitor)
  }
  const factoryDouble = (monitor: Monitor, { signal, spy }: WithSignal & WithSpy) => {
    spy()

    return Counter.merge(signal.read(monitor), signal.read(monitor))
  }

  describe("triggering factory for multiple Signal#read(monitor) calls the same as for a single", () => {
    describe.each([
      [
        "without deps",
        ({ signal, spy }: WithSignal & WithSpy) =>
          useComputed((monitor) => factorySingle(monitor, { signal, spy })),
        ({ signal, spy }: WithSignal & WithSpy) =>
          useComputed((monitor) => factoryDouble(monitor, { signal, spy })),
      ],
      [
        "without comparator",
        ({ signal, spy }: WithSignal & WithSpy) =>
          useComputed((monitor) => factorySingle(monitor, { signal, spy }), [signal, spy]),
        ({ signal, spy }: WithSignal & WithSpy) =>
          useComputed((monitor) => factoryDouble(monitor, { signal, spy }), [signal, spy]),
      ],
      [
        "with inline comparator",
        ({ signal, spy }: WithSignal & WithSpy) =>
          useComputed((monitor) => factorySingle(monitor, { signal, spy }), [signal, spy], {
            equals: (prev, next) => Counter.equals(prev, next),
          }),
        ({ signal, spy }: WithSignal & WithSpy) =>
          useComputed((monitor) => factoryDouble(monitor, { signal, spy }), [signal, spy], {
            equals: (prev, next) => Counter.equals(prev, next),
          }),
      ],
      [
        "with memoized comparator",
        ({ signal, spy }: WithSignal & WithSpy) =>
          useComputed((monitor) => factorySingle(monitor, { signal, spy }), [signal, spy], {
            equals: Counter.equals,
          }),
        ({ signal, spy }: WithSignal & WithSpy) =>
          useComputed((monitor) => factoryDouble(monitor, { signal, spy }), [signal, spy], {
            equals: Counter.equals,
          }),
      ],
    ])("%s", (_, useSingleHook, useDoubleHook) => {
      const setup = () => {
        const spySingle = vi.fn()
        const spyDouble = vi.fn()
        const signal = Signal({ count: 1 })

        const { result: resultSingle } = renderHook(useSingleHook, {
          initialProps: { spy: spySingle, signal },
        })
        const { result: resultDouble } = renderHook(useDoubleHook, {
          initialProps: { spy: spyDouble, signal },
        })

        return {
          signal,
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
        const { signal, spySingle, spyDouble, resultSingle, resultDouble } = setup()

        act(() => {
          signal.write(Counter.inc)
        })

        expect(resultSingle.current).toStrictEqual({ count: 2 })
        expect(resultDouble.current).toStrictEqual({ count: 4 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
      })

      it("clones %s", () => {
        const { signal, spySingle, spyDouble, resultSingle, resultDouble } = setup()

        act(() => {
          signal.write(Counter.clone)
        })

        expect(resultSingle.current).toStrictEqual({ count: 1 })
        expect(resultDouble.current).toStrictEqual({ count: 2 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
      })
    })
  })
})
