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
})

describe("Impulse#compare", () => {
  it("does not call compare on init", () => {
    const compare = vi.fn(Counter.compare)
    Impulse.of({ count: 0 }, compare)

    expect(compare).not.toHaveBeenCalled()
  })

  describe("when creating an impulse with Impulse.of", () => {
    it("assigns Object.is by default", () => {
      const impulse = Impulse.of({ count: 0 })

      impulse.setValue({ count: 1 })
      expect(Object.is).toHaveBeenCalledOnce()
      expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
    })

    it("assigns Object.is by `null`", () => {
      const impulse = Impulse.of({ count: 0 }, null)

      impulse.setValue({ count: 1 })
      expect(Object.is).toHaveBeenCalledOnce()
      expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
    })

    it("assigns custom function", () => {
      const impulse = Impulse.of({ count: 0 }, Counter.compare)

      impulse.setValue({ count: 1 })
      expect(Counter.compare).toHaveBeenCalledOnce()
      expect(Counter.compare).toHaveBeenLastCalledWith(
        { count: 0 },
        { count: 1 },
      )
    })
  })

  describe("when creating an impulse with Impulse.clone", () => {
    it("inherits default the source impulse compare", () => {
      const clone = Impulse.of({ count: 0 }).clone()

      clone.setValue({ count: 1 })
      expect(Object.is).toHaveBeenCalledOnce()
      expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
    })

    it("inherits custom the source impulse compare", () => {
      const clone = Impulse.of({ count: 0 }, Counter.compare).clone()

      clone.setValue({ count: 1 })
      expect(Counter.compare).toHaveBeenCalledOnce()
      expect(Counter.compare).toHaveBeenLastCalledWith(
        { count: 0 },
        { count: 1 },
      )
    })

    it("assigns Object.is by `null`", () => {
      const clone = Impulse.of({ count: 0 }, Counter.compare).clone(
        Counter.clone,
        null,
      )

      clone.setValue({ count: 1 })
      expect(Object.is).toHaveBeenCalledOnce()
      expect(Object.is).toHaveBeenLastCalledWith({ count: 0 }, { count: 1 })
    })

    it("assigns custom function", () => {
      const clone = Impulse.of({ count: 0 }).clone(
        Counter.clone,
        Counter.compare,
      )

      clone.setValue({ count: 1 })
      expect(Counter.compare).toHaveBeenCalledOnce()
      expect(Counter.compare).toHaveBeenLastCalledWith(
        { count: 0 },
        { count: 1 },
      )
    })
  })

  describe("when using Impulse#setValue", () => {
    it("uses Impulse#compare", () => {
      const compare = vi.fn(Counter.compare)
      const initial = { count: 0 }
      const impulse = Impulse.of(initial, compare)

      impulse.setValue(Counter.clone)
      expect(impulse.getValue()).toBe(initial)
      expect(compare).toHaveBeenCalledOnce()
      expect(compare).toHaveBeenLastCalledWith({ count: 0 }, { count: 0 })
    })
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
  const impulse = Impulse.of({ count: 0 })

  it("updates value", () => {
    impulse.setValue(Counter.inc)
    expect(impulse.getValue()).toStrictEqual({ count: 1 })
  })

  it("keeps the value", () => {
    const prev = impulse.getValue()
    impulse.setValue((counter) => counter)
    expect(impulse.getValue()).toBe(prev)
  })

  it("updates with the same value", () => {
    const prev = impulse.getValue()
    impulse.setValue(Counter.clone)
    expect(impulse.getValue()).not.toBe(prev)
    expect(impulse.getValue()).toStrictEqual(prev)
  })

  it("updates with the equal value", () => {
    const prev = impulse.getValue()
    impulse.setValue(() => prev)
    expect(impulse.getValue()).toBe(prev)
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

describe("Impulse#clone", () => {
  it("creates new Impulse with clone()", () => {
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone()

    expect(impulse_1).not.toBe(impulse_2)
    expect(impulse_1.getValue()).toBe(impulse_2.getValue())
  })

  it("creates new Impulse with clone(transform)", () => {
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone(Counter.clone)

    expect(impulse_1).not.toBe(impulse_2)
    expect(impulse_1.getValue()).not.toBe(impulse_2.getValue())
    expect(impulse_1.getValue()).toStrictEqual(impulse_2.getValue())
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

describe("Impulse#subscribe", () => {
  it("subscribes and unsubscribes to value changes", () => {
    const impulse = Impulse.of({ count: 0 })
    const spy = vi.fn<[Counter]>()

    impulse.setValue(Counter.inc)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    const unsubscribe = impulse.subscribe(() => {
      spy(impulse.getValue())
    })

    impulse.setValue(Counter.inc)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith({ count: 2 })
    vi.clearAllMocks()

    impulse.setValue(Counter.inc)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith({ count: 3 })
    vi.clearAllMocks()

    unsubscribe()

    impulse.setValue(Counter.inc)
    expect(spy).not.toHaveBeenCalled()
  })

  it("emits the same listener once", () => {
    const spy = vi.fn()
    const impulse = Impulse.of({ count: 0 })
    impulse.subscribe(spy)
    impulse.subscribe(spy)

    impulse.setValue(Counter.inc)
    expect(spy).toHaveBeenCalledOnce()
  })

  it("emits the same listener until it is subscribed at least ones", () => {
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
  })

  it("ignores second unsubscribe call", () => {
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

  it("subscribes multiple listeners", () => {
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

  it("does not emit when a new value is comparably equal", () => {
    const spy = vi.fn()
    const spyCompare = vi.fn(Counter.compare)
    const impulse = Impulse.of({ count: 0 }, spyCompare)
    const unsubscribe = impulse.subscribe(spy)

    impulse.setValue(Counter.clone)
    expect(spy).not.toHaveBeenCalled()
    expect(spyCompare).toHaveBeenCalledOnce()
    expect(spyCompare).toHaveLastReturnedWith(true)
    vi.clearAllMocks()

    impulse.setValue(Counter.clone)
    expect(spy).not.toHaveBeenCalled()
    expect(spyCompare).toHaveBeenCalledOnce()
    expect(spyCompare).toHaveLastReturnedWith(true)
    vi.clearAllMocks()

    unsubscribe()
    impulse.setValue(Counter.clone)
    expect(spy).not.toHaveBeenCalled()
  })

  it("emits when a new value is not comparably equal", () => {
    const spy = vi.fn()
    const impulse = Impulse.of({ count: 0 })
    const unsubscribe = impulse.subscribe(spy)

    impulse.setValue(Counter.clone)
    expect(spy).toHaveBeenCalled()
    vi.clearAllMocks()

    unsubscribe()
    impulse.setValue(Counter.clone)
    expect(spy).not.toHaveBeenCalled()
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
