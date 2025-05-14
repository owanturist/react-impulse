import { act, renderHook } from "@testing-library/react"

import { Impulse, useScoped, useScopedCallback } from "../src"

const onCallback = vi.fn<(x: number) => number>().mockImplementation((x) => x)

beforeEach(() => {
  onCallback.mockClear()
})

describe("single Impulse", () => {
  const setup = (impulse: Impulse<number>) => {
    return renderHook(
      (count: Impulse<number>) => {
        return useScopedCallback(
          (scope) => onCallback(count.getValue(scope) * 2),
          [count],
        )
      },
      {
        initialProps: impulse,
      },
    )
  }

  it("does not run a callback on init", () => {
    const count = Impulse(1)
    setup(count)

    expect(onCallback).not.toHaveBeenCalled()
  })

  it("does not attach Impulse to a scope on init", () => {
    const count = Impulse(1)
    setup(count)

    expect(count).toHaveEmittersSize(0)
  })

  it("does not change resulting function when not attached Impulse's value changes", () => {
    const count = Impulse(1)
    const { result } = setup(count)
    const initial = result.current

    act(() => {
      count.setValue(2)
    })

    expect(result.current).toBe(initial)
  })

  it("the resulting function returns a value", () => {
    const count = Impulse(1)
    const { result } = setup(count)

    expect(result.current()).toBe(2)

    act(() => {
      count.setValue(2)
    })

    expect(result.current()).toBe(4)
  })

  it("changes resulting function when attached Impulse's value changes", () => {
    const count = Impulse(1)
    const { result } = setup(count)
    const initial = result.current

    initial()

    act(() => {
      count.setValue(2)
    })

    expect(result.current).not.toBe(initial)
  })

  it("de-attaches an attached Impulse when its value changes", () => {
    const count = Impulse(1)
    const { result } = setup(count)

    result.current()

    act(() => {
      count.setValue(2)
    })

    expect(count).toHaveEmittersSize(0)
  })

  it("attach an Impulse when the resulting function calls", () => {
    const count = Impulse(1)
    const { result } = setup(count)

    result.current()

    expect(count).toHaveEmittersSize(1)
  })

  it("attaches an Impulse only once on the subsequent resulting function calls", () => {
    const count = Impulse(1)
    const { result } = setup(count)

    result.current()
    result.current()

    expect(count).toHaveEmittersSize(1)
  })

  it("does not change resulting function with same Impulse when re-renders", () => {
    const count = Impulse(1)
    const { result, rerender } = setup(count)
    const initial = result.current

    rerender(count)

    expect(result.current).toBe(initial)
  })

  it("changes resulting function by a new Impulse when re-renders", () => {
    const count_1 = Impulse(1)
    const { result, rerender } = setup(count_1)
    const initial = result.current

    const count_2 = Impulse(2)
    rerender(count_2)

    expect(result.current).not.toBe(initial)
    expect(count_1).toHaveEmittersSize(0)
    expect(count_2).toHaveEmittersSize(0)
  })

  it("keeps attached Impulse when re-renders", () => {
    const count = Impulse(1)
    const { result, rerender } = setup(count)

    result.current()

    rerender(count)

    expect(count).toHaveEmittersSize(1)
  })
})

describe("conditional Impulse", () => {
  const setup = (impulse: Impulse<number>) => {
    return renderHook(
      (count: Impulse<number>) => {
        return useScopedCallback(
          (scope, isActive: boolean) => {
            if (isActive) {
              return count.getValue(scope) * 2
            }

            return -1
          },
          [count],
        )
      },
      {
        initialProps: impulse,
      },
    )
  }

  it("the resulting function returns a fallback when not active", () => {
    const count = Impulse(1)
    const { result } = setup(count)

    expect(result.current(false)).toBe(-1)

    act(() => {
      count.setValue(2)
    })

    expect(result.current(false)).toBe(-1)
  })

  it("the resulting function returns a value when active", () => {
    const count = Impulse(1)
    const { result } = setup(count)

    expect(result.current(true)).toBe(2)

    act(() => {
      count.setValue(2)
    })

    expect(result.current(true)).toBe(4)
  })

  it("does not attach an Impulse when not active", () => {
    const count = Impulse(1)
    const { result } = setup(count)

    result.current(false)

    expect(count).toHaveEmittersSize(0)
  })

  it("attaches an Impulse when active", () => {
    const count = Impulse(1)
    const { result } = setup(count)

    result.current(true)

    expect(count).toHaveEmittersSize(1)
  })

  it("keeps an Impulse attached ones it was active", () => {
    const count = Impulse(1)
    const { result } = setup(count)

    result.current(true)
    result.current(false)

    expect(count).toHaveEmittersSize(1)
  })

  it("de-attaches an Impulse when it was active", () => {
    const count = Impulse(1)
    const { result } = setup(count)

    result.current(true)

    act(() => {
      count.setValue(2)
    })

    expect(count).toHaveEmittersSize(0)
  })
})

describe("argument Impulse", () => {
  const setup = () => {
    return renderHook(() => {
      return useScopedCallback(
        (scope, count: Impulse<number>) => count.getValue(scope) * 2,
        [],
      )
    })
  }

  it("attaches an Impulse when the resulting function calls", () => {
    const count = Impulse(1)
    const { result } = setup()

    expect(result.current(count)).toBe(2)

    expect(count).toHaveEmittersSize(1)
  })

  it("does not attach the same Impulse twice", () => {
    const count = Impulse(1)
    const { result } = setup()

    expect(result.current(count)).toBe(2)
    expect(result.current(count)).toBe(2)

    expect(count).toHaveEmittersSize(1)
  })

  it("attaches multiple Impulses", () => {
    const count_1 = Impulse(1)
    const count_2 = Impulse(2)
    const { result } = setup()

    expect(result.current(count_1)).toBe(2)
    expect(result.current(count_2)).toBe(4)

    expect(count_1).toHaveEmittersSize(1)
    expect(count_2).toHaveEmittersSize(1)
  })

  it("detaches all Impulses when any of the attached Impulse value changes", () => {
    const count_1 = Impulse(1)
    const count_2 = Impulse(2)
    const { result } = setup()

    result.current(count_1)
    result.current(count_2)

    act(() => {
      count_1.setValue(3)
    })

    expect(count_1).toHaveEmittersSize(0)
    expect(count_2).toHaveEmittersSize(0)
  })
})

it("batches the callback", () => {
  const impulse_1 = Impulse(1)
  const impulse_2 = Impulse(2)
  const impulse_3 = Impulse(3)
  const { result: callback } = renderHook(() => {
    return useScopedCallback((scope, diff: number) => {
      impulse_1.setValue(impulse_1.getValue(scope) + diff)
      impulse_2.setValue(impulse_2.getValue(scope) + diff)
      impulse_3.setValue(impulse_3.getValue(scope) + diff)
    }, [])
  })
  const spy = vi.fn()

  const { result } = renderHook(() => {
    return useScoped((scope) => {
      spy()

      return (
        impulse_1.getValue(scope) +
        impulse_2.getValue(scope) +
        impulse_3.getValue(scope)
      )
    }, [])
  })

  expect(result.current).toBe(6)
  expect(spy).toHaveBeenCalledOnce()
  vi.clearAllMocks()

  act(() => {
    callback.current(1)
  })

  expect(result.current).toBe(9)
  expect(spy).toHaveBeenCalledOnce()
  vi.clearAllMocks()

  act(() => {
    callback.current(0)
  })

  expect(result.current).toBe(9)
  expect(spy).not.toHaveBeenCalled()
})
