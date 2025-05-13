import { act, renderHook } from "@testing-library/react"

import {
  type Compare,
  Impulse,
  useScoped,
  type Scope,
  type ReadableImpulse,
} from "../../src"
import { Counter, type WithSpy, type WithImpulse } from "../common"

describe("impulse shortcut", () => {
  it("allows to use Impulse", () => {
    const impulse = Impulse(1)

    const { result } = renderHook(() => useScoped(impulse))

    expect(result.current).toBe(1)
  })

  it("allows to use ReadonlyImpulse", () => {
    let count = 1
    const impulse = Impulse(() => count)

    const { result, rerender } = renderHook(() => useScoped(impulse))

    expect(result.current).toBe(1)
    count = 2
    expect(result.current).toBe(1)

    rerender()
    expect(result.current).toBe(1)
  })

  it("allows to use ReadableImpulse", () => {
    class Custom implements ReadableImpulse<number> {
      public constructor(public value: number) {}

      public getValue(): number {
        return this.value
      }
    }

    const impulse = new Custom(1)

    const { result, rerender } = renderHook(() => useScoped(impulse))

    expect(result.current).toBe(1)
    impulse.value = 2
    expect(result.current).toBe(1)

    rerender()
    expect(result.current).toBe(1)
  })

  it("does not allow to pass dependencies", () => {
    const impulse = Impulse(1)

    // @ts-expect-error - should not allow to pass dependencies
    const { result } = renderHook(() => useScoped(impulse, []))

    expect(result.current).toBe(1)
  })
})

describe("single factory", () => {
  const factory = (scope: Scope, { impulse }: WithImpulse) =>
    impulse.getValue(scope)

  describe.each([
    [
      "impulse shortcut",
      ({ impulse }: WithImpulse) => {
        return useScoped(impulse)
      },
    ],
    [
      "without deps",
      ({ impulse }: WithImpulse) => {
        return useScoped((scope) => factory(scope, { impulse }))
      },
    ],
    [
      "without comparator",
      ({ impulse }: WithImpulse) => {
        return useScoped((scope) => factory(scope, { impulse }), [impulse])
      },
    ],
    [
      "with inline comparator",
      ({ impulse }: WithImpulse) => {
        return useScoped((scope) => factory(scope, { impulse }), [impulse], {
          compare: (prev, next) => Counter.compare(prev, next),
        })
      },
    ],
    [
      "with memoized comparator",
      ({ impulse }: WithImpulse) => {
        return useScoped((scope) => factory(scope, { impulse }), [impulse], {
          compare: Counter.compare,
        })
      },
    ],
  ])("%s", (_, useCounter) => {
    it("watches the Impulse's changes", () => {
      const impulse = Impulse({ count: 1 })

      const { result } = renderHook(useCounter, {
        initialProps: { impulse },
      })

      expect(result.current).toStrictEqual({ count: 1 })

      act(() => {
        impulse.setValue(Counter.inc)
      })
      expect(result.current).toStrictEqual({ count: 2 })

      act(() => {
        impulse.setValue(({ count }) => ({ count: count * 2 }))
      })
      expect(result.current).toStrictEqual({ count: 4 })
    })

    describe("watches the replaced impulse changes", () => {
      const setup = () => {
        const impulse_1 = Impulse({ count: 1 })
        const impulse_2 = Impulse({ count: 10 })

        const { result, rerender } = renderHook(useCounter, {
          initialProps: { impulse: impulse_1 },
        })

        return { impulse_1, impulse_2, result, rerender }
      }

      it("initiates with correct result", () => {
        const { result } = setup()

        expect(result.current).toStrictEqual({ count: 1 })
      })

      it("replaces initial impulse_1 with impulse_2", () => {
        const { impulse_2, result, rerender } = setup()

        rerender({ impulse: impulse_2 })
        expect(result.current).toStrictEqual({ count: 10 })
      })

      it("stops watching impulse_1 changes after replacement with impulse_2", ({
        scope,
      }) => {
        const { impulse_1, impulse_2, result, rerender } = setup()
        expect(impulse_1).toHaveEmittersSize(1)

        rerender({ impulse: impulse_2 })
        expect(impulse_1).toHaveEmittersSize(0)

        act(() => {
          impulse_1.setValue(Counter.inc)
        })

        expect(impulse_1.getValue(scope)).toStrictEqual({ count: 2 })
        expect(result.current).toStrictEqual({ count: 10 })
        expect(impulse_1).toHaveEmittersSize(0)
      })

      it("starts watching impulse_2 changes after replacement of impulse_1", ({
        scope,
      }) => {
        const { impulse_1, impulse_2, result, rerender } = setup()
        expect(impulse_2).toHaveEmittersSize(0)

        rerender({ impulse: impulse_2 })
        expect(impulse_2).toHaveEmittersSize(1)

        act(() => {
          impulse_2.setValue(Counter.inc)
        })

        expect(impulse_1.getValue(scope)).toStrictEqual({ count: 1 })
        expect(result.current).toStrictEqual({ count: 11 })
        expect(impulse_2).toHaveEmittersSize(1)
      })

      it("replaces impulse_1 back", () => {
        const { impulse_1, impulse_2, result, rerender } = setup()

        rerender({ impulse: impulse_2 })
        rerender({ impulse: impulse_1 })

        expect(result.current).toStrictEqual({ count: 1 })
      })

      it("stops watching impulse_2 after replacement back impulse_1", () => {
        const { impulse_1, impulse_2, result, rerender } = setup()

        rerender({ impulse: impulse_2 })
        rerender({ impulse: impulse_1 })
        expect(impulse_1).toHaveEmittersSize(1)
        expect(impulse_2).toHaveEmittersSize(0)

        act(() => {
          impulse_2.setValue(Counter.inc)
        })

        expect(result.current).toStrictEqual({ count: 1 })
      })
    })
  })
})

