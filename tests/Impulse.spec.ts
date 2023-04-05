import { Impulse } from "../src"
import { isEqual } from "../src/utils"

import { Counter } from "./common"

describe("Impulse#compare", () => {
  describe("when creating an impulse with Impulse.of", () => {
    it.concurrent("assigns isEqual by default", () => {
      const impulse = Impulse.of({ count: 0 })

      expect(impulse.compare).toBe(isEqual)
    })

    it.concurrent("assigns isEqual by `null`", () => {
      const impulse = Impulse.of({ count: 0 }, null)

      expect(impulse.compare).toBe(isEqual)
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
      expect(impulse.clone().compare).toBe(isEqual)
    })

    it.concurrent("inherits custom the source impulse compare", () => {
      const impulse = Impulse.of({ count: 0 }, Counter.compare)

      expect(impulse.clone().compare).toBe(impulse.compare)
      expect(impulse.clone().compare).toBe(Counter.compare)
    })

    it.concurrent("assigns isEqual by `null`", () => {
      const impulse = Impulse.of({ count: 0 }, Counter.compare)

      expect(impulse.clone(Counter.clone, null).compare).toBe(isEqual)
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

    it.concurrent("replaces with isEqual when `null`", ({ scope }) => {
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
})

describe("Impulse#subscribe", () => {
  it.concurrent("subscribes and unsubscribes to value changes", ({ scope }) => {
    const impulse = Impulse.of({ count: 0 })
    const spy = vi.fn<[Counter]>()

    impulse.setValue(Counter.inc)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    const unsubscribe = impulse.subscribe(() => {
      spy(impulse.getValue(scope))
    })

    impulse.setValue(Counter.inc)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith({ count: 2 })
    vi.clearAllMocks()

    unsubscribe()

    impulse.setValue(Counter.inc)
    expect(spy).not.toHaveBeenCalled()
  })

  it.concurrent("emits the same listener once", () => {
    const spy = vi.fn()
    const impulse = Impulse.of({ count: 0 })
    impulse.subscribe(spy)
    impulse.subscribe(spy)

    impulse.setValue(Counter.inc)
    expect(spy).toHaveBeenCalledOnce()
  })

  it.concurrent(
    "emits the same listener until it is subscribed at least ones",
    () => {
      const spy = vi.fn()
      const impulse = Impulse.of({ count: 0 })
      const unsubscribe_1 = impulse.subscribe(spy)
      const unsubscribe_2 = impulse.subscribe(spy)
      const unsubscribe_3 = impulse.subscribe(spy)

      unsubscribe_1()
      impulse.setValue(Counter.inc)
      expect(spy).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      unsubscribe_2()
      impulse.setValue(Counter.inc)
      expect(spy).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      unsubscribe_3()
      impulse.setValue(Counter.inc)
      expect(spy).not.toHaveBeenCalled()
    },
  )

  it.concurrent("ignores second unsubscribe call", () => {
    const spy = vi.fn()
    const impulse = Impulse.of({ count: 0 })
    const unsubscribe = impulse.subscribe(spy)

    impulse.setValue(Counter.inc)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    unsubscribe()
    unsubscribe()

    impulse.setValue(Counter.inc)
    expect(spy).not.toHaveBeenCalled()
  })

  it.concurrent("subscribes multiple listeners", () => {
    const spy_1 = vi.fn()
    const spy_2 = vi.fn()
    const impulse = Impulse.of({ count: 0 })
    const unsubscribe_1 = impulse.subscribe(spy_1)
    const unsubscribe_2 = impulse.subscribe(spy_2)

    impulse.setValue(Counter.inc)
    expect(spy_1).toHaveBeenCalledOnce()
    expect(spy_2).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    unsubscribe_1()
    impulse.setValue(Counter.inc)
    expect(spy_1).not.toHaveBeenCalled()
    expect(spy_2).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    unsubscribe_2()
    impulse.setValue(Counter.inc)
    expect(spy_1).not.toHaveBeenCalled()
    expect(spy_2).not.toHaveBeenCalled()
  })

  it.concurrent("does not emit when a new value is comparably equal", () => {
    const spy = vi.fn()
    const spyCompare = vi.fn(Counter.compare)
    const impulse = Impulse.of({ count: 0 })
    const unsubscribe = impulse.subscribe(spy)

    impulse.setValue(Counter.clone, spyCompare)
    expect(spy).not.toHaveBeenCalled()
    expect(spyCompare).toHaveBeenCalledOnce()
    expect(spyCompare).toHaveLastReturnedWith(true)
    vi.clearAllMocks()

    impulse.setValue(Counter.clone)
    expect(spy).toHaveBeenCalledOnce()
    expect(spyCompare).not.toHaveBeenCalled()
    vi.clearAllMocks()

    expect(spy.mock.calls).toHaveLength(0)
    impulse.setValue(Counter.clone, spyCompare)
    expect(spy).not.toHaveBeenCalled()
    expect(spyCompare).toHaveBeenCalledOnce()
    expect(spyCompare).toHaveLastReturnedWith(true)
    vi.clearAllMocks()

    unsubscribe()
    impulse.setValue(Counter.clone)
    expect(spy).not.toHaveBeenCalled()
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
