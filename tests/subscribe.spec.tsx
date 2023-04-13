import { Impulse, batch } from "../src"
import { subscribe } from "../src/subscribe"

import { Counter } from "./common"

describe("single Impulse", () => {
  it.concurrent("executes listener on init", () => {
    const spy = vi.fn()
    const impulse = Impulse.of(1)

    subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(1)
    expect(impulse).toHaveProperty("emitters.size", 1)
  })

  it.concurrent("executes listener on update", () => {
    const spy = vi.fn()
    const impulse = Impulse.of(1)

    subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    spy.mockReset()
    impulse.setValue(2)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(2)
  })

  it.concurrent("doesn't execute listener after unsubscribe", () => {
    const spy = vi.fn()
    const impulse = Impulse.of(1)

    const unsubscribe = subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    unsubscribe()

    spy.mockReset()
    impulse.setValue(2)
    expect(spy).not.toHaveBeenCalled()
    expect(impulse).toHaveProperty("emitters.size", 0)
  })

  it.concurrent("ignores second unsubscribe", () => {
    const spy = vi.fn()
    const impulse = Impulse.of(1)

    const unsubscribe = subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    unsubscribe()
    unsubscribe()

    spy.mockReset()
    impulse.setValue(2)
    expect(spy).not.toHaveBeenCalled()
  })

  it.concurrent("executes listener on every Impulse update", () => {
    const spy = vi.fn()
    const impulse = Impulse.of(1)

    subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    spy.mockReset()
    impulse.setValue(2)
    impulse.setValue(3)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith(3)
    expect(impulse).toHaveProperty("emitters.size", 1)
  })

  it.concurrent("executes listener ones for batched Impulse updates", () => {
    const spy = vi.fn()
    const impulse = Impulse.of(1)

    subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    spy.mockReset()
    batch(() => {
      impulse.setValue(2)
      impulse.setValue(3)
    })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(3)
    expect(impulse).toHaveProperty("emitters.size", 1)
  })

  it.concurrent(
    "doesn't execute listener when Impulse value does not change",
    () => {
      const spy = vi.fn()
      const impulse = Impulse.of(1)

      subscribe((scope) => {
        spy(impulse.getValue(scope))
      })

      spy.mockReset()
      impulse.setValue(1)
      expect(spy).not.toHaveBeenCalled()
      expect(impulse).toHaveProperty("emitters.size", 1)
    },
  )

  it.concurrent(
    "doesn't execute listener when Impulse value comparably the same",
    () => {
      const spy = vi.fn()
      const impulse = Impulse.of({ count: 1 }, Counter.compare)

      subscribe((scope) => {
        spy(impulse.getValue(scope))
      })

      spy.mockReset()
      impulse.setValue({ count: 1 })
      expect(spy).not.toHaveBeenCalled()

      spy.mockReset()
      impulse.setValue({ count: 2 })
      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenLastCalledWith({ count: 2 })
      expect(impulse).toHaveProperty("emitters.size", 1)
    },
  )
})

