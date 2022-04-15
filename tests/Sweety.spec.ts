import { Sweety } from "../src"
import { isEqual } from "../src/utils"

import { Counter } from "./common"

describe("Sweety#key", () => {
  it.concurrent("creates uniq store keys", () => {
    const state = { count: 0 }
    const store_1 = Sweety.of(state)
    const store_2 = Sweety.of(state)

    expect(store_1.key).not.toBe(store_2.key)
    expect(store_1.getState()).toBe(store_2.getState())
  })

  it.concurrent("keeps key on methods call", () => {
    const store = Sweety.of({ count: 0 })
    const key = store.key

    store.getState()
    expect(store.key).toBe(key)

    store.setState({ count: 1 })
    expect(store.key).toBe(key)

    store.subscribe(vi.fn)
    expect(store.key).toBe(key)

    store.clone()
    expect(store.key).toBe(key)
  })
})

describe("Sweety#compare", () => {
  describe("when creating a store with Sweety.of", () => {
    it.concurrent("assigns isEqual by default", () => {
      const store = Sweety.of({ count: 0 })

      expect(store.compare).toBe(isEqual)
    })

    it.concurrent("assigns isEqual by `null`", () => {
      const store = Sweety.of({ count: 0 }, null)

      expect(store.compare).toBe(isEqual)
    })

    it.concurrent("assigns custom function", () => {
      const store = Sweety.of({ count: 0 }, Counter.compare)

      expect(store.compare).toBe(Counter.compare)
    })
  })

  describe("when creating a store with Sweety.clone", () => {
    it.concurrent("inherits default the source store compare", () => {
      const store = Sweety.of({ count: 0 })

      expect(store.clone().compare).toBe(store.compare)
      expect(store.clone().compare).toBe(isEqual)
    })

    it.concurrent("inherits custom the source store compare", () => {
      const store = Sweety.of({ count: 0 }, Counter.compare)

      expect(store.clone().compare).toBe(store.compare)
      expect(store.clone().compare).toBe(Counter.compare)
    })

    it.concurrent("assigns isEqual by `null`", () => {
      const store = Sweety.of({ count: 0 }, Counter.compare)

      expect(store.clone(Counter.clone, null).compare).toBe(isEqual)
    })

    it.concurrent("assigns custom function", () => {
      const store = Sweety.of({ count: 0 })

      expect(store.clone(Counter.clone, Counter.compare).compare).toBe(
        Counter.compare,
      )
    })
  })

  describe("when using Sweety#setState", () => {
    it.concurrent("uses Sweety#compare by default", () => {
      const initial = { count: 0 }
      const store = Sweety.of(initial, Counter.compare)

      store.setState(Counter.clone)
      expect(store.getState()).toBe(initial)
    })

    it.concurrent("replaces with isEqual when `null`", () => {
      const initial = { count: 0 }
      const store = Sweety.of(initial, Counter.compare)

      store.setState(Counter.clone, null)
      expect(store.getState()).not.toBe(initial)
      expect(store.getState()).toStrictEqual(initial)
    })

    it.concurrent("replaces with custom function", () => {
      const initial = { count: 0 }
      const store = Sweety.of(initial, Counter.compare)

      store.setState(Counter.inc, () => true)
      expect(store.getState()).toBe(initial)
    })
  })
})

describe("Sweety#setState(value)", () => {
  const store = Sweety.of({ count: 0 })

  it("updates state", () => {
    const next = { count: 1 }
    store.setState(next)
    expect(store.getState()).toBe(next)
  })

  it("updates with the same state", () => {
    const next = { count: 1 }
    store.setState(next)
    expect(store.getState()).toBe(next)
  })

  it("updates with equal state", () => {
    const prev = store.getState()
    store.setState(prev)
    expect(store.getState()).toBe(prev)
  })
})

describe("Sweety#setState(transform)", () => {
  const store = Sweety.of({ count: 0 })

  it("updates state", () => {
    store.setState(Counter.inc)
    expect(store.getState()).toStrictEqual({ count: 1 })
  })

  it("keeps the state", () => {
    const prev = store.getState()
    store.setState((counter) => counter)
    expect(store.getState()).toBe(prev)
  })

  it("updates with the same state", () => {
    const prev = store.getState()
    store.setState(Counter.clone)
    expect(store.getState()).not.toBe(prev)
    expect(store.getState()).toStrictEqual(prev)
  })

  it("updates with the equal state", () => {
    const prev = store.getState()
    store.setState(() => prev)
    expect(store.getState()).toBe(prev)
  })
})

