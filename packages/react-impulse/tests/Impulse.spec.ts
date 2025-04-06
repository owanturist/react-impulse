import { act, renderHook } from "@testing-library/react"

import {
  type ReadonlyImpulse,
  type ImpulseOptions,
  Impulse,
  subscribe,
  type Scope,
  useScoped,
  type ImpulseGetter,
  type ImpulseSetter,
} from "../src"

import { Counter } from "./common"

const isString = (value: unknown): value is string => typeof value === "string"

describe("Impulse.of()", () => {
  it("creates an Impulse of undefined | T type", () => {
    const impulse = Impulse.of<string>()

    expectTypeOf(impulse).toEqualTypeOf<Impulse<string | undefined>>()
  })

  it("should create an impulse with undefined initial value", ({ scope }) => {
    const impulse = Impulse.of<number>()

    expect(impulse.getValue(scope)).toBeUndefined()
  })

  it("updates the impulse with a new value", ({ scope }) => {
    const impulse = Impulse.of<number>()

    impulse.setValue(1)

    expect(impulse.getValue(scope)).toBe(1)
  })

  it("updates the impulse with a undefined", ({ scope }) => {
    const impulse = Impulse.of<number>()

    impulse.setValue(1)
    impulse.setValue(undefined)

    expect(impulse.getValue(scope)).toBeUndefined()
  })
})

describe("Impulse.of(value, options?)", () => {
  it("does not call compare on init", () => {
    Impulse.of({ count: 0 }, { compare: Counter.compare })

    expect(Counter.compare).not.toHaveBeenCalled()
  })

  it("assigns Object.is as default compare", () => {
    const impulse = Impulse.of({ count: 0 })

    impulse.setValue({ count: 1 })
    expect(Object.is).toHaveBeenCalledExactlyOnceWith(
      { count: 0 },
      { count: 1 },
    )
  })

  it("assigns Object.is by `null` as compare", () => {
    const impulse = Impulse.of({ count: 0 }, { compare: null })

    impulse.setValue({ count: 1 })
    expect(Object.is).toHaveBeenCalledExactlyOnceWith(
      { count: 0 },
      { count: 1 },
    )
  })

  it("assigns custom function as compare", ({ scope }) => {
    const impulse = Impulse.of({ count: 0 }, { compare: Counter.compare })

    impulse.setValue({ count: 1 })
    expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
      { count: 0 },
      { count: 1 },
      scope,
    )
  })

  it("carries the function value wrapped in an object", ({ scope }) => {
    const impulse = Impulse.of({ fn: (input: number) => input })

    expectTypeOf(impulse).toEqualTypeOf<
      Impulse<{
        fn: (input: number) => number
      }>
    >()
    expectTypeOf(impulse.getValue(scope)).toEqualTypeOf<{
      fn: (input: number) => number
    }>()
    expect(impulse.getValue(scope).fn(42)).toBe(42)
  })
})

