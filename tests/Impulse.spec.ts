import {
  type ReadonlyImpulse,
  type ImpulseOptions,
  type TransmittingImpulseOptions,
  Impulse,
  subscribe,
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
    () => source.getValue(),
    (value) => {
      source.setValue(value)
    },
    options,
  )

  return {
    impulse,
    getValue: () => source.getValue(),
    setValue: (value: T) => {
      source.setValue(value)
    },
  }
}

describe("Impulse.of()", () => {
  it("creates an Impulse of undefined | T type", () => {
    const impulse = Impulse.of<string>()

    expectTypeOf(impulse).toMatchTypeOf<Impulse<string | undefined>>()
  })

  it("should create an impulse with undefined initial value", () => {
    const impulse = Impulse.of<number>()

    expect(impulse.getValue()).toBeUndefined()
  })

  it("updates the impulse with a new value", () => {
    const impulse = Impulse.of<number>()

    impulse.setValue(1)

    expect(impulse.getValue()).toBe(1)
  })

  it("updates the impulse with a undefined", () => {
    const impulse = Impulse.of<number>()

    impulse.setValue(1)
    impulse.setValue(undefined)

    expect(impulse.getValue()).toBeUndefined()
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
    expectTypeOf(impulse).toMatchTypeOf<Impulse<number>>()
    expectTypeOf(impulse).toMatchTypeOf<ReadonlyImpulse<number>>()
  })

  it("reads the value from the source", () => {
    const initial = { count: 0 }
    const source = Impulse.of(initial)
    const impulse = Impulse.transmit(() => source.getValue())

    expect(impulse.getValue()).toBe(initial)
    expect(impulse.getValue()).toStrictEqual({ count: 0 })

    const next = { count: 1 }
    source.setValue(next)
    expect(impulse.getValue()).toBe(next)
    expect(impulse.getValue()).toStrictEqual({ count: 1 })
  })

  it("subscribes to Impulse source", () => {
    const source = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const impulse = Impulse.transmit(() => source.getValue())
    const spy = vi.fn()

    subscribe(() => {
      spy(impulse.getValue())
    })

    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith({ count: 0 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith({ count: 1 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(spy).not.toHaveBeenCalled()
  })

  it("cannot subscribe to none-Impulse source", () => {
    let variable = 0
    const impulse = Impulse.transmit(() => variable)
    const spy = vi.fn()

    subscribe(() => {
      spy(impulse.getValue())
    })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(0)
    vi.clearAllMocks()

    variable = 1
    expect(spy).not.toHaveBeenCalled()
  })

  it("does not call compare on init", () => {
    const source = Impulse.of({ count: 0 })
    Impulse.transmit(() => source.getValue(), { compare: Counter.compare })

    expect(Counter.compare).not.toHaveBeenCalled()
  })

  it("does not call compare on first getValue", () => {
    const source = Impulse.of({ count: 0 })
    const impulse = Impulse.transmit(() => source.getValue(), {
      compare: Counter.compare,
    })

    impulse.getValue()
    expect(Counter.compare).not.toHaveBeenCalled()
  })

  it("calls compare on subsequent calls", () => {
    const source = Impulse.of({ count: 0 })
    const impulse = Impulse.transmit(() => source.getValue())

    impulse.getValue()
    impulse.getValue()
    impulse.getValue()
    impulse.getValue()
    impulse.getValue()

    expect(Object.is).toHaveBeenCalledTimes(4)
  })

  it("assigns Object.is as default compare", () => {
    const source = Impulse.of(0)
    const impulse = Impulse.transmit(() => ({ count: source.getValue() }))

    const value_1 = impulse.getValue()
    const value_2 = impulse.getValue()
    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 0 })
    expect(value_1).not.toBe(value_2)
    expect(value_1).toStrictEqual(value_2)
  })

  it("assigns Object.is by `null` as compare", () => {
    const source = Impulse.of(0)
    const impulse = Impulse.transmit(() => ({ count: source.getValue() }), {
      compare: null,
    })

    const value_1 = impulse.getValue()
    const value_2 = impulse.getValue()
    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 0 })
    expect(value_1).not.toBe(value_2)
    expect(value_1).toStrictEqual(value_2)
  })

  it("assigns custom function as compare", () => {
    const source = Impulse.of(0)
    const impulse = Impulse.transmit(() => ({ count: source.getValue() }), {
      compare: Counter.compare,
    })

    const value_1 = impulse.getValue()
    const value_2 = impulse.getValue()
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

    expectTypeOf(impulse).toMatchTypeOf<Impulse<number>>()
    expectTypeOf(impulse).toMatchTypeOf<ReadonlyImpulse<number>>()
  })

  it("subscribes to Impulse source and back", () => {
    const source = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const impulse = Impulse.transmit(
      () => source.getValue(),
      (counter) => source.setValue(counter),
    )
    const spyOnImpulse = vi.fn()
    const spyOnSource = vi.fn()

    subscribe(() => {
      spyOnImpulse(impulse.getValue())
    })
    subscribe(() => {
      spyOnSource(source.getValue())
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

  it("assigns custom function as compare", () => {
    const source = Impulse.of({ count: 0 })
    const impulse = Impulse.transmit(
      () => source.getValue(),
      (counter) => source.setValue(counter),
      {
        compare: Counter.compare,
      },
    )

    impulse.getValue()
    impulse.getValue()
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

    it("updates value", () => {
      const next = { count: 1 }
      impulse.setValue(next)
      expect(impulse.getValue()).toBe(next)
    })

    it("updates with the same value", () => {
      const next = { count: 1 }
      impulse.setValue(next)
      expect(impulse.getValue()).toBe(next)
    })

    it("updates with equal value", () => {
      const prev = impulse.getValue()
      impulse.setValue(prev)
      expect(impulse.getValue()).toBe(prev)
    })
  })

  describe("Impulse#setValue(transform)", () => {
    it("updates value", () => {
      const { impulse } = setup({ count: 0 })

      impulse.setValue(Counter.inc)
      expect(impulse.getValue()).toStrictEqual({ count: 1 })
    })

    it("keeps the value", () => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.setValue((counter) => counter)
      expect(impulse.getValue()).toBe(initial)
    })

    it("updates with the same value", () => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.setValue(Counter.clone)
      expect(impulse.getValue()).not.toBe(initial)
      expect(impulse.getValue()).toStrictEqual(initial)
    })

    it("keeps the value if it is equal", () => {
      const initial = { count: 0 }
      const { impulse } = setup(initial, { compare: Counter.compare })

      impulse.setValue(Counter.clone)
      expect(impulse.getValue()).toBe(initial)
      expect(impulse.getValue()).toStrictEqual(initial)
    })

    it("updates with the equal value", () => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.setValue(() => initial)
      expect(impulse.getValue()).toBe(initial)
    })
  })

  describe("Impulse#getValue(transform)", () => {
    it("gets initial value", () => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      expect(impulse.getValue()).toBe(initial)
      expect(impulse.getValue(Counter.getCount)).toBe(0)
    })

    it("gets updates value", () => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.setValue(Counter.inc)
      expect(impulse.getValue()).toStrictEqual({ count: 1 })
      expect(impulse.getValue(Counter.getCount)).toBe(1)
    })
  })

  describe("Impulse#clone()", () => {
    it("creates new Impulse", () => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone()

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue()).toBe(impulse_2.getValue())
    })

    it("does not update source value when clone updates", () => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone()

      impulse_2.setValue({ count: 1 })

      expect(impulse_1.getValue()).toStrictEqual({ count: 0 })
      expect(impulse_2.getValue()).toStrictEqual({ count: 1 })
    })

    it("does not update clone value when source updates", () => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone()

      impulse_1.setValue({ count: 1 })

      expect(impulse_1.getValue()).toStrictEqual({ count: 1 })
      expect(impulse_2.getValue()).toStrictEqual({ count: 0 })
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
    it("creates new Impulse", () => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone(Counter.clone)

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue()).not.toBe(impulse_2.getValue())
      expect(impulse_1.getValue()).toStrictEqual(impulse_2.getValue())
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

    it("creates new nested Impulse with clone(transform)", () => {
      const { impulse: impulse_1 } = setup({
        count: setup(0).impulse,
        name: setup("John").impulse,
      })
      const impulse_2 = impulse_1.clone(({ count, name }) => ({
        count: count.clone(),
        name: name.clone(),
      }))

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue()).not.toBe(impulse_2.getValue())
      expect(impulse_1.getValue().count).not.toBe(impulse_2.getValue().count)
      expect(impulse_1.getValue().name).not.toBe(impulse_2.getValue().name)
      expect(
        impulse_1.getValue(({ count, name }) => ({
          count: count.getValue(),
          name: name.getValue(),
        })),
      ).toStrictEqual(
        impulse_2.getValue(({ count, name }) => ({
          count: count.getValue(),
          name: name.getValue(),
        })),
      )

      // the nested impulses are independent
      impulse_1.getValue().count.setValue(1)
      expect(impulse_1.getValue().count.getValue()).toBe(1)
      expect(impulse_2.getValue().count.getValue()).toBe(0)

      impulse_1.getValue().name.setValue("Doe")
      expect(impulse_1.getValue().name.getValue()).toBe("Doe")
      expect(impulse_2.getValue().name.getValue()).toBe("John")
    })

    it("creates shallow nested Impulse with clone()", () => {
      const { impulse: impulse_1 } = setup({
        count: setup(0).impulse,
        name: setup("John").impulse,
      })
      const impulse_2 = impulse_1.clone()

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue()).toBe(impulse_2.getValue())
      expect(impulse_1.getValue().count).toBe(impulse_2.getValue().count)
      expect(impulse_1.getValue().name).toBe(impulse_2.getValue().name)
      expect(
        impulse_1.getValue(({ count, name }) => ({
          count: count.getValue(),
          name: name.getValue(),
        })),
      ).toStrictEqual(
        impulse_2.getValue(({ count, name }) => ({
          count: count.getValue(),
          name: name.getValue(),
        })),
      )

      // the nested impulses are dependent
      impulse_1.getValue().count.setValue(1)
      expect(impulse_1.getValue().count.getValue()).toBe(1)
      expect(impulse_2.getValue().count.getValue()).toBe(1)

      impulse_1.getValue().name.setValue("Doe")
      expect(impulse_1.getValue().name.getValue()).toBe("Doe")
      expect(impulse_2.getValue().name.getValue()).toBe("Doe")
    })
  })

  describe("Impulse#clone(transform, options)", () => {
    it("creates new Impulse with custom compare", () => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone(Counter.clone, {
        compare: Counter.compare,
      })

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue()).not.toBe(impulse_2.getValue())
      expect(impulse_1.getValue()).toStrictEqual(impulse_2.getValue())

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
        '"{\\"number\\":0,\\"string\\":\\"biba\\",\\"boolean\\":false,\\"null\\":null,\\"array\\":[1,\\"boba\\",true,null,null],\\"object\\":{\\"number\\":2,\\"string\\":\\"baba\\",\\"boolean\\":false,\\"null\\":null}}"',
      )
    })

    it("applies replace fields", () => {
      const { impulse } = setup({ first: 1, second: 2, third: 3 })

      expect(JSON.stringify(impulse, ["first", "third"])).toMatchInlineSnapshot(
        '"{\\"first\\":1,\\"third\\":3}"',
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
      ).toMatchInlineSnapshot('"{\\"first\\":2,\\"second\\":4,\\"third\\":6}"')
    })

    it("applies spaces", () => {
      const { impulse } = setup({ first: 1, second: 2, third: 3 })

      expect(JSON.stringify(impulse, null, 2)).toMatchInlineSnapshot(
        `
        "{
          \\"first\\": 1,
          \\"second\\": 2,
          \\"third\\": 3
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
          \\"first\\": 1,
          \\"second\\": [
            \\"1\\",
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
