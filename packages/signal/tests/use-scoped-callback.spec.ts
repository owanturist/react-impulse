import { act, renderHook } from "@testing-library/react"
import { useCallback } from "react"

import { Impulse, useScope, useScoped } from "../src"

const onCallback = vi.fn<(x: number) => number>().mockImplementation((x) => x)

beforeEach(() => {
  onCallback.mockClear()
})

describe("single Impulse", () => {
  const setup = (impulse: Impulse<number>) =>
    renderHook(
      (count: Impulse<number>) => {
        const scope = useScope()

        return useCallback(() => onCallback(count.read(scope) * 2), [scope, count])
      },
      {
        initialProps: impulse,
      },
    )

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
    const count1 = Impulse(1)
    const { result, rerender } = setup(count1)
    const initial = result.current

    const count2 = Impulse(2)
    rerender(count2)

    expect(result.current).not.toBe(initial)
    expect(count1).toHaveEmittersSize(0)
    expect(count2).toHaveEmittersSize(0)
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
  const setup = (impulse: Impulse<number>) =>
    renderHook(
      (count: Impulse<number>) => {
        const scope = useScope()

        return useCallback(
          (isActive: boolean) => {
            if (isActive) {
              return count.read(scope) * 2
            }

            return -1
          },
          [scope, count],
        )
      },
      {
        initialProps: impulse,
      },
    )

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
  const setup = () =>
    renderHook(() => {
      const scope = useScope()

      return useCallback((count: Impulse<number>) => count.read(scope) * 2, [scope])
    })

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
    const count1 = Impulse(1)
    const count2 = Impulse(2)
    const { result } = setup()

    expect(result.current(count1)).toBe(2)
    expect(result.current(count2)).toBe(4)

    expect(count1).toHaveEmittersSize(1)
    expect(count2).toHaveEmittersSize(1)
  })

  it("detaches all Impulses when any of the attached Impulse value changes", () => {
    const count1 = Impulse(1)
    const count2 = Impulse(2)
    const { result } = setup()

    result.current(count1)
    result.current(count2)

    act(() => {
      count1.setValue(3)
    })

    expect(count1).toHaveEmittersSize(0)
    expect(count2).toHaveEmittersSize(0)
  })
})

it("cannot batch the callback", () => {
  const impulse1 = Impulse(1)
  const impulse2 = Impulse(2)
  const impulse3 = Impulse(3)
  const { result: callback } = renderHook(() => {
    const scope = useScope()

    return useCallback(
      (diff: number) => {
        impulse1.setValue(impulse1.read(scope) + diff)
        impulse2.setValue(impulse2.read(scope) + diff)
        impulse3.setValue(impulse3.read(scope) + diff)
      },
      [scope],
    )
  })
  const spy = vi.fn()

  const { result } = renderHook(() =>
    useScoped((scope) => {
      spy()

      return impulse1.read(scope) + impulse2.read(scope) + impulse3.read(scope)
    }, []),
  )

  expect(result.current).toBe(6)
  expect(spy).toHaveBeenCalledOnce()
  vi.clearAllMocks()

  act(() => {
    callback.current(1)
  })

  expect(result.current).toBe(9)
  expect(spy).toHaveBeenCalledTimes(3)
  vi.clearAllMocks()

  act(() => {
    callback.current(0)
  })

  expect(result.current).toBe(9)
  expect(spy).not.toHaveBeenCalled()
})