describe("Impulse.of(getter, options?)", () => {
  it("creates a ReadonlyImpulse", () => {
    const impulse = Impulse.of(() => 0)

    // @ts-expect-error should be ReadonlyImpulse only
    expectTypeOf(impulse).toEqualTypeOf<Impulse<number>>()
    expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<number>>()
  })

  it("reads the value from the source", ({ scope }) => {
    const initial = { count: 0 }
    const source = Impulse.of(initial)
    const impulse = Impulse.of((scope) => source.getValue(scope))

    expect(impulse.getValue(scope)).toBe(initial)
    expect(impulse.getValue(scope)).toStrictEqual({ count: 0 })

    const next = { count: 1 }
    source.setValue(next)
    expect(impulse.getValue(scope)).toBe(next)
    expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
  })

  it("subscribes to Impulse source", ({ scope }) => {
    const source = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const impulse = Impulse.of((scope) => source.getValue(scope))
    const spy = vi.fn()

    expect(source).toHaveEmittersSize(0)

    const unsubscribe = subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    expect(source).toHaveEmittersSize(1)
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
    expect(spy).not.toHaveBeenCalled()

    expect(source).toHaveEmittersSize(1)
    unsubscribe()
    expect(source).toHaveEmittersSize(0)
  })

  it("cannot subscribe to none-Impulse source", () => {
    let variable = 0
    const impulse = Impulse.of(() => variable)
    const spy = vi.fn()

    subscribe((scope) => {
      spy(impulse.getValue(scope))
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(0)
    vi.clearAllMocks()

    variable = 1
    expect(spy).not.toHaveBeenCalled()
  })

  it("does not call compare on init", () => {
    const source = Impulse.of({ count: 0 })
    Impulse.of((scope) => source.getValue(scope), {
      compare: Counter.compare,
    })

    expect(Counter.compare).not.toHaveBeenCalled()
  })

  it("does not call compare on first getValue", ({ scope }) => {
    const source = Impulse.of({ count: 0 })
    const impulse = Impulse.of((scope) => source.getValue(scope), {
      compare: Counter.compare,
    })

    impulse.getValue(scope)
    expect(Counter.compare).not.toHaveBeenCalled()
  })

  it("calls compare on subsequent calls", ({ scope }) => {
    const source = Impulse.of({ count: 0 })
    const impulse = Impulse.of((scope) => source.getValue(scope))

    impulse.getValue(scope)
    impulse.getValue(scope)
    impulse.getValue(scope)
    impulse.getValue(scope)
    impulse.getValue(scope)

    expect(Object.is).toHaveBeenCalledTimes(4)
  })

  it("assigns Object.is as default compare", ({ scope }) => {
    const source = Impulse.of(0)
    const impulse = Impulse.of((scope) => ({
      count: source.getValue(scope),
    }))

    const value_1 = impulse.getValue(scope)
    const value_2 = impulse.getValue(scope)
    expect(Object.is).toHaveBeenCalledExactlyOnceWith(
      { count: 0 },
      { count: 0 },
    )
    expect(value_1).not.toBe(value_2)
    expect(value_1).toStrictEqual(value_2)
  })

  it("assigns Object.is by `null` as compare", ({ scope }) => {
    const source = Impulse.of(0)
    const impulse = Impulse.of((scope) => ({ count: source.getValue(scope) }), {
      compare: null,
    })

    const value_1 = impulse.getValue(scope)
    const value_2 = impulse.getValue(scope)
    expect(Object.is).toHaveBeenCalledExactlyOnceWith(
      { count: 0 },
      { count: 0 },
    )
    expect(value_1).not.toBe(value_2)
    expect(value_1).toStrictEqual(value_2)
  })

  it("assigns custom function as compare", ({ scope }) => {
    const source = Impulse.of(0)
    const impulse = Impulse.of((scope) => ({ count: source.getValue(scope) }), {
      compare: Counter.compare,
    })

    const value_1 = impulse.getValue(scope)
    const value_2 = impulse.getValue(scope)
    expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
      { count: 0 },
      { count: 0 },
      scope,
    )
    expect(value_1).toBe(value_2)
    expect(value_1).toStrictEqual(value_2)
  })
})

describe("Impulse.of(getter, setter, options?)", () => {
  it("creates an Impulse", () => {
    let variable = 0
    const impulse = Impulse.of(
      () => variable,
      (value) => {
        variable = value
      },
    )

    expectTypeOf(impulse).toEqualTypeOf<Impulse<number>>()
    expectTypeOf(impulse).toMatchTypeOf<ReadonlyImpulse<number>>()
  })

  it("allows source as a Impulse", ({ scope }) => {
    const source = Impulse.of(0)
    const impulse = Impulse.of(source, () => {
      // noop
    })

    expect(impulse.getValue(scope)).toBe(0)
  })

  it("allows source as a ReadonlyImpulse", ({ scope }) => {
    const source = Impulse.of(() => 0)
    const impulse = Impulse.of(source, () => {
      // noop
    })

    expect(impulse.getValue(scope)).toBe(0)
  })

  it("allows source as a ImpulseGetter", ({ scope }) => {
    class Custom implements ImpulseGetter<number> {
      public constructor(public value: number) {}

      public getValue(): number {
        return this.value
      }
    }

    const source = new Custom(0)
    const impulse = Impulse.of(source, () => {
      // noop
    })

    expect(impulse.getValue(scope)).toBe(0)
    source.value = 1
    expect(impulse.getValue(scope)).toBe(1)
  })

  it("does not allow setter as a ReadonlyImpulse", ({ scope }) => {
    const destination = Impulse.of(() => 0)
    // @ts-expect-error should be Impulse only
    const impulse = Impulse.of(() => 2, [], destination)

    expect(impulse.getValue(scope)).toBe(2)
  })

  it("subscribes to Impulse source and back", () => {
    const source = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const impulse = Impulse.of(
      (scope) => source.getValue(scope),
      (counter) => source.setValue(counter),
    )
    const spyOnImpulse = vi.fn()
    const spyOnSource = vi.fn()

    subscribe((scope) => {
      spyOnImpulse(impulse.getValue(scope))
    })
    subscribe((scope) => {
      spyOnSource(source.getValue(scope))
    })

    expect(spyOnImpulse).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(spyOnImpulse).toHaveBeenCalledExactlyOnceWith({ count: 1 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(spyOnImpulse).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.setValue({ count: 1 })
    expect(spyOnSource).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.setValue({ count: 2 })
    expect(spyOnSource).toHaveBeenCalledExactlyOnceWith({ count: 2 })
  })

  it("subscribes to ImpulseGetter/ImpulseSetter and back", () => {
    class Custom
      implements
        ImpulseGetter<{ count: number }>,
        ImpulseSetter<{ count: number }>
    {
      private readonly counter = Impulse.of(0)

      public getValue(scope: Scope): { count: number } {
        return { count: this.counter.getValue(scope) }
      }

      public setValue(value: { count: number }): void {
        this.counter.setValue(value.count)
      }
    }

    const source = new Custom()
    const impulse = Impulse.of(
      (scope) => source.getValue(scope),
      (counter) => source.setValue(counter),
    )
    const spyOnImpulse = vi.fn()
    const spyOnSource = vi.fn()

    subscribe((scope) => {
      spyOnImpulse(impulse.getValue(scope))
    })
    subscribe((scope) => {
      spyOnSource(source.getValue(scope))
    })

    expect(spyOnImpulse).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(spyOnImpulse).toHaveBeenCalledExactlyOnceWith({ count: 1 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(spyOnImpulse).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.setValue({ count: 1 })
    expect(spyOnSource).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.setValue({ count: 2 })
    expect(spyOnSource).toHaveBeenCalledExactlyOnceWith({ count: 2 })
  })

  it("assigns custom function as compare", ({ scope }) => {
    const source = Impulse.of({ count: 0 })
    const impulse = Impulse.of(
      (scope) => source.getValue(scope),
      (counter) => source.setValue(counter),
      {
        compare: Counter.compare,
      },
    )

    impulse.getValue(scope)
    impulse.getValue(scope)
    expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
      { count: 0 },
      { count: 0 },
      scope,
    )
  })

  it("batches setter", () => {
    const impulse_1 = Impulse.of(1)
    const impulse_2 = Impulse.of(2)
    const impulse_3 = Impulse.of(3)
    const derived = Impulse.of(
      (scope) => {
        return (
          impulse_1.getValue(scope) +
          impulse_2.getValue(scope) +
          impulse_3.getValue(scope)
        )
      },
      (x) => {
        impulse_1.setValue(x)
        impulse_2.setValue(x)
        impulse_3.setValue(x)
      },
    )
    const spy = vi.fn()

    const { result } = renderHook(() => {
      return useScoped((scope) => {
        spy()

        return derived.getValue(scope)
      }, [])
    })

    expect(result.current).toBe(6)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      derived.setValue(4)
    })

    expect(result.current).toBe(12)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      derived.setValue(4)
    })

    expect(result.current).toBe(12)
    expect(spy).not.toHaveBeenCalled()
  })
})

