import {
  type ReadonlyImpulse,
  type ImpulseOptions,
  type TransmittingImpulseOptions,
  Impulse,
  subscribe,
  type Scope,
} from "../src"

import { Counter } from "./common"

function setupImpulse<T>(initialValue: T, options?: ImpulseOptions<T>) {
  const impulse = Impulse.of(initialValue, options)

  return { impulse }
}

function setupTransmittingImpulseFromGlobalVariable<T>(
  initialValue: T,
  options?: TransmittingImpulseOptions<T>,
) {
  let variable = initialValue

  const impulse = Impulse.transmit(
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

function setupTransmittingImpulseFromImpulse<T>(
  initialValue: T,
  options?: TransmittingImpulseOptions<T>,
) {
  const source = Impulse.of(initialValue)
  const impulse = Impulse.transmit(
    (scope) => source.getValue(scope),
    (value) => {
      source.setValue(value)
    },
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
    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
  })

  it("assigns Object.is by `null` as compare", () => {
    const impulse = Impulse.of({ count: 0 }, { compare: null })

    impulse.setValue({ count: 1 })
    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
  })

  it("assigns custom function as compare", () => {
    const impulse = Impulse.of({ count: 0 }, { compare: Counter.compare })

    impulse.setValue({ count: 1 })
    expect(Counter.compare).toHaveBeenCalledOnce()
    expect(Counter.compare).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
  })
})

describe("Impulse.transmit(getter, options?)", () => {
  it("creates a ReadonlyImpulse", () => {
    const impulse = Impulse.transmit(() => 0)

    // @ts-expect-error should be ReadonlyImpulse only
    expectTypeOf(impulse).toEqualTypeOf<Impulse<number>>()
    expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<number>>()
  })

  it("reads the value from the source", ({ scope }) => {
    const initial = { count: 0 }
    const source = Impulse.of(initial)
    const impulse = Impulse.transmit((localScope) =>
      source.getValue(localScope),
    )

    expect(impulse.getValue(scope)).toBe(initial)
    expect(impulse.getValue(scope)).toStrictEqual({ count: 0 })

    const next = { count: 1 }
    source.setValue(next)
    expect(impulse.getValue(scope)).toBe(next)
    expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
  })

  it("subscribes to Impulse source", ({ scope }) => {
    const source = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const impulse = Impulse.transmit((localScope) =>
      source.getValue(localScope),
    )
    const spy = vi.fn()

    expect(source).toHaveEmittersSize(0)
    expect(impulse).toHaveEmittersSize(0)

    const unsubscribe = subscribe((localScope) => {
      spy(impulse.getValue(localScope))
    })

    expect(source).toHaveEmittersSize(1)
    expect(impulse).toHaveEmittersSize(1)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith({ count: 0 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith({ count: 1 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
    expect(spy).not.toHaveBeenCalled()

    expect(source).toHaveEmittersSize(1)
    expect(impulse).toHaveEmittersSize(1)
    unsubscribe()
    expect(source).toHaveEmittersSize(0)
    expect(impulse).toHaveEmittersSize(0)
  })

  it("cannot subscribe to none-Impulse source", () => {
    let variable = 0
    const impulse = Impulse.transmit(() => variable)
    const spy = vi.fn()

    subscribe((scope) => {
      spy(impulse.getValue(scope))
    })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(0)
    vi.clearAllMocks()

    variable = 1
    expect(spy).not.toHaveBeenCalled()
  })

  it("does not call compare on init", () => {
    const source = Impulse.of({ count: 0 })
    Impulse.transmit((scope) => source.getValue(scope), {
      compare: Counter.compare,
    })

    expect(Counter.compare).not.toHaveBeenCalled()
  })

  it("does not call compare on first getValue", ({ scope }) => {
    const source = Impulse.of({ count: 0 })
    const impulse = Impulse.transmit(
      (localScope) => source.getValue(localScope),
      {
        compare: Counter.compare,
      },
    )

    impulse.getValue(scope)
    expect(Counter.compare).not.toHaveBeenCalled()
  })

  it("calls compare on subsequent calls", ({ scope }) => {
    const source = Impulse.of({ count: 0 })
    const impulse = Impulse.transmit((localScope) =>
      source.getValue(localScope),
    )

    impulse.getValue(scope)
    impulse.getValue(scope)
    impulse.getValue(scope)
    impulse.getValue(scope)
    impulse.getValue(scope)

    expect(Object.is).toHaveBeenCalledTimes(4)
  })

  it("assigns Object.is as default compare", ({ scope }) => {
    const source = Impulse.of(0)
    const impulse = Impulse.transmit((localScope) => ({
      count: source.getValue(localScope),
    }))

    const value_1 = impulse.getValue(scope)
    const value_2 = impulse.getValue(scope)
    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 0 })
    expect(value_1).not.toBe(value_2)
    expect(value_1).toStrictEqual(value_2)
  })

  it("assigns Object.is by `null` as compare", ({ scope }) => {
    const source = Impulse.of(0)
    const impulse = Impulse.transmit(
      (localScope) => ({ count: source.getValue(localScope) }),
      {
        compare: null,
      },
    )

    const value_1 = impulse.getValue(scope)
    const value_2 = impulse.getValue(scope)
    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 0 })
    expect(value_1).not.toBe(value_2)
    expect(value_1).toStrictEqual(value_2)
  })

  it("assigns custom function as compare", ({ scope }) => {
    const source = Impulse.of(0)
    const impulse = Impulse.transmit(
      (localScope) => ({ count: source.getValue(localScope) }),
      {
        compare: Counter.compare,
      },
    )

    const value_1 = impulse.getValue(scope)
    const value_2 = impulse.getValue(scope)
    expect(Counter.compare).toHaveBeenCalledOnce()
    expect(Counter.compare).toHaveBeenLastCalledWith({ count: 0 }, { count: 0 })
    expect(value_1).toBe(value_2)
    expect(value_1).toStrictEqual(value_2)
  })
})

