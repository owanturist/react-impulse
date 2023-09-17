import { Impulse } from "../src"

import { Counter } from "./common"

describe("Impulse.of()", () => {
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

describe("Impulse#setValue(value)", () => {
  const impulse = Impulse.of({ count: 0 })

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
    const impulse = Impulse.of({ count: 0 })

    impulse.setValue(Counter.inc)
    expect(impulse.getValue()).toStrictEqual({ count: 1 })
  })

  it("keeps the value", () => {
    const initial = { count: 0 }
    const impulse = Impulse.of(initial)

    impulse.setValue((counter) => counter)
    expect(impulse.getValue()).toBe(initial)
  })

  it("updates with the same value", () => {
    const initial = { count: 0 }
    const impulse = Impulse.of(initial)

    impulse.setValue(Counter.clone)
    expect(impulse.getValue()).not.toBe(initial)
    expect(impulse.getValue()).toStrictEqual(initial)
  })

  it("keeps the value if it is equal", () => {
    const initial = { count: 0 }
    const impulse = Impulse.of(initial, { compare: Counter.compare })

    impulse.setValue(Counter.clone)
    expect(impulse.getValue()).toBe(initial)
    expect(impulse.getValue()).toStrictEqual(initial)
  })

  it("updates with the equal value", () => {
    const initial = { count: 0 }
    const impulse = Impulse.of(initial)

    impulse.setValue(() => initial)
    expect(impulse.getValue()).toBe(initial)
  })
})

describe("Impulse#getValue(transform)", () => {
  const initial = { count: 0 }
  const impulse = Impulse.of(initial)

  it("gets initial value", () => {
    expect(impulse.getValue()).toBe(initial)
    expect(impulse.getValue(Counter.getCount)).toBe(0)
  })

  it("gets updates value", () => {
    impulse.setValue(Counter.inc)
    expect(impulse.getValue()).toStrictEqual({ count: 1 })
    expect(impulse.getValue(Counter.getCount)).toBe(1)
  })
})

describe("Impulse#clone()", () => {
  it("creates new Impulse", () => {
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone()

    expect(impulse_1).not.toBe(impulse_2)
    expect(impulse_1.getValue()).toBe(impulse_2.getValue())
  })

  it("does not update source value when clone updates", () => {
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone()

    impulse_2.setValue({ count: 1 })

    expect(impulse_1.getValue()).toStrictEqual({ count: 0 })
    expect(impulse_2.getValue()).toStrictEqual({ count: 1 })
  })

  it("does not update clone value when source updates", () => {
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone()

    impulse_1.setValue({ count: 1 })

    expect(impulse_1.getValue()).toStrictEqual({ count: 1 })
    expect(impulse_2.getValue()).toStrictEqual({ count: 0 })
  })

  it("transfers comparator from source Impulse", () => {
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone()

    expect(Object.is).not.toHaveBeenCalled()
    impulse_2.setValue({ count: 1 })

    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
  })

  it("transfers custom comparator from source Impulse", () => {
    const impulse_1 = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const impulse_2 = impulse_1.clone()

    expect(Counter.compare).not.toHaveBeenCalled()
    impulse_2.setValue({ count: 1 })

    expect(Counter.compare).toHaveBeenCalledOnce()
    expect(Counter.compare).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
  })
})

describe("Impulse#clone(options)", () => {
  it("inherits custom comparator by empty options", () => {
    const impulse_1 = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const impulse_2 = impulse_1.clone({})

    expect(Counter.compare).not.toHaveBeenCalled()
    impulse_2.setValue({ count: 1 })

    expect(Counter.compare).toHaveBeenCalledOnce()
    expect(Counter.compare).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
  })

  it("inherits custom comparator by options.compare: undefined", () => {
    const impulse_1 = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const impulse_2 = impulse_1.clone({ compare: undefined })

    expect(Counter.compare).not.toHaveBeenCalled()
    impulse_2.setValue({ count: 1 })

    expect(Counter.compare).toHaveBeenCalledOnce()
    expect(Counter.compare).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
  })

  it("overrides custom comparator as Object.is by options.compare: null", () => {
    const impulse_1 = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const impulse_2 = impulse_1.clone({ compare: null })

    expect(Object.is).not.toHaveBeenCalled()
    impulse_2.setValue({ count: 1 })

    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
  })

  it("overrides comparator by custom options.compare", () => {
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone({ compare: Counter.compare })

    expect(Counter.compare).not.toHaveBeenCalled()
    impulse_2.setValue({ count: 1 })

    expect(Counter.compare).toHaveBeenCalledOnce()
    expect(Counter.compare).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
  })
})

describe("Impulse#clone(transform)", () => {
  it("creates new Impulse", () => {
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone(Counter.clone)

    expect(impulse_1).not.toBe(impulse_2)
    expect(impulse_1.getValue()).not.toBe(impulse_2.getValue())
    expect(impulse_1.getValue()).toStrictEqual(impulse_2.getValue())
  })

  it("keeps comparator from source", () => {
    const impulse_1 = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const impulse_2 = impulse_1.clone(Counter.clone)

    expect(Counter.compare).not.toHaveBeenCalled()
    impulse_2.setValue({ count: 1 })

    expect(Counter.compare).toHaveBeenCalledOnce()
    expect(Counter.compare).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
  })

  it("creates new nested Impulse with clone(transform)", () => {
    const impulse_1 = Impulse.of({
      count: Impulse.of(0),
      name: Impulse.of("John"),
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
    const impulse_1 = Impulse.of({
      count: Impulse.of(0),
      name: Impulse.of("John"),
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
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone(Counter.clone, {
      compare: Counter.compare,
    })

    expect(impulse_1).not.toBe(impulse_2)
    expect(impulse_1.getValue()).not.toBe(impulse_2.getValue())
    expect(impulse_1.getValue()).toStrictEqual(impulse_2.getValue())

    expect(Counter.compare).not.toHaveBeenCalled()
    impulse_2.setValue({ count: 1 })

    expect(Counter.compare).toHaveBeenCalledOnce()
    expect(Counter.compare).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
  })
})

describe("Impulse#toJSON()", () => {
  it("converts value to JSON", () => {
    const impulse = Impulse.of({
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
    const impulse = Impulse.of({ first: 1, second: 2, third: 3 })

    expect(JSON.stringify(impulse, ["first", "third"])).toMatchInlineSnapshot(
      '"{\\"first\\":1,\\"third\\":3}"',
    )
  })

  it("applies replace function", () => {
    const impulse = Impulse.of({ first: 1, second: 2, third: 3 })

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
    const impulse = Impulse.of({ first: 1, second: 2, third: 3 })

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
    const store = Impulse.of({
      first: Impulse.of(1),
      second: Impulse.of([Impulse.of("1"), Impulse.of(false)]),
    })

    expect(JSON.stringify(store, null, 2)).toMatchInlineSnapshot(`
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
    ["array", [1, 2, Impulse.of(3)], "1,2,3"],
    ["object", { first: 1 }, "[object Object]"],
  ])("converts %s value to string", (_, value, expected) => {
    expect(String(Impulse.of(value))).toBe(expected)
  })
})
