import { act, renderHook } from "@testing-library/react-hooks"

import { Impulse, useScopedCallback } from "../src"

const onCallback = vi.fn<[number], number>().mockImplementation((x) => x)

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

  it.concurrent("does not run a callback on init", () => {
    const count = Impulse.of(1)
    setup(count)

    expect(onCallback).not.toHaveBeenCalled()
  })

  it.concurrent("does not attach Impulse to a scope on init", () => {
    const count = Impulse.of(1)
    setup(count)

    expect(count).toHaveProperty("emitters.size", 0)
  })

  it.concurrent(
    "does not change resulting function when not attached Impulse's value changes",
    () => {
      const count = Impulse.of(1)
      const { result } = setup(count)
      const initial = result.current

      act(() => {
        count.setValue(2)
      })

      expect(result.current).toBe(initial)
    },
  )

  it.concurrent("the resulting function returns a value", () => {
    const count = Impulse.of(1)
    const { result } = setup(count)

    expect(result.current()).toBe(2)

    act(() => {
      count.setValue(2)
    })

    expect(result.current()).toBe(4)
  })

  it.concurrent(
    "changes resulting function when attached Impulse's value changes",
    () => {
      const count = Impulse.of(1)
      const { result } = setup(count)
      const initial = result.current

      initial()

      act(() => {
        count.setValue(2)
      })

      expect(result.current).not.toBe(initial)
    },
  )

  it.concurrent(
    "de-attaches an attached Impulse when its value changes",
    () => {
      const count = Impulse.of(1)
      const { result } = setup(count)

      result.current()

      act(() => {
        count.setValue(2)
      })

      expect(count).toHaveProperty("emitters.size", 0)
    },
  )

  it.concurrent("attach an Impulse when the resulting function calls", () => {
    const count = Impulse.of(1)
    const { result } = setup(count)

    result.current()

    expect(count).toHaveProperty("emitters.size", 1)
  })

  it.concurrent(
    "attaches an Impulse only once on the subsequent resulting function calls",
    () => {
      const count = Impulse.of(1)
      const { result } = setup(count)

      result.current()
      result.current()

      expect(count).toHaveProperty("emitters.size", 1)
    },
  )

  it.concurrent(
    "does not change resulting function with same Impulse when re-renders",
    () => {
      const count = Impulse.of(1)
      const { result, rerender } = setup(count)
      const initial = result.current

      rerender(count)

      expect(result.current).toBe(initial)
    },
  )

  it.concurrent(
    "changes resulting function by a new Impulse when re-renders",
    () => {
      const count_1 = Impulse.of(1)
      const { result, rerender } = setup(count_1)
      const initial = result.current

      const count_2 = Impulse.of(2)
      rerender(count_2)

      expect(result.current).not.toBe(initial)
      expect(count_1).toHaveProperty("emitters.size", 0)
      expect(count_2).toHaveProperty("emitters.size", 0)
    },
  )

  it.concurrent("keeps attached Impulse when re-renders", () => {
    const count = Impulse.of(1)
    const { result, rerender } = setup(count)

    result.current()

    rerender(count)

    expect(count).toHaveProperty("emitters.size", 1)
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

  it.concurrent(
    "the resultign function returns a fallback when not active",
    () => {
      const count = Impulse.of(1)
      const { result } = setup(count)

      expect(result.current(false)).toBe(-1)

      act(() => {
        count.setValue(2)
      })

      expect(result.current(false)).toBe(-1)
    },
  )

  it.concurrent("the resulting function returns a value when active", () => {
    const count = Impulse.of(1)
    const { result } = setup(count)

    expect(result.current(true)).toBe(2)

    act(() => {
      count.setValue(2)
    })

    expect(result.current(true)).toBe(4)
  })

  it.concurrent("does not attach an Impulse when not active", () => {
    const count = Impulse.of(1)
    const { result } = setup(count)

    result.current(false)

    expect(count).toHaveProperty("emitters.size", 0)
  })

  it.concurrent("attaches an Impulse when active", () => {
    const count = Impulse.of(1)
    const { result } = setup(count)

    result.current(true)

    expect(count).toHaveProperty("emitters.size", 1)
  })

  it.concurrent("keeps an Impulse attached ones it was active", () => {
    const count = Impulse.of(1)
    const { result } = setup(count)

    result.current(true)
    result.current(false)

    expect(count).toHaveProperty("emitters.size", 1)
  })

  it.concurrent("de-attaches an Impulse when it was active", () => {
    const count = Impulse.of(1)
    const { result } = setup(count)

    result.current(true)

    act(() => {
      count.setValue(2)
    })

    expect(count).toHaveProperty("emitters.size", 0)
  })
})