describe("Impulse.isImpulse(input)", () => {
  const known_check = (input: number | Impulse<number>) => {
    if (Impulse.isImpulse(input)) {
      expectTypeOf(input).toEqualTypeOf<Impulse<number>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<number>()

    return false
  }

  const readonly_check = (input: number | ReadonlyImpulse<number>) => {
    if (Impulse.isImpulse(input)) {
      expectTypeOf(input).toEqualTypeOf<ReadonlyImpulse<number>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<number>()

    return false
  }

  const unknown_check = (input: unknown) => {
    if (Impulse.isImpulse(input)) {
      expectTypeOf(input).toEqualTypeOf<Impulse<unknown>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<unknown>()

    return false
  }

  it("returns true for Impulse", () => {
    const impulse = Impulse.of(0)
    const readonly = Impulse.of(() => 1)

    expect(known_check(impulse)).toBe(true)
    // @ts-expect-error should be Impulse<number>
    expect(known_check(readonly)).toBe(true)
    expect(readonly_check(impulse)).toBe(true)
    expect(readonly_check(readonly)).toBe(true)
    expect(unknown_check(impulse)).toBe(true)
    expect(unknown_check(readonly)).toBe(true)
  })

  it.each([
    ["number", 1],
    ["boolean", false],
    ["null", null],
    ["undefined", undefined],
    ["array", [1, 2, 3]],
    ["object", { count: 0 }],
  ])("returns false for %s", (_, value: unknown) => {
    // @ts-expect-error should be Impulse<number>
    expect(known_check(value)).toBe(false)
    expect(unknown_check(value)).toBe(false)
  })
})

describe("Impulse.isImpulse(scope, check, value)", () => {
  const known_check = (scope: Scope, impulse: string | Impulse<string>) => {
    if (Impulse.isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<string>()

    return false
  }

  const union_check = (
    scope: Scope,
    impulse: Impulse<string> | Impulse<number>,
  ) => {
    if (Impulse.isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<Impulse<number>>()

    return false
  }

  const union_value_check = (
    scope: Scope,
    impulse: Impulse<number | string>,
  ) => {
    if (Impulse.isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<number | string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<never>()

    return false
  }

  const readonly_check = (
    scope: Scope,
    impulse: string | ReadonlyImpulse<string>,
  ) => {
    if (Impulse.isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<string>()

    return false
  }

  const unknown_check = (scope: Scope, impulse: unknown) => {
    if (Impulse.isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<unknown>()

    return false
  }

  it("returns true for Impulse with success check", ({ scope }) => {
    const impulse = Impulse.of("")
    const readonly = Impulse.of(() => "")

    expect(known_check(scope, impulse)).toBe(true)
    expect(union_check(scope, impulse)).toBe(true)
    expect(union_value_check(scope, Impulse.of<string | number>(""))).toBe(true)
    // @ts-expect-error should be Impulse<string>
    expect(known_check(scope, readonly)).toBe(true)
    expect(readonly_check(scope, impulse)).toBe(true)
    expect(readonly_check(scope, readonly)).toBe(true)
    expect(unknown_check(scope, impulse)).toBe(true)
    expect(unknown_check(scope, readonly)).toBe(true)
  })

  it("returns false for Impulse with failed check", ({ scope }) => {
    const impulse = Impulse.of(0)

    // @ts-expect-error should be Impulse<string>
    expect(known_check(scope, impulse)).toBe(false)
    expect(unknown_check(scope, impulse)).toBe(false)
  })

  describe.each([
    ["number", 1],
    ["boolean", false],
    ["null", null],
    ["undefined", undefined],
    ["array", [1, 2, 3]],
    ["object", { count: 0 }],
  ])("when input is %s", (_, value) => {
    it("returns false", ({ scope }) => {
      // @ts-expect-error should be Impulse<string>
      expect(known_check(scope, value)).toBe(false)
      expect(unknown_check(scope, value)).toBe(false)
    })
  })
})

function setupImpulse<T>(initialValue: T, options?: ImpulseOptions<T>) {
  const impulse = Impulse.of(initialValue, options)

  return { impulse }
}

function setupDerivedImpulseFromGlobalVariable<T>(
  initialValue: T,
  options?: ImpulseOptions<T>,
) {
  let variable = initialValue

  const impulse = Impulse.of(
    () => variable,
    (value) => {
      variable = value
    },
    options,
  )

  return {
    impulse,
    getValue: () => variable,
    setValue: (value: T) => {
      variable = value
    },
  }
}

function setupDerivedImpulseFromImpulse({
  getterShortcut,
  setterShortcut,
}: {
  getterShortcut: boolean
  setterShortcut: boolean
}) {
  return <T>(initialValue: T, options?: ImpulseOptions<T>) => {
    const source = Impulse.of(initialValue)
    const impulse = Impulse.of(
      getterShortcut ? source : (scope) => source.getValue(scope),
      setterShortcut ? source : (value) => source.setValue(value),
      options,
    )

    return {
      impulse,
      getValue: (scope: Scope) => source.getValue(scope),
      setValue: (value: T) => {
        source.setValue(value)
      },
    }
  }
}

describe.each([
  ["DirectImpulse", setupImpulse],
  [
    "Derived Impulse from a global variable",
    setupDerivedImpulseFromGlobalVariable,
  ],
  [
    "Derived Impulse from an Impulse",
    setupDerivedImpulseFromImpulse({
      getterShortcut: false,
      setterShortcut: false,
    }),
  ],
  [
    "Derived Impulse from an Impulse with getter shortcut",
    setupDerivedImpulseFromImpulse({
      getterShortcut: true,
      setterShortcut: false,
    }),
  ],
  [
    "Derived Impulse from an Impulse with setter shortcut",
    setupDerivedImpulseFromImpulse({
      getterShortcut: false,
      setterShortcut: true,
    }),
  ],
  [
    "Derived Impulse from an Impulse with both getter and setter shortcuts",
    setupDerivedImpulseFromImpulse({
      getterShortcut: true,
      setterShortcut: true,
    }),
  ],
])("Impulse.of() from %s", (_, setup) => {
  describe("Impulse#setValue(value)", () => {
    const { impulse } = setup({ count: 0 })

    it("updates value", ({ scope }) => {
      const next = { count: 1 }
      impulse.setValue(next)
      expect(impulse.getValue(scope)).toBe(next)
    })

    it("updates with the same value", ({ scope }) => {
      const next = { count: 1 }
      impulse.setValue(next)
      expect(impulse.getValue(scope)).toBe(next)
    })

    it("updates with equal value", ({ scope }) => {
      const prev = impulse.getValue(scope)
      impulse.setValue(prev)
      expect(impulse.getValue(scope)).toBe(prev)
    })
  })

  describe("Impulse#setValue(transform)", () => {
    it("updates value", ({ scope }) => {
      const { impulse } = setup({ count: 0 })

      impulse.setValue(Counter.inc)
      expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
    })

    it("keeps the value", ({ scope }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.setValue((counter) => counter)
      expect(impulse.getValue(scope)).toBe(initial)
    })

    it("updates with the same value", ({ scope }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.setValue(Counter.clone)
      expect(impulse.getValue(scope)).not.toBe(initial)
      expect(impulse.getValue(scope)).toStrictEqual(initial)
    })

    it("keeps the value if it is equal", ({ scope }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial, { compare: Counter.compare })

      impulse.setValue(Counter.clone)
      expect(impulse.getValue(scope)).toBe(initial)
      expect(impulse.getValue(scope)).toStrictEqual(initial)
    })

    it("updates with the equal value", ({ scope }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.setValue(() => initial)
      expect(impulse.getValue(scope)).toBe(initial)
    })
  })

  describe("Impulse#clone()", () => {
    it("creates new Impulse", ({ scope }) => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone()

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue(scope)).toBe(impulse_2.getValue(scope))
    })

    it("does not update source value when clone updates", ({ scope }) => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone()

      impulse_2.setValue({ count: 1 })

      expect(impulse_1.getValue(scope)).toStrictEqual({ count: 0 })
      expect(impulse_2.getValue(scope)).toStrictEqual({ count: 1 })
    })

    it("does not update clone value when source updates", ({ scope }) => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone()

      impulse_1.setValue({ count: 1 })

      expect(impulse_1.getValue(scope)).toStrictEqual({ count: 1 })
      expect(impulse_2.getValue(scope)).toStrictEqual({ count: 0 })
    })

    it("transfers comparator from source Impulse", () => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone()

      expect(Object.is).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Object.is).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
      )
    })

    it("transfers custom comparator from source Impulse", ({ scope }) => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone()

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
        scope,
      )
    })
  })

  describe("Impulse#clone(options)", () => {
    it("inherits custom comparator by empty options", ({ scope }) => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone({})

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
        scope,
      )
    })

    it("inherits custom comparator by options.compare: undefined", ({
      scope,
    }) => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone({ compare: undefined })

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
        scope,
      )
    })

    it("overrides custom comparator as Object.is by options.compare: null", () => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone({ compare: null })

      expect(Object.is).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Object.is).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
      )
    })

    it("overrides comparator by custom options.compare", ({ scope }) => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone({ compare: Counter.compare })

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
        scope,
      )
    })
  })

  describe("Impulse#clone(transform)", () => {
    it("creates new Impulse", ({ scope }) => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone(Counter.clone)

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue(scope)).not.toBe(impulse_2.getValue(scope))
      expect(impulse_1.getValue(scope)).toStrictEqual(impulse_2.getValue(scope))
    })

    it("keeps comparator from source", ({ scope }) => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone(Counter.clone)

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
        scope,
      )
    })

    it("creates new nested Impulse with clone(transform)", ({ scope }) => {
      const { impulse: impulse_1 } = setup({
        count: setup(0).impulse,
        name: setup("John").impulse,
      })
      const impulse_2 = impulse_1.clone(({ count, name }) => ({
        count: count.clone(),
        name: name.clone(),
      }))

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue(scope)).not.toBe(impulse_2.getValue(scope))
      expect(impulse_1.getValue(scope).count).not.toBe(
        impulse_2.getValue(scope).count,
      )
      expect(impulse_1.getValue(scope).name).not.toBe(
        impulse_2.getValue(scope).name,
      )
      expect({
        count: impulse_1.getValue(scope).count.getValue(scope),
        name: impulse_1.getValue(scope).name.getValue(scope),
      }).toStrictEqual({
        count: impulse_2.getValue(scope).count.getValue(scope),
        name: impulse_2.getValue(scope).name.getValue(scope),
      })

      // the nested impulses are independent
      impulse_1.getValue(scope).count.setValue(1)
      expect(impulse_1.getValue(scope).count.getValue(scope)).toBe(1)
      expect(impulse_2.getValue(scope).count.getValue(scope)).toBe(0)

      impulse_1.getValue(scope).name.setValue("Doe")
      expect(impulse_1.getValue(scope).name.getValue(scope)).toBe("Doe")
      expect(impulse_2.getValue(scope).name.getValue(scope)).toBe("John")
    })

    it("creates shallow nested Impulse with clone()", ({ scope }) => {
      const { impulse: impulse_1 } = setup({
        count: setup(0).impulse,
        name: setup("John").impulse,
      })
      const impulse_2 = impulse_1.clone()

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue(scope)).toBe(impulse_2.getValue(scope))
      expect(impulse_1.getValue(scope).count).toBe(
        impulse_2.getValue(scope).count,
      )
      expect(impulse_1.getValue(scope).name).toBe(
        impulse_2.getValue(scope).name,
      )
      expect({
        count: impulse_1.getValue(scope).count.getValue(scope),
        name: impulse_1.getValue(scope).name.getValue(scope),
      }).toStrictEqual({
        count: impulse_1.getValue(scope).count.getValue(scope),
        name: impulse_1.getValue(scope).name.getValue(scope),
      })

      // the nested impulses are dependent
      impulse_1.getValue(scope).count.setValue(1)
      expect(impulse_1.getValue(scope).count.getValue(scope)).toBe(1)
      expect(impulse_2.getValue(scope).count.getValue(scope)).toBe(1)

      impulse_1.getValue(scope).name.setValue("Doe")
      expect(impulse_1.getValue(scope).name.getValue(scope)).toBe("Doe")
      expect(impulse_2.getValue(scope).name.getValue(scope)).toBe("Doe")
    })
  })

  describe("Impulse#clone(transform, options)", () => {
    it("creates new Impulse with custom compare", ({ scope }) => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone(Counter.clone, {
        compare: Counter.compare,
      })

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue(scope)).not.toBe(impulse_2.getValue(scope))
      expect(impulse_1.getValue(scope)).toStrictEqual(impulse_2.getValue(scope))

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
        scope,
      )
    })
  })

  describe("Impulse#toJSON()", () => {
    it("converts value to JSON", () => {
      const { impulse } = setup({
        number: 0,
        string: "biba",
        boolean: false,
        undefined: undefined,
        null: null,
        array: [1, "boba", true, undefined, null],
        object: {
          number: 2,
          string: "baba",
          boolean: false,
          undefined: undefined,
          null: null,
        },
      })

      expect(JSON.stringify(impulse)).toMatchInlineSnapshot(
        `"{"number":0,"string":"biba","boolean":false,"null":null,"array":[1,"boba",true,null,null],"object":{"number":2,"string":"baba","boolean":false,"null":null}}"`,
      )
    })

    it("applies replace fields", () => {
      const { impulse } = setup({ first: 1, second: 2, third: 3 })

      expect(JSON.stringify(impulse, ["first", "third"])).toMatchInlineSnapshot(
        `"{"first":1,"third":3}"`,
      )
    })

    it("applies replace function", () => {
      const { impulse } = setup({ first: 1, second: 2, third: 3 })

      expect(
        JSON.stringify(impulse, (_key, value: unknown) => {
          if (typeof value === "number") {
            return value * 2
          }

          return value
        }),
      ).toMatchInlineSnapshot(`"{"first":2,"second":4,"third":6}"`)
    })

    it("applies spaces", () => {
      const { impulse } = setup({ first: 1, second: 2, third: 3 })

      expect(JSON.stringify(impulse, null, 2)).toMatchInlineSnapshot(
        `
        "{
          "first": 1,
          "second": 2,
          "third": 3
        }"
      `,
      )
    })

    it("stringifies nested Impulse", () => {
      const { impulse } = setup({
        first: setup(1).impulse,
        second: setup([setup("1").impulse, setup(false).impulse]).impulse,
      })

      expect(JSON.stringify(impulse, null, 2)).toMatchInlineSnapshot(`
        "{
          "first": 1,
          "second": [
            "1",
            false
          ]
        }"
      `)
    })
  })

  describe("Impulse#toString", () => {
    it.each([
      ["number", 1, "1"],
      ["boolean", false, "false"],
      ["null", null, "null"],
      ["undefined", undefined, "undefined"],
      ["array", [1, 2, setup(3).impulse], "1,2,3"],
      ["object", { first: 1 }, "[object Object]"],
    ])("converts %s value to string", (_, value, expected) => {
      const { impulse } = setup(value)

      expect(String(impulse)).toBe(expected)
    })
  })
})
