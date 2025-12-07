import { act, renderHook } from "@testing-library/react"

import { Impulse, batch, subscribe, useScoped } from "../src"

import { Counter } from "./common"

describe("single Impulse", () => {
  it("executes listener on init", () => {
    const spy = vi.fn()
    const impulse = Impulse(1)

    subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith(1)
    expect(impulse).toHaveEmittersSize(1)
  })

  it("executes listener on update", () => {
    const spy = vi.fn()
    const impulse = Impulse(1)

    subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    spy.mockReset()
    impulse.setValue(2)
    expect(spy).toHaveBeenCalledExactlyOnceWith(2)
    expect(impulse).toHaveEmittersSize(1)
  })

  it("executes listener cleanup", () => {
    const cleanup = vi.fn()
    const impulse = Impulse(1)

    const unsubscribe = subscribe((scope) => {
      const count = impulse.getValue(scope)

      if (count === 2) {
        return
      }

      return () => {
        cleanup(count)
      }
    })

    expect(cleanup).not.toHaveBeenCalled()

    impulse.setValue(2)
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(1)
    vi.clearAllMocks()

    impulse.setValue(5)
    expect(cleanup).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.setValue(7)
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(5)
    vi.clearAllMocks()

    unsubscribe()
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(7)
    vi.clearAllMocks()

    impulse.setValue(9)
    expect(cleanup).not.toHaveBeenCalled()
  })

  it("doesn't execute listener after unsubscribe", () => {
    const spy = vi.fn()
    const impulse = Impulse(1)

    const unsubscribe = subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    unsubscribe()

    spy.mockReset()
    impulse.setValue(2)
    expect(spy).not.toHaveBeenCalled()
    expect(impulse).toHaveEmittersSize(0)
  })

  it("ignores second unsubscribe", () => {
    const spy = vi.fn()
    const impulse = Impulse(1)

    const unsubscribe = subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    unsubscribe()
    unsubscribe()

    spy.mockReset()
    impulse.setValue(2)
    expect(spy).not.toHaveBeenCalled()
    expect(impulse).toHaveEmittersSize(0)
  })

  it("executes listener on every Impulse update", () => {
    const spy = vi.fn()
    const impulse = Impulse(1)

    subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    spy.mockReset()
    impulse.setValue(2)
    impulse.setValue(3)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith(3)
    expect(impulse).toHaveEmittersSize(1)
  })

  it("executes listener ones for batched Impulse updates", () => {
    const spy = vi.fn()
    const impulse = Impulse(1)

    subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    spy.mockReset()
    batch(() => {
      impulse.setValue(2)
      impulse.setValue(3)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
    expect(impulse).toHaveEmittersSize(1)
  })

  it("doesn't execute listener when Impulse value does not change", () => {
    const spy = vi.fn()
    const impulse = Impulse(1)

    subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    spy.mockReset()
    impulse.setValue(1)
    expect(spy).not.toHaveBeenCalled()
    expect(impulse).toHaveEmittersSize(1)
  })

  it("doesn't execute listener when Impulse value comparably the same", () => {
    const spy = vi.fn()
    const impulse = Impulse({ count: 1 }, { equals: Counter.equals })

    subscribe((scope) => {
      spy(impulse.getValue(scope))
    })

    spy.mockReset()
    impulse.setValue({ count: 1 })
    expect(spy).not.toHaveBeenCalled()

    spy.mockReset()
    impulse.setValue({ count: 2 })
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 2 })
    expect(impulse).toHaveEmittersSize(1)
  })
})