describe("multiple Impulses", () => {
  it.concurrent("executes listener on init", () => {
    const spy = vi.fn()
    const impulse_1 = Impulse.of(1)
    const impulse_2 = Impulse.of(2)

    subscribe((scope) => {
      spy(impulse_1.getValue(scope) + impulse_2.getValue(scope))
    })

    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(3)
    expect(impulse_1).toHaveProperty("emitters.size", 1)
    expect(impulse_2).toHaveProperty("emitters.size", 1)
  })

  it.concurrent("executes listener on update", () => {
    const spy = vi.fn()
    const impulse_1 = Impulse.of(1)
    const impulse_2 = Impulse.of(2)

    subscribe((scope) => {
      spy(impulse_1.getValue(scope) + impulse_2.getValue(scope))
    })

    spy.mockReset()
    impulse_1.setValue(3)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(5)

    spy.mockReset()
    impulse_2.setValue(4)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(7)
  })

  it.concurrent("doesn't execute listener after unsubscribe", () => {
    const spy = vi.fn()
    const impulse_1 = Impulse.of(1)
    const impulse_2 = Impulse.of(2)

    const unsubscribe = subscribe((scope) => {
      spy(impulse_1.getValue(scope) + impulse_2.getValue(scope))
    })

    unsubscribe()
    expect(impulse_1).toHaveProperty("emitters.size", 0)
    expect(impulse_2).toHaveProperty("emitters.size", 0)

    spy.mockReset()
    impulse_1.setValue(4)
    impulse_2.setValue(5)
    expect(spy).not.toHaveBeenCalled()
  })

  it.concurrent(
    "doesn't execute conditional listener when conditional Impulse changes",
    () => {
      const spy = vi.fn()
      const impulse_1 = Impulse.of(1)
      const impulse_2 = Impulse.of(2)

      subscribe((scope) => {
        if (impulse_1.getValue(scope) > 1) {
          spy(impulse_1.getValue(scope) + impulse_2.getValue(scope))
        }
      })
      expect(impulse_1).toHaveProperty("emitters.size", 1)
      expect(impulse_2).toHaveProperty("emitters.size", 0)

      spy.mockReset()
      impulse_2.setValue(3)
      expect(spy).not.toHaveBeenCalled()
      expect(impulse_1).toHaveProperty("emitters.size", 1)
      expect(impulse_2).toHaveProperty("emitters.size", 0)

      spy.mockReset()
      impulse_1.setValue(2)
      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenLastCalledWith(5)
      expect(impulse_1).toHaveProperty("emitters.size", 1)
      expect(impulse_2).toHaveProperty("emitters.size", 1)

      spy.mockReset()
      impulse_2.setValue(4)
      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenLastCalledWith(6)

      expect(impulse_1).toHaveProperty("emitters.size", 1)
      expect(impulse_2).toHaveProperty("emitters.size", 1)

      spy.mockReset()
      impulse_1.setValue(1)
      expect(spy).not.toHaveBeenCalled()
      expect(impulse_1).toHaveProperty("emitters.size", 1)
      expect(impulse_2).toHaveProperty("emitters.size", 0)
    },
  )

  it.concurrent("executes listener on every Impulse update", () => {
    const spy = vi.fn()
    const impulse_1 = Impulse.of(1)
    const impulse_2 = Impulse.of(2)

    subscribe((scope) => {
      spy(impulse_1.getValue(scope) + impulse_2.getValue(scope))
    })

    spy.mockReset()
    impulse_1.setValue(2)
    impulse_2.setValue(3)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith(5)
  })

  it.concurrent("executes listener ones for batched Impulse updates", () => {
    const spy = vi.fn()
    const impulse_1 = Impulse.of(1)
    const impulse_2 = Impulse.of(2)

    subscribe((scope) => {
      spy(impulse_1.getValue(scope) + impulse_2.getValue(scope))
    })

    spy.mockReset()
    batch(() => {
      impulse_1.setValue(2)
      impulse_2.setValue(3)
    })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(5)
  })
})

describe("nested Impulses", () => {
  it.concurrent("executes listener on init", () => {
    const spy = vi.fn()
    const impulse_1 = Impulse.of(1)
    const impulse_2 = Impulse.of(2)
    const impulse_3 = Impulse.of({
      first: impulse_1,
      second: impulse_2,
    })

    subscribe((scope) => {
      spy(
        impulse_3.getValue(
          scope,
          ({ first, second }) => first.getValue(scope) + second.getValue(scope),
        ),
      )
    })

    expect(impulse_1).toHaveProperty("emitters.size", 1)
    expect(impulse_2).toHaveProperty("emitters.size", 1)
    expect(impulse_3).toHaveProperty("emitters.size", 1)

    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(3)
  })

  it.concurrent("executes listener on update", () => {
    const spy = vi.fn()
    const impulse_1 = Impulse.of(1)
    const impulse_2 = Impulse.of(2)
    const impulse_3 = Impulse.of({
      first: impulse_1,
      second: impulse_2,
    })

    subscribe((scope) => {
      spy(
        impulse_3.getValue(
          scope,
          ({ first, second }) => first.getValue(scope) + second.getValue(scope),
        ),
      )
    })

    spy.mockReset()
    impulse_1.setValue(3)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(5)

    spy.mockReset()
    impulse_2.setValue(4)
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(7)

    spy.mockReset()
    impulse_3.setValue({
      first: impulse_2,
      second: impulse_1,
    })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(7)
  })
})
