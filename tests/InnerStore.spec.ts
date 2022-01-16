import { InnerStore } from "../src"

import { Counter } from "./helpers"

describe("InnerStore#key", () => {
  it("creates uniq store keys", () => {
    const state = { count: 0 }
    const store_1 = InnerStore.of(state)
    const store_2 = InnerStore.of(state)

    expect(store_1.key).not.toBe(store_2.key)
    expect(store_1.getState()).toBe(store_2.getState())
  })

  it("keeps key on methods call", () => {
    const store = InnerStore.of({ count: 0 })
    const key = store.key

    store.getState()
    expect(store.key).toBe(key)

    store.setState({ count: 1 })
    expect(store.key).toBe(key)

    store.subscribe(jest.fn)
    expect(store.key).toBe(key)

    store.clone()
    expect(store.key).toBe(key)
  })
})

describe("InnerStore#getState and InnerStore#setState", () => {
  it("sets initial state", () => {
    const store = InnerStore.of(0)

    expect(store.getState()).toBe(0)
  })

  it("changes state with setState(value)", () => {
    const store = InnerStore.of(0)

    store.setState(1)
    expect(store.getState()).toBe(1)

    store.setState(0)
    expect(store.getState()).toBe(0)

    store.setState(2)
    expect(store.getState()).toBe(2)
  })

  it("changes state with setState(transform)", () => {
    const store = InnerStore.of(0)

    store.setState((value) => value + 1)
    expect(store.getState()).toBe(1)

    store.setState((value) => value + 1)
    expect(store.getState()).toBe(2)

    store.setState((value) => value + 1)
    expect(store.getState()).toBe(3)
  })

  it("keeps the state with setState(value, compare)", () => {
    const store = InnerStore.of({ count: 0 })

    const prev_1 = store.getState()
    const state_1 = Counter.clone(prev_1)
    store.setState(state_1, Counter.compare)
    expect(store.getState()).toBe(prev_1)
    expect(store.getState()).not.toBe(state_1)

    const prev_2 = store.getState()
    const state_2 = { count: 1 }
    store.setState(state_2, Counter.compare)
    expect(store.getState()).toBe(state_2)
    expect(store.getState()).not.toBe(prev_2)

    const prev_3 = store.getState()
    const state_3 = Counter.clone(prev_3)
    store.setState(state_3)
    expect(store.getState()).toBe(state_3)
    expect(store.getState()).not.toBe(prev_3)
  })

  it("keeps the state with setState(transform, compare)", () => {
    const store = InnerStore.of({ count: 0 })

    const prev_1 = store.getState()
    store.setState(Counter.clone, Counter.compare)
    expect(store.getState()).toBe(prev_1)

    const prev_2 = store.getState()
    store.setState(Counter.inc, Counter.compare)
    expect(store.getState()).not.toBe(prev_2)
    expect(store.getState()).toStrictEqual({ count: 1 })

    const prev_3 = store.getState()
    store.setState(Counter.clone)
    expect(store.getState()).not.toBe(prev_3)
    expect(store.getState()).toStrictEqual({ count: 1 })
  })

  it("transforms state when reads with getState(transform)", () => {
    const store = InnerStore.of({ count: 0 })

    expect(store.getState()).toStrictEqual({ count: 0 })
    expect(store.getState(Counter.getCount)).toBe(0)

    store.setState({ count: 1 })
    expect(store.getState()).toStrictEqual({ count: 1 })
    expect(store.getState(Counter.getCount)).toBe(1)
  })
})

describe("InnerStore#clone", () => {
  it("creates new store instance with clone()", () => {
    const store_1 = InnerStore.of({ count: 0 })
    const store_2 = store_1.clone()

    expect(store_1).not.toBe(store_2)
    expect(store_1.key).not.toBe(store_2.key)
    expect(store_1.getState()).toBe(store_2.getState())
  })

  it("creates new store instance with clone(transform)", () => {
    const store_1 = InnerStore.of({ count: 0 })
    const store_2 = store_1.clone(Counter.clone)

    expect(store_1).not.toBe(store_2)
    expect(store_1.key).not.toBe(store_2.key)
    expect(store_1.getState()).not.toBe(store_2.getState())
    expect(store_1.getState()).toStrictEqual(store_2.getState())
  })

  it("creates new nested store instance with clone(transform)", () => {
    const store_1 = InnerStore.of({
      count: InnerStore.of(0),
      name: InnerStore.of("John"),
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
  })

  it("creates shallow nested store instance with clone()", () => {
    const store_1 = InnerStore.of({
      count: InnerStore.of(0),
      name: InnerStore.of("John"),
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

describe("InnerStore#subscribe", () => {
  it("subscribes and unsubscribes to state changes", () => {
    const store = InnerStore.of({ count: 0 })
    const spy = jest.fn()

    store.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(0)

    const unsubscribe = store.subscribe(spy)

    store.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(1)

    unsubscribe()

    store.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("emits the same listener once", () => {
    const spy = jest.fn()
    const store = InnerStore.of({ count: 0 })
    const unsubscribe_1 = store.subscribe(spy)
    const unsubscribe_2 = store.subscribe(spy)

    store.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(1)

    unsubscribe_1()
    store.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(2)

    unsubscribe_2()
    store.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it("ignores second unsubscribe call", () => {
    const spy = jest.fn()
    const store = InnerStore.of({ count: 0 })
    const unsubscribe = store.subscribe(spy)

    store.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(1)

    unsubscribe()
    unsubscribe()

    store.setState(Counter.inc)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("subscribes multiple listeners", () => {
    const spy_1 = jest.fn()
    const spy_2 = jest.fn()
    const store = InnerStore.of({ count: 0 })
    const unsubscribe_1 = store.subscribe(spy_1)
    const unsubscribe_2 = store.subscribe(spy_2)

    store.setState(Counter.inc)
    expect(spy_1).toHaveBeenCalledTimes(1)
    expect(spy_2).toHaveBeenCalledTimes(1)

    unsubscribe_1()
    store.setState(Counter.inc)
    expect(spy_1).toHaveBeenCalledTimes(1)
    expect(spy_2).toHaveBeenCalledTimes(2)

    unsubscribe_2()
    store.setState(Counter.inc)
    expect(spy_1).toHaveBeenCalledTimes(1)
    expect(spy_2).toHaveBeenCalledTimes(2)
  })

  it("does not emit when a state is comparably equal", () => {
    const spy = jest.fn()
    const spyCompare = jest.fn(Counter.compare)
    const store = InnerStore.of({ count: 0 })
    const unsubscribe = store.subscribe(spy)

    store.setState(Counter.clone, spyCompare)
    expect(spy).toHaveBeenCalledTimes(0)
    expect(spyCompare).toHaveBeenCalledTimes(1)

    store.setState(Counter.clone)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spyCompare).toHaveBeenCalledTimes(1)

    store.setState(Counter.clone, spyCompare)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spyCompare).toHaveBeenCalledTimes(2)

    unsubscribe()
    store.setState(Counter.clone)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