describe("Impulse.transmit(getter, setter, options?)", () => {
  it("creates an Impulse", () => {
    let variable = 0
    const impulse = Impulse.transmit(
      () => variable,
      (value) => {
        variable = value
      },
    )

    expectTypeOf(impulse).toEqualTypeOf<Impulse<number>>()
    expectTypeOf(impulse).toMatchTypeOf<ReadonlyImpulse<number>>()
  })

  it("subscribes to Impulse source and back", () => {
    const source = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const impulse = Impulse.transmit(
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

    expect(spyOnImpulse).toHaveBeenCalledOnce()
    expect(spyOnImpulse).toHaveBeenLastCalledWith({ count: 0 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(spyOnImpulse).toHaveBeenCalledOnce()
    expect(spyOnImpulse).toHaveBeenLastCalledWith({ count: 1 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(spyOnImpulse).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.setValue({ count: 1 })
    expect(spyOnSource).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.setValue({ count: 2 })
    expect(spyOnSource).toHaveBeenCalledOnce()
    expect(spyOnSource).toHaveBeenLastCalledWith({ count: 2 })
  })

  it("assigns custom function as compare", ({ scope }) => {
    const source = Impulse.of({ count: 0 })
    const impulse = Impulse.transmit(
      (localScope) => source.getValue(localScope),
      (counter) => source.setValue(counter),
      {
        compare: Counter.compare,
      },
    )

    impulse.getValue(scope)
    impulse.getValue(scope)
    expect(Counter.compare).toHaveBeenCalledOnce()
    expect(Counter.compare).toHaveBeenLastCalledWith({ count: 0 }, { count: 0 })
  })
})

describe.each([
  ["DirectImpulse", setupImpulse],
  [
    "TransmittingImpulse from a global variable",
    setupTransmittingImpulseFromGlobalVariable,
  ],
  ["TransmittingImpulse from an Impulse", setupTransmittingImpulseFromImpulse],
])("Impulse.transmit() from %s", (_, setup) => {
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

  describe("Impulse#getValue(transform)", () => {
    it("gets initial value", ({ scope }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      expect(impulse.getValue(scope)).toBe(initial)
      expect(impulse.getValue(scope, Counter.getCount)).toBe(0)
    })

    it("gets updates value", ({ scope }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.setValue(Counter.inc)
      expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
      expect(impulse.getValue(scope, Counter.getCount)).toBe(1)
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

      expect(Object.is).toHaveBeenCalledOnce()
      expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
    })

    it("transfers custom comparator from source Impulse", () => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone()

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledOnce()
      expect(Counter.compare).toHaveBeenLastCalledWith(
        { count: 0 },
        { count: 1 },
      )
    })
  })

  describe("Impulse#clone(options)", () => {
    it("inherits custom comparator by empty options", () => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone({})

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledOnce()
      expect(Counter.compare).toHaveBeenLastCalledWith(
        { count: 0 },
        { count: 1 },
      )
    })

    it("inherits custom comparator by options.compare: undefined", () => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone({ compare: undefined })

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledOnce()
      expect(Counter.compare).toHaveBeenLastCalledWith(
        { count: 0 },
        { count: 1 },
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

      expect(Object.is).toHaveBeenCalledOnce()
      expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
    })

    it("overrides comparator by custom options.compare", () => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone({ compare: Counter.compare })

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledOnce()
      expect(Counter.compare).toHaveBeenLastCalledWith(
        { count: 0 },
        { count: 1 },
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

    it("keeps comparator from source", () => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone(Counter.clone)

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledOnce()
      expect(Counter.compare).toHaveBeenLastCalledWith(
        { count: 0 },
        { count: 1 },
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
      expect(
        impulse_1.getValue(scope, ({ count, name }, localScope) => ({
          count: count.getValue(localScope),
          name: name.getValue(localScope),
        })),
      ).toStrictEqual(
        impulse_2.getValue(scope, ({ count, name }, localScope) => ({
          count: count.getValue(localScope),
          name: name.getValue(localScope),
        })),
      )

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
      expect(
        impulse_1.getValue(scope, ({ count, name }) => ({
          count: count.getValue(scope),
          name: name.getValue(scope),
        })),
      ).toStrictEqual(
        impulse_2.getValue(scope, ({ count, name }) => ({
          count: count.getValue(scope),
          name: name.getValue(scope),
        })),
      )

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

      expect(Counter.compare).toHaveBeenCalledOnce()
      expect(Counter.compare).toHaveBeenLastCalledWith(
        { count: 0 },
        { count: 1 },
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
    ])("converts %s value to string", (__, value, expected) => {
      const { impulse } = setup(value)

      expect(String(impulse)).toBe(expected)
    })
  })
})