describe("multiple Impulses", () => {
  it("executes listener on init", () => {
    const spy = vi.fn()
    const impulse1 = Impulse(1)
    const impulse2 = Impulse(2)

    subscribe((scope) => {
      spy(impulse1.getValue(scope) + impulse2.getValue(scope))
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
    expect(impulse1).toHaveEmittersSize(1)
    expect(impulse2).toHaveEmittersSize(1)
  })

  it("executes listener on update", () => {
    const spy = vi.fn()
    const impulse1 = Impulse(1)
    const impulse2 = Impulse(2)

    subscribe((scope) => {
      spy(impulse1.getValue(scope) + impulse2.getValue(scope))
    })

    spy.mockReset()
    impulse1.setValue(3)
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)

    spy.mockReset()
    impulse2.setValue(4)
    expect(spy).toHaveBeenCalledExactlyOnceWith(7)
    expect(impulse1).toHaveEmittersSize(1)
    expect(impulse2).toHaveEmittersSize(1)
  })

  it("doesn't execute listener after unsubscribe", () => {
    const spy = vi.fn()
    const impulse1 = Impulse(1)
    const impulse2 = Impulse(2)

    const unsubscribe = subscribe((scope) => {
      spy(impulse1.getValue(scope) + impulse2.getValue(scope))
    })

    unsubscribe()
    expect(impulse1).toHaveEmittersSize(0)
    expect(impulse2).toHaveEmittersSize(0)

    spy.mockReset()
    impulse1.setValue(4)
    impulse2.setValue(5)
    expect(spy).not.toHaveBeenCalled()
  })

  it("doesn't execute conditional listener when conditional Impulse changes", () => {
    const spy = vi.fn()
    const impulse1 = Impulse(1)
    const impulse2 = Impulse(2)

    subscribe((scope) => {
      if (impulse1.getValue(scope) > 1) {
        spy(impulse1.getValue(scope) + impulse2.getValue(scope))
      }
    })
    expect(impulse1).toHaveEmittersSize(1)
    expect(impulse2).toHaveEmittersSize(0)

    spy.mockReset()
    impulse2.setValue(3)
    expect(spy).not.toHaveBeenCalled()
    expect(impulse1).toHaveEmittersSize(1)
    expect(impulse2).toHaveEmittersSize(0)

    spy.mockReset()
    impulse1.setValue(2)
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)
    expect(impulse1).toHaveEmittersSize(1)
    expect(impulse2).toHaveEmittersSize(1)

    spy.mockReset()
    impulse2.setValue(4)
    expect(spy).toHaveBeenCalledExactlyOnceWith(6)
    expect(impulse1).toHaveEmittersSize(1)
    expect(impulse2).toHaveEmittersSize(1)

    spy.mockReset()
    impulse1.setValue(1)
    expect(spy).not.toHaveBeenCalled()
    expect(impulse1).toHaveEmittersSize(1)
    expect(impulse2).toHaveEmittersSize(0)
  })
})