describe("Sweety#setState(value, compare)", () => {
  let prev: Counter = { count: 0 }
  const store = Sweety.of(prev)

  beforeEach(() => {
    prev = store.getState()
  })

  it("keeps equal state", () => {
    const clone = Counter.clone(prev)
    store.setState(clone, Counter.compare)

    expect(store.getState()).toBe(prev)
    expect(store.getState()).not.toBe(clone)
  })

  it("replaces with not equal state", () => {
    const replacement = { count: 1 }
    store.setState(replacement, Counter.compare)

    expect(store.getState()).toBe(replacement)
    expect(store.getState()).not.toBe(prev)
  })

  it("replaces with same but not equal", () => {
    const clone = Counter.clone(prev)
    store.setState(clone)

    expect(store.getState()).toBe(clone)
    expect(store.getState()).not.toBe(prev)
  })
})

describe("Sweety#setState(transform, compare)", () => {
  let prev: Counter = { count: 0 }
  const store = Sweety.of(prev)

  beforeEach(() => {
    prev = store.getState()
  })

  it("keeps equal state", () => {
    store.setState(Counter.clone, Counter.compare)
    expect(store.getState()).toBe(prev)
  })

  it("replaces with not equal state", () => {
    store.setState(Counter.inc, Counter.compare)
    expect(store.getState()).not.toBe(prev)
    expect(store.getState()).toStrictEqual({ count: 1 })
  })

  it("replaces with same but not equal", () => {
    store.setState(Counter.clone)
    expect(store.getState()).not.toBe(prev)
    expect(store.getState()).toStrictEqual({ count: 1 })
  })
})

describe("Sweety#getState(transform)", () => {
  const initial = { count: 0 }
  const store = Sweety.of(initial)

  it("gets initial state", () => {
    expect(store.getState()).toBe(initial)
    expect(store.getState(Counter.getCount)).toBe(0)
  })

  it("gets updates state", () => {
    store.setState(Counter.inc)
    expect(store.getState()).toStrictEqual({ count: 1 })
    expect(store.getState(Counter.getCount)).toBe(1)
  })
})

describe("Sweety#clone", () => {
  it.concurrent("creates new store instance with clone()", () => {
    const store_1 = Sweety.of({ count: 0 })
    const store_2 = store_1.clone()

    expect(store_1).not.toBe(store_2)
    expect(store_1.key).not.toBe(store_2.key)
    expect(store_1.getState()).toBe(store_2.getState())
  })

  it.concurrent("creates new store instance with clone(transform)", () => {
    const store_1 = Sweety.of({ count: 0 })
    const store_2 = store_1.clone(Counter.clone)

    expect(store_1).not.toBe(store_2)
    expect(store_1.key).not.toBe(store_2.key)
    expect(store_1.getState()).not.toBe(store_2.getState())
    expect(store_1.getState()).toStrictEqual(store_2.getState())
  })

  it.concurrent(
    "creates new nested store instance with clone(transform)",
    () => {
      const store_1 = Sweety.of({
        count: Sweety.of(0),
        name: Sweety.of("John"),
      })
      const store_2 = store_1.clone(({ count, name }) => ({
        count: count.clone(),
        name: name.clone(),
      }))

      expect(store_1).not.toBe(store_2)
      expect(store_1.key).not.toBe(store_2.key)
      expect(store_1.getState()).not.toBe(store_2.getState())
      expect(store_1.getState().count).not.toBe(store_2.getState().count)
      expect(store_1.getState().name).not.toBe(store_2.getState().name)
      expect(
        store_1.getState(({ count, name }) => ({
          count: count.getState(),
          name: name.getState(),
        })),
      ).toStrictEqual(
        store_2.getState(({ count, name }) => ({
          count: count.getState(),
          name: name.getState(),
        })),
      )

      // the nested stores are independent
      store_1.getState().count.setState(1)
      expect(store_1.getState().count.getState()).toBe(1)
      expect(store_2.getState().count.getState()).toBe(0)

      store_1.getState().name.setState("Doe")
      expect(store_1.getState().name.getState()).toBe("Doe")
      expect(store_2.getState().name.getState()).toBe("John")
    },
  )

  it.concurrent("creates shallow nested store instance with clone()", () => {
    const store_1 = Sweety.of({
      count: Sweety.of(0),
      name: Sweety.of("John"),
    })
    const store_2 = store_1.clone()

    expect(store_1).not.toBe(store_2)
    expect(store_1.key).not.toBe(store_2.key)
    expect(store_1.getState()).toBe(store_2.getState())
    expect(store_1.getState().count).toBe(store_2.getState().count)
    expect(store_1.getState().name).toBe(store_2.getState().name)
    expect(
      store_1.getState(({ count, name }) => ({
        count: count.getState(),
        name: name.getState(),
      })),
    ).toStrictEqual(
      store_2.getState(({ count, name }) => ({
        count: count.getState(),
        name: name.getState(),
      })),
    )

    // the nested stores are dependent
    store_1.getState().count.setState(1)
    expect(store_1.getState().count.getState()).toBe(1)
    expect(store_2.getState().count.getState()).toBe(1)

    store_1.getState().name.setState("Doe")
    expect(store_1.getState().name.getState()).toBe("Doe")
    expect(store_2.getState().name.getState()).toBe("Doe")
  })
})