describe("transform scoped Impulse's", () => {
  const toTuple = ({ count }: Counter): [boolean, boolean] => {
    return [count > 2, count < 5]
  }

  const compareTuple: Compare<[boolean, boolean]> = (
    [prevLeft, prevRight],
    [nextLeft, nextRight],
  ) => {
    return prevLeft === nextLeft && prevRight === nextRight
  }

  const factoryTuple = (scope: Scope, { impulse }: WithImpulse) => {
    return toTuple(impulse.getValue(scope))
  }

  it.each([
    [
      "inline comparator",
      ({ impulse }: WithImpulse) => {
        return useScoped(
          (scope) => factoryTuple(scope, { impulse }),
          [impulse],
          {
            compare: (prev, next, scope) => compareTuple(prev, next, scope),
          },
        )
      },
    ],
    [
      "memoized comparator",
      ({ impulse }: WithImpulse) => {
        return useScoped(
          (scope) => factoryTuple(scope, { impulse }),
          [impulse],
          {
            compare: compareTuple,
          },
        )
      },
    ],
  ])(
    "keeps the old value when it is comparably equal when %s",
    (_, useCounter) => {
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
        impulse.setValue(Counter.inc)
      })
      expect(result.current).toBe(prev)
      expect(result.current).toStrictEqual([false, true])

      // increments 2 -> 3
      prev = result.current
      act(() => {
        impulse.setValue({ count: 3 })
      })
      expect(result.current).not.toBe(prev)
      expect(result.current).toStrictEqual([true, true])

      // rerender
      rerender({ impulse })
      expect(result.current).toStrictEqual([true, true])

      // increments 3 -> 4
      prev = result.current
      act(() => {
        impulse.setValue({ count: 4 })
      })
      expect(result.current).toBe(prev)
      expect(result.current).toStrictEqual([true, true])

      // increments 4 -> 5
      prev = result.current
      act(() => {
        impulse.setValue(Counter.inc)
      })
      expect(result.current).not.toBe(prev)
      expect(result.current).toStrictEqual([true, false])
    },
  )

  it.each([
    [
      "without deps",
      ({ impulse }: WithImpulse) => {
        return useScoped((scope) => factoryTuple(scope, { impulse }))
      },
    ],
    [
      "without compare",
      ({ impulse }: WithImpulse) => {
        return useScoped((scope) => factoryTuple(scope, { impulse }), [impulse])
      },
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
      impulse.setValue(Counter.inc)
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([false, true])

    // increments 2 -> 3
    prev = result.current
    act(() => {
      impulse.setValue({ count: 3 })
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, true])

    // rerender
    rerender({ impulse })
    expect(result.current).toStrictEqual([true, true])

    // increments 3 -> 4
    prev = result.current
    act(() => {
      impulse.setValue({ count: 4 })
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, true])

    // increments 4 -> 5
    prev = result.current
    act(() => {
      impulse.setValue(Counter.inc)
    })
    expect(result.current).not.toBe(prev)
    expect(result.current).toStrictEqual([true, false])
  })

  describe("when Impulse's changes under factory are comparably equal with", () => {
    const factory = (scope: Scope, { impulse }: WithImpulse) =>
      impulse.getValue(scope)

    it.each([
      [
        "without deps",
        ({ impulse, spy }: WithImpulse & WithSpy) => {
          return useScoped((scope) => {
            spy()

            return factory(scope, { impulse })
          })
        },
      ],
      [
        "without comparator",
        ({ impulse, spy }: WithImpulse & WithSpy) => {
          return useScoped(
            (scope) => {
              spy()

              return factory(scope, { impulse })
            },
            [impulse, spy],
          )
        },
      ],
      [
        "with inline comparator",
        ({ impulse, spy }: WithImpulse & WithSpy) => {
          return useScoped(
            (scope) => {
              spy()

              return factory(scope, { impulse })
            },
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
            (scope) => {
              spy()

              return factory(scope, { impulse })
            },
            [impulse, spy],
            {
              compare: Counter.compare,
            },
          )
        },
      ],
    ])("should not trigger the factory %s", (_, useCounter) => {
      const impulse = Impulse({ count: 1 }, { compare: Counter.compare })
      const spy = vi.fn()

      renderHook(useCounter, {
        initialProps: { impulse, spy },
      })

      expect(spy).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      act(() => {
        impulse.setValue(Counter.clone)
      })

      expect(spy).not.toHaveBeenCalled()
    })
  })
})