describe("batching against subscribe listener", () => {
  it("executes listener on every Impulse update", () => {
    const spy = vi.fn()
    const impulse1 = Impulse(1)
    const impulse2 = Impulse(2)

    subscribe((scope) => {
      spy(impulse1.getValue(scope) + impulse2.getValue(scope))
    })

    spy.mockReset()
    impulse1.setValue(2)
    impulse2.setValue(3)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenNthCalledWith(1, 4)
    expect(spy).toHaveBeenNthCalledWith(2, 5)
  })

  it("executes listener ones for batched Impulse updates", () => {
    const spy = vi.fn()
    const impulse1 = Impulse(1)
    const impulse2 = Impulse(2)

    subscribe((scope) => {
      spy(impulse1.getValue(scope) + impulse2.getValue(scope))
    })

    spy.mockReset()
    batch(() => {
      impulse1.setValue(2)
      impulse2.setValue(3)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)
  })
})

describe("batching against a hook", () => {
  it("enqueues single re-render to a hook which impulses update inside subscribe's listener", () => {
    const impulse1 = Impulse(1)
    const impulse2 = Impulse(2)
    const impulse3 = Impulse(3)
    const impulse4 = Impulse(0)
    const spy = vi.fn()

    const { result } = renderHook(() =>
      useScoped((scope) => {
        spy()

        return impulse1.getValue(scope) + impulse2.getValue(scope) + impulse3.getValue(scope)
      }, []),
    )

    const unsubscribe = subscribe((scope) => {
      if (impulse4.getValue(scope) > 1 && impulse4.getValue(scope) < 5) {
        impulse1.setValue((x) => x + 1)
        impulse2.setValue((x) => x + 1)
        impulse3.setValue((x) => x + 1)
      }
    })

    expect(result.current).toBe(6)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      impulse4.setValue(1)
    })
    expect(result.current).toBe(6)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      impulse4.setValue(2)
    })
    expect(result.current).toBe(9)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      impulse1.setValue((x) => x + 1)
      impulse2.setValue((x) => x + 1)
      impulse3.setValue((x) => x + 1)
    })
    expect(result.current).toBe(12)
    expect(spy).toHaveBeenCalledTimes(3)
    vi.clearAllMocks()

    unsubscribe()
    act(() => {
      impulse4.setValue(3)
    })
    expect(result.current).toBe(12)
    expect(spy).not.toHaveBeenCalled()
  })

  it("enqueues single re-render to a hook which impulses update inside subscribe's cleanup", () => {
    const impulse1 = Impulse(1)
    const impulse2 = Impulse(2)
    const impulse3 = Impulse(3)
    const impulse4 = Impulse(0)
    const spy = vi.fn()

    const { result } = renderHook(() =>
      useScoped((scope) => {
        spy()

        return impulse1.getValue(scope) + impulse2.getValue(scope) + impulse3.getValue(scope)
      }, []),
    )

    const unsubscribe = subscribe((scope) => {
      if (impulse4.getValue(scope) > 1 && impulse4.getValue(scope) < 5) {
        return () => {
          impulse1.setValue((x) => x + 1)
          impulse2.setValue((x) => x + 1)
          impulse3.setValue((x) => x + 1)
        }
      }

      return undefined
    })

    expect(result.current).toBe(6)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      impulse4.setValue(1)
    })
    expect(result.current).toBe(6)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      impulse4.setValue(2)
    })
    expect(result.current).toBe(6)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      impulse4.setValue(3)
    })
    expect(result.current).toBe(9)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      impulse1.setValue((x) => x + 1)
      impulse2.setValue((x) => x + 1)
      impulse3.setValue((x) => x + 1)
    })
    expect(result.current).toBe(12)
    expect(spy).toHaveBeenCalledTimes(3)
    vi.clearAllMocks()

    act(() => {
      unsubscribe()
    })
    expect(result.current).toBe(15)
    expect(spy).toHaveBeenCalledOnce()
  })
})

describe("nested Impulses", () => {
  it("executes listener on init", () => {
    const spy = vi.fn()
    const impulse1 = Impulse(1)
    const impulse2 = Impulse(2)
    const impulse3 = Impulse({
      first: impulse1,
      second: impulse2,
    })

    subscribe((scope) => {
      const { first, second } = impulse3.getValue(scope)

      spy(first.getValue(scope) + second.getValue(scope))
    })

    expect(impulse1).toHaveEmittersSize(1)
    expect(impulse2).toHaveEmittersSize(1)
    expect(impulse3).toHaveEmittersSize(1)

    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
  })

  it("executes listener on update", () => {
    const spy = vi.fn()
    const impulse1 = Impulse(1)
    const impulse2 = Impulse(2)
    const impulse3 = Impulse({
      first: impulse1,
      second: impulse2,
    })

    subscribe((scope) => {
      const { first, second } = impulse3.getValue(scope)

      spy(first.getValue(scope) + second.getValue(scope))
    })

    spy.mockReset()
    impulse1.setValue(3)
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)

    spy.mockReset()
    impulse2.setValue(4)
    expect(spy).toHaveBeenCalledExactlyOnceWith(7)

    spy.mockReset()
    impulse3.setValue({
      first: impulse2,
      second: impulse1,
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(7)
  })
})