describe("Sweety#subscribe", () => {
  it.concurrent("subscribes and unsubscribes to state changes", () => {
    const store = Sweety.of({ count: 0 })
    const spy = vi.fn()

    store.setState(Counter.inc)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    const unsubscribe = store.subscribe(spy)

    store.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    unsubscribe()

    store.setState(Counter.inc)
    expect(spy).not.toHaveBeenCalled()
  })

  it.concurrent("emits the same listener once", () => {
    const spy = vi.fn()
    const store = Sweety.of({ count: 0 })
    const unsubscribe_1 = store.subscribe(spy)
    const unsubscribe_2 = store.subscribe(spy)

    store.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    unsubscribe_1()
    store.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    unsubscribe_2()
    store.setState(Counter.inc)
    expect(spy).not.toHaveBeenCalled()
  })

  it.concurrent("ignores second unsubscribe call", () => {
    const spy = vi.fn()
    const store = Sweety.of({ count: 0 })
    const unsubscribe = store.subscribe(spy)

    store.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    unsubscribe()
    unsubscribe()

    store.setState(Counter.inc)
    expect(spy).not.toHaveBeenCalled()
  })

  it.concurrent("subscribes multiple listeners", () => {
    const spy_1 = vi.fn()
    const spy_2 = vi.fn()
    const store = Sweety.of({ count: 0 })
    const unsubscribe_1 = store.subscribe(spy_1)
    const unsubscribe_2 = store.subscribe(spy_2)

    store.setState(Counter.inc)
    expect(spy_1).toHaveBeenCalledTimes(1)
    expect(spy_2).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    unsubscribe_1()
    store.setState(Counter.inc)
    expect(spy_1).not.toHaveBeenCalled()
    expect(spy_2).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    unsubscribe_2()
    store.setState(Counter.inc)
    expect(spy_1).not.toHaveBeenCalled()
    expect(spy_2).not.toHaveBeenCalled()
  })

  it.concurrent("does not emit when a new state is comparably equal", () => {
    const spy = vi.fn()
    const spyCompare = vi.fn(Counter.compare)
    const store = Sweety.of({ count: 0 })
    const unsubscribe = store.subscribe(spy)

    store.setState(Counter.clone, spyCompare)
    expect(spy).not.toHaveBeenCalled()
    expect(spyCompare).toHaveBeenCalledTimes(1)
    expect(spyCompare).toHaveLastReturnedWith(true)
    vi.clearAllMocks()

    store.setState(Counter.clone)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spyCompare).not.toHaveBeenCalled()
    vi.clearAllMocks()

    expect(spy.mock.calls).toHaveLength(0)
    store.setState(Counter.clone, spyCompare)
    expect(spy).not.toHaveBeenCalled()
    expect(spyCompare).toHaveBeenCalledTimes(1)
    expect(spyCompare).toHaveLastReturnedWith(true)
    vi.clearAllMocks()

    unsubscribe()
    store.setState(Counter.clone)
    expect(spy).not.toHaveBeenCalled()
  })
})
