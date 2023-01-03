import { Impulse } from "../src"
import { isEqual } from "../src/utils"

import { Counter } from "./common"

describe("Impulse#compare", () => {
  describe("when creating a impulse with Impulse.of", () => {
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

  describe("when creating a impulse with Impulse.clone", () => {
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

  describe("when using Impulse#setState", () => {
    it.concurrent("uses Impulse#compare by default", () => {
      const initial = { count: 0 }
      const impulse = Impulse.of(initial, Counter.compare)

      impulse.setState(Counter.clone)
      expect(impulse.getState()).toBe(initial)
    })

    it.concurrent("replaces with isEqual when `null`", () => {
      const initial = { count: 0 }
      const impulse = Impulse.of(initial, Counter.compare)

      impulse.setState(Counter.clone, null)
      expect(impulse.getState()).not.toBe(initial)
      expect(impulse.getState()).toStrictEqual(initial)
    })

    it.concurrent("replaces with custom function", () => {
      const initial = { count: 0 }
      const impulse = Impulse.of(initial, Counter.compare)

      impulse.setState(Counter.inc, () => true)
      expect(impulse.getState()).toBe(initial)
    })
  })
})

describe("Impulse#setState(value)", () => {
  const impulse = Impulse.of({ count: 0 })

  it("updates state", () => {
    const next = { count: 1 }
    impulse.setState(next)
    expect(impulse.getState()).toBe(next)
  })

  it("updates with the same state", () => {
    const next = { count: 1 }
    impulse.setState(next)
    expect(impulse.getState()).toBe(next)
  })

  it("updates with equal state", () => {
    const prev = impulse.getState()
    impulse.setState(prev)
    expect(impulse.getState()).toBe(prev)
  })
})

describe("Impulse#setState(transform)", () => {
  const impulse = Impulse.of({ count: 0 })

  it("updates state", () => {
    impulse.setState(Counter.inc)
    expect(impulse.getState()).toStrictEqual({ count: 1 })
  })

  it("keeps the state", () => {
    const prev = impulse.getState()
    impulse.setState((counter) => counter)
    expect(impulse.getState()).toBe(prev)
  })

  it("updates with the same state", () => {
    const prev = impulse.getState()
    impulse.setState(Counter.clone)
    expect(impulse.getState()).not.toBe(prev)
    expect(impulse.getState()).toStrictEqual(prev)
  })

  it("updates with the equal state", () => {
    const prev = impulse.getState()
    impulse.setState(() => prev)
    expect(impulse.getState()).toBe(prev)
  })
})

describe("Impulse#setState(value, compare)", () => {
  let prev: Counter = { count: 0 }
  const impulse = Impulse.of(prev)

  beforeEach(() => {
    prev = impulse.getState()
  })

  it("keeps equal state", () => {
    const clone = Counter.clone(prev)
    impulse.setState(clone, Counter.compare)

    expect(impulse.getState()).toBe(prev)
    expect(impulse.getState()).not.toBe(clone)
  })

  it("replaces with not equal state", () => {
    const replacement = { count: 1 }
    impulse.setState(replacement, Counter.compare)

    expect(impulse.getState()).toBe(replacement)
    expect(impulse.getState()).not.toBe(prev)
  })

  it("replaces with same but not equal", () => {
    const clone = Counter.clone(prev)
    impulse.setState(clone)

    expect(impulse.getState()).toBe(clone)
    expect(impulse.getState()).not.toBe(prev)
  })
})

describe("Impulse#setState(transform, compare)", () => {
  let prev: Counter = { count: 0 }
  const impulse = Impulse.of(prev)

  beforeEach(() => {
    prev = impulse.getState()
  })

  it("keeps equal state", () => {
    impulse.setState(Counter.clone, Counter.compare)
    expect(impulse.getState()).toBe(prev)
  })

  it("replaces with not equal state", () => {
    impulse.setState(Counter.inc, Counter.compare)
    expect(impulse.getState()).not.toBe(prev)
    expect(impulse.getState()).toStrictEqual({ count: 1 })
  })

  it("replaces with same but not equal", () => {
    impulse.setState(Counter.clone)
    expect(impulse.getState()).not.toBe(prev)
    expect(impulse.getState()).toStrictEqual({ count: 1 })
  })
})

describe("Impulse#getState(transform)", () => {
  const initial = { count: 0 }
  const impulse = Impulse.of(initial)

  it("gets initial state", () => {
    expect(impulse.getState()).toBe(initial)
    expect(impulse.getState(Counter.getCount)).toBe(0)
  })

  it("gets updates state", () => {
    impulse.setState(Counter.inc)
    expect(impulse.getState()).toStrictEqual({ count: 1 })
    expect(impulse.getState(Counter.getCount)).toBe(1)
  })
})

describe("Impulse#clone", () => {
  it.concurrent("creates new Impulse with clone()", () => {
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone()

    expect(impulse_1).not.toBe(impulse_2)
    expect(impulse_1.getState()).toBe(impulse_2.getState())
  })

  it.concurrent("creates new Impulse with clone(transform)", () => {
    const impulse_1 = Impulse.of({ count: 0 })
    const impulse_2 = impulse_1.clone(Counter.clone)

    expect(impulse_1).not.toBe(impulse_2)
    expect(impulse_1.getState()).not.toBe(impulse_2.getState())
    expect(impulse_1.getState()).toStrictEqual(impulse_2.getState())
  })

  it.concurrent("creates new nested Impulse with clone(transform)", () => {
    const impulse_1 = Impulse.of({
      count: Impulse.of(0),
      name: Impulse.of("John"),
    })
    const impulse_2 = impulse_1.clone(({ count, name }) => ({
      count: count.clone(),
      name: name.clone(),
    }))

    expect(impulse_1).not.toBe(impulse_2)
    expect(impulse_1.getState()).not.toBe(impulse_2.getState())
    expect(impulse_1.getState().count).not.toBe(impulse_2.getState().count)
    expect(impulse_1.getState().name).not.toBe(impulse_2.getState().name)
    expect(
      impulse_1.getState(({ count, name }) => ({
        count: count.getState(),
        name: name.getState(),
      })),
    ).toStrictEqual(
      impulse_2.getState(({ count, name }) => ({
        count: count.getState(),
        name: name.getState(),
      })),
    )

    // the nested impulses are independent
    impulse_1.getState().count.setState(1)
    expect(impulse_1.getState().count.getState()).toBe(1)
    expect(impulse_2.getState().count.getState()).toBe(0)

    impulse_1.getState().name.setState("Doe")
    expect(impulse_1.getState().name.getState()).toBe("Doe")
    expect(impulse_2.getState().name.getState()).toBe("John")
  })

  it.concurrent("creates shallow nested Impulse with clone()", () => {
    const impulse_1 = Impulse.of({
      count: Impulse.of(0),
      name: Impulse.of("John"),
    })
    const impulse_2 = impulse_1.clone()

    expect(impulse_1).not.toBe(impulse_2)
    expect(impulse_1.getState()).toBe(impulse_2.getState())
    expect(impulse_1.getState().count).toBe(impulse_2.getState().count)
    expect(impulse_1.getState().name).toBe(impulse_2.getState().name)
    expect(
      impulse_1.getState(({ count, name }) => ({
        count: count.getState(),
        name: name.getState(),
      })),
    ).toStrictEqual(
      impulse_2.getState(({ count, name }) => ({
        count: count.getState(),
        name: name.getState(),
      })),
    )

    // the nested impulses are dependent
    impulse_1.getState().count.setState(1)
    expect(impulse_1.getState().count.getState()).toBe(1)
    expect(impulse_2.getState().count.getState()).toBe(1)

    impulse_1.getState().name.setState("Doe")
    expect(impulse_1.getState().name.getState()).toBe("Doe")
    expect(impulse_2.getState().name.getState()).toBe("Doe")
  })
})

describe("Impulse#subscribe", () => {
  it.concurrent("subscribes and unsubscribes to state changes", () => {
    const impulse = Impulse.of({ count: 0 })
    const spy = vi.fn<[Counter]>()

    impulse.setState(Counter.inc)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    const unsubscribe = impulse.subscribe(() => {
      spy(impulse.getState())
    })

    impulse.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith({ count: 2 })
    vi.clearAllMocks()

    unsubscribe()

    impulse.setState(Counter.inc)
    expect(spy).not.toHaveBeenCalled()
  })

  it.concurrent("emits the same listener once", () => {
    const spy = vi.fn()
    const impulse = Impulse.of({ count: 0 })
    const unsubscribe_1 = impulse.subscribe(spy)
    const unsubscribe_2 = impulse.subscribe(spy)

    impulse.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(1)

    unsubscribe_1()
    unsubscribe_2()
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
      impulse.setState(Counter.inc)
      expect(spy).toHaveBeenCalledTimes(1)
      vi.clearAllMocks()

      unsubscribe_2()
      impulse.setState(Counter.inc)
      expect(spy).toHaveBeenCalledTimes(1)
      vi.clearAllMocks()

      unsubscribe_3()
      impulse.setState(Counter.inc)
      expect(spy).not.toHaveBeenCalled()
    },
  )

  it.concurrent("ignores second unsubscribe call", () => {
    const spy = vi.fn()
    const impulse = Impulse.of({ count: 0 })
    const unsubscribe = impulse.subscribe(spy)

    impulse.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    unsubscribe()
    unsubscribe()

    impulse.setState(Counter.inc)
    expect(spy).not.toHaveBeenCalled()
  })

  it.concurrent("subscribes multiple listeners", () => {
    const spy_1 = vi.fn()
    const spy_2 = vi.fn()
    const impulse = Impulse.of({ count: 0 })
    const unsubscribe_1 = impulse.subscribe(spy_1)
    const unsubscribe_2 = impulse.subscribe(spy_2)

    impulse.setState(Counter.inc)
    expect(spy_1).toHaveBeenCalledTimes(1)
    expect(spy_2).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    unsubscribe_1()
    impulse.setState(Counter.inc)
    expect(spy_1).not.toHaveBeenCalled()
    expect(spy_2).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    unsubscribe_2()
    impulse.setState(Counter.inc)
    expect(spy_1).not.toHaveBeenCalled()
    expect(spy_2).not.toHaveBeenCalled()
  })

  it.concurrent("does not emit when a new state is comparably equal", () => {
    const spy = vi.fn()
    const spyCompare = vi.fn(Counter.compare)
    const impulse = Impulse.of({ count: 0 })
    const unsubscribe = impulse.subscribe(spy)

    impulse.setState(Counter.clone, spyCompare)
    expect(spy).not.toHaveBeenCalled()
    expect(spyCompare).toHaveBeenCalledTimes(1)
    expect(spyCompare).toHaveLastReturnedWith(true)
    vi.clearAllMocks()

    impulse.setState(Counter.clone)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spyCompare).not.toHaveBeenCalled()
    vi.clearAllMocks()

    expect(spy.mock.calls).toHaveLength(0)
    impulse.setState(Counter.clone, spyCompare)
    expect(spy).not.toHaveBeenCalled()
    expect(spyCompare).toHaveBeenCalledTimes(1)
    expect(spyCompare).toHaveLastReturnedWith(true)
    vi.clearAllMocks()

    unsubscribe()
    impulse.setState(Counter.clone)
    expect(spy).not.toHaveBeenCalled()
  })
})

describe("Impulse#toJSON()", () => {
  it.concurrent("converts state to JSON", () => {
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
  ])("converts %s state to string", (_, state, expected) => {
    expect(String(Impulse.of(state))).toBe(expected)
  })
})