describe("multiple Impulse#getValue(scope) calls", () => {
  const factorySingle = (
    scope: Scope,
    { impulse, spy }: WithImpulse & WithSpy,
  ) => {
    spy()

    return impulse.getValue(scope)
  }
  const factoryDouble = (
    scope: Scope,
    { impulse, spy }: WithImpulse & WithSpy,
  ) => {
    spy()

    return Counter.merge(impulse.getValue(scope), impulse.getValue(scope))
  }

  describe("triggering factory for multiple Impulse#getValue(scope) calls the same as for a single", () => {
    describe.each([
      [
        "without deps",
        ({ impulse, spy }: WithImpulse & WithSpy) => {
          return useScoped((scope) => factorySingle(scope, { impulse, spy }))
        },
        ({ impulse, spy }: WithImpulse & WithSpy) => {
          return useScoped((scope) => factoryDouble(scope, { impulse, spy }))
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
        ({ impulse, spy }: WithImpulse & WithSpy) => {
          return useScoped(
            (scope) => factoryDouble(scope, { impulse, spy }),
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
        ({ impulse, spy }: WithImpulse & WithSpy) => {
          return useScoped(
            (scope) => factoryDouble(scope, { impulse, spy }),
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
        ({ impulse, spy }: WithImpulse & WithSpy) => {
          return useScoped(
            (scope) => factoryDouble(scope, { impulse, spy }),
            [impulse, spy],
            { compare: Counter.compare },
          )
        },
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

        return { impulse, spySingle, spyDouble, resultSingle, resultDouble }
      }

      it("initiates with expected results", () => {
        const { spySingle, spyDouble, resultSingle, resultDouble } = setup()

        expect(resultSingle.current).toStrictEqual({ count: 1 })
        expect(resultDouble.current).toStrictEqual({ count: 2 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
      })

      it("increments %s", () => {
        const { impulse, spySingle, spyDouble, resultSingle, resultDouble } =
          setup()

        act(() => {
          impulse.setValue(Counter.inc)
        })

        expect(resultSingle.current).toStrictEqual({ count: 2 })
        expect(resultDouble.current).toStrictEqual({ count: 4 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
      })

      it("clones %s", () => {
        const { impulse, spySingle, spyDouble, resultSingle, resultDouble } =
          setup()

        act(() => {
          impulse.setValue(Counter.clone)
        })

        expect(resultSingle.current).toStrictEqual({ count: 1 })
        expect(resultDouble.current).toStrictEqual({ count: 2 })
        expect(spySingle).toHaveBeenCalledTimes(spyDouble.mock.calls.length)
      })
    })
  })
})
