import { act } from "@testing-library/react"

import { Impulse } from "../src"
import { TransmittingImpulse } from "../src/Impulse"
import { eq } from "../src/utils"

import { Counter } from "./common"

describe("Impulse.of()", () => {
  it.concurrent(
    "should create an impulse with undefined initial value",
    ({ scope }) => {
      const impulse = Impulse.of<number>()

      expect(impulse.getValue(scope)).toBeUndefined()
    },
  )

  it.concurrent("updates the impulse with a new value", ({ scope }) => {
    const impulse = Impulse.of<number>()

    impulse.setValue(1)

    expect(impulse.getValue(scope)).toBe(1)
  })

  it.concurrent("updates the impulse with a undefined", ({ scope }) => {
    const impulse = Impulse.of<number>()

    impulse.setValue(1)
    impulse.setValue(undefined)

    expect(impulse.getValue(scope)).toBeUndefined()
  })
})

describe("Impulse#compare", () => {
  describe("when creating an impulse with Impulse.of", () => {
    it.concurrent("assigns eq by default", () => {
      const impulse = Impulse.of({ count: 0 })

      expect(impulse.compare).toBe(eq)
    })

    it.concurrent("assigns eq by `null`", () => {
      const impulse = Impulse.of({ count: 0 }, null)

      expect(impulse.compare).toBe(eq)
    })

    it.concurrent("assigns custom function", () => {
      const impulse = Impulse.of({ count: 0 }, Counter.compare)

      expect(impulse.compare).toBe(Counter.compare)
    })
  })

  describe("when creating an impulse with Impulse.clone", () => {
    it.concurrent("inherits default the source impulse compare", () => {
      const impulse = Impulse.of({ count: 0 })

      expect(impulse.clone().compare).toBe(impulse.compare)
      expect(impulse.clone().compare).toBe(eq)
    })

    it.concurrent("inherits custom the source impulse compare", () => {
      const impulse = Impulse.of({ count: 0 }, Counter.compare)

      expect(impulse.clone().compare).toBe(impulse.compare)
      expect(impulse.clone().compare).toBe(Counter.compare)
    })

    it.concurrent("assigns eq by `null`", () => {
      const impulse = Impulse.of({ count: 0 }, Counter.compare)

      expect(impulse.clone(Counter.clone, null).compare).toBe(eq)
    })

    it.concurrent("assigns custom function", () => {
      const impulse = Impulse.of({ count: 0 })

      expect(impulse.clone(Counter.clone, Counter.compare).compare).toBe(
        Counter.compare,
      )
    })
  })

  describe("when using Impulse#setValue", () => {
    it.concurrent("uses Impulse#compare by default", ({ scope }) => {
      const initial = { count: 0 }
      const impulse = Impulse.of(initial, Counter.compare)

      impulse.setValue(Counter.clone)
      expect(impulse.getValue(scope)).toBe(initial)
    })

    it.concurrent("replaces with eq when `null`", ({ scope }) => {
      const initial = { count: 0 }
      const impulse = Impulse.of(initial, Counter.compare)

      impulse.setValue(Counter.clone, null)
      expect(impulse.getValue(scope)).not.toBe(initial)
      expect(impulse.getValue(scope)).toStrictEqual(initial)
    })

    it.concurrent("replaces with custom function", ({ scope }) => {
      const initial = { count: 0 }
      const impulse = Impulse.of(initial, Counter.compare)

      impulse.setValue(Counter.inc, () => true)
      expect(impulse.getValue(scope)).toBe(initial)
    })
  })
})

describe("Impulse#setValue(value)", () => {
  const impulse = Impulse.of({ count: 0 })

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
  const impulse = Impulse.of({ count: 0 })

  it("updates value", ({ scope }) => {
    impulse.setValue(Counter.inc)
    expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
  })

  it("keeps the value", ({ scope }) => {
    const prev = impulse.getValue(scope)
    impulse.setValue((counter) => counter)
    expect(impulse.getValue(scope)).toBe(prev)
  })

  it("updates with the same value", ({ scope }) => {
    const prev = impulse.getValue(scope)
    impulse.setValue(Counter.clone)
    expect(impulse.getValue(scope)).not.toBe(prev)
    expect(impulse.getValue(scope)).toStrictEqual(prev)
  })

  it("updates with the equal value", ({ scope }) => {
    const prev = impulse.getValue(scope)
    impulse.setValue(() => prev)
    expect(impulse.getValue(scope)).toBe(prev)
  })
})

describe("Impulse#setValue(value, compare)", () => {
  let prev: Counter = { count: 0 }
  const impulse = Impulse.of(prev)

  beforeEach(({ scope }) => {
    prev = impulse.getValue(scope)
  })

  it("keeps equal value", ({ scope }) => {
    const clone = Counter.clone(prev)
    impulse.setValue(clone, Counter.compare)

    expect(impulse.getValue(scope)).toBe(prev)
    expect(impulse.getValue(scope)).not.toBe(clone)
  })

  it("replaces with not equal value", ({ scope }) => {
    const replacement = { count: 1 }
    impulse.setValue(replacement, Counter.compare)

    expect(impulse.getValue(scope)).toBe(replacement)
    expect(impulse.getValue(scope)).not.toBe(prev)
  })

  it("replaces with same but not equal", ({ scope }) => {
    const clone = Counter.clone(prev)
    impulse.setValue(clone)

    expect(impulse.getValue(scope)).toBe(clone)
    expect(impulse.getValue(scope)).not.toBe(prev)
  })
})

describe("Impulse#setValue(transform, compare)", () => {
  let prev: Counter = { count: 0 }
  const impulse = Impulse.of(prev)

  beforeEach(({ scope }) => {
    prev = impulse.getValue(scope)
  })

  it("keeps equal value", ({ scope }) => {
    impulse.setValue(Counter.clone, Counter.compare)
    expect(impulse.getValue(scope)).toBe(prev)
  })

  it("replaces with not equal value", ({ scope }) => {
    impulse.setValue(Counter.inc, Counter.compare)
    expect(impulse.getValue(scope)).not.toBe(prev)
    expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
  })

  it("replaces with same but not equal", ({ scope }) => {
    impulse.setValue(Counter.clone)
    expect(impulse.getValue(scope)).not.toBe(prev)
    expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
  })
})

describe("Impulse#getValue(transform)", () => {
  const initial = { count: 0 }
  const impulse = Impulse.of(initial)

  it("gets initial value", ({ scope }) => {
    expect(impulse.getValue(scope)).toBe(initial)
    expect(impulse.getValue(scope, Counter.getCount)).toBe(0)
  })

  it("gets updates value", ({ scope }) => {
    impulse.setValue(Counter.inc)
    expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
    expect(impulse.getValue(scope, Counter.getCount)).toBe(1)
  })
})

describe("Impulse#clone", () => {
  it.concurrent("creates new Impulse with clone()", ({ scope }) => {
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone()

    expect(impulse_1).not.toBe(impulse_2)
    expect(impulse_1.getValue(scope)).toBe(impulse_2.getValue(scope))
  })

  it.concurrent("creates new Impulse with clone(transform)", ({ scope }) => {
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone(Counter.clone)

    expect(impulse_1).not.toBe(impulse_2)
    expect(impulse_1.getValue(scope)).not.toBe(impulse_2.getValue(scope))
    expect(impulse_1.getValue(scope)).toStrictEqual(impulse_2.getValue(scope))
  })

  it.concurrent(
    "creates new nested Impulse with clone(transform)",
    ({ scope }) => {
      const impulse_1 = Impulse.of({
        count: Impulse.of(0),
        name: Impulse.of("John"),
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

      // the nested impulses are independent
      impulse_1.getValue(scope).count.setValue(1)
      expect(impulse_1.getValue(scope).count.getValue(scope)).toBe(1)
      expect(impulse_2.getValue(scope).count.getValue(scope)).toBe(0)

      impulse_1.getValue(scope).name.setValue("Doe")
      expect(impulse_1.getValue(scope).name.getValue(scope)).toBe("Doe")
      expect(impulse_2.getValue(scope).name.getValue(scope)).toBe("John")
    },
  )

  it.concurrent("creates shallow nested Impulse with clone()", ({ scope }) => {
    const impulse_1 = Impulse.of({
      count: Impulse.of(0),
      name: Impulse.of("John"),
    })
    const impulse_2 = impulse_1.clone()

    expect(impulse_1).not.toBe(impulse_2)
    expect(impulse_1.getValue(scope)).toBe(impulse_2.getValue(scope))
    expect(impulse_1.getValue(scope).count).toBe(
      impulse_2.getValue(scope).count,
    )
    expect(impulse_1.getValue(scope).name).toBe(impulse_2.getValue(scope).name)
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

  it.concurrent("clones TransmittingImpulse as DirectImpulse", ({ scope }) => {
    const origin = Impulse.of({ count: 0 })
    const transmitter = new TransmittingImpulse(
      (localScope) => origin.getValue(localScope).count > 0,
      (value) => origin.setValue({ count: value ? 1 : 0 }),
    )
    const clone = transmitter.clone()

    expect(transmitter).toBeInstanceOf(TransmittingImpulse)
    expect(clone).toBeInstanceOf(Impulse)

    expect(origin.getValue(scope)).toStrictEqual({ count: 0 })
    expect(transmitter.getValue(scope)).toBe(false)
    expect(clone.getValue(scope)).toBe(false)

    act(() => {
      origin.setValue({ count: 1 })
    })
    expect(origin.getValue(scope)).toStrictEqual({ count: 1 })
    expect(transmitter.getValue(scope)).toBe(true)
    expect(clone.getValue(scope)).toBe(false)

    act(() => {
      transmitter.setValue(false)
    })
    expect(origin.getValue(scope)).toStrictEqual({ count: 0 })
    expect(transmitter.getValue(scope)).toBe(false)
    expect(clone.getValue(scope)).toBe(false)

    act(() => {
      clone.setValue(true)
    })
    expect(origin.getValue(scope)).toStrictEqual({ count: 0 })
    expect(transmitter.getValue(scope)).toBe(false)
    expect(clone.getValue(scope)).toBe(true)
  })
})

describe("Impulse#toJSON()", () => {
  it.concurrent("converts value to JSON", () => {
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

  it.concurrent("applies replace fields", () => {
    const impulse = Impulse.of({ first: 1, second: 2, third: 3 })

    expect(JSON.stringify(impulse, ["first", "third"])).toMatchInlineSnapshot(
      '"{\\"first\\":1,\\"third\\":3}"',
    )
  })

  it.concurrent("applies replace function", () => {
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

  it.concurrent("applies spaces", () => {
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

  it.concurrent("stringifies nested Impulse", () => {
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
  it.concurrent.each([
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
