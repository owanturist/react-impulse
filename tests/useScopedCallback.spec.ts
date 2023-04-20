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

  describe("when Impulse value changes", () => {
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

    it.concurrent("changes resulting function", () => {
      const count = Impulse.of(1)
      const { result } = setup(count)
      const initial = result.current

      initial()

      act(() => {
        count.setValue(2)
      })

      expect(result.current).not.toBe(initial)
    })

    it.concurrent("de-attaches an Impulse", () => {
      const count = Impulse.of(1)
      const { result } = setup(count)

      result.current()

      act(() => {
        count.setValue(2)
      })

      expect(count).toHaveProperty("emitters.size", 0)
    })
  })

  describe("when the resulting function calls", () => {
    it.concurrent("attach an Impulse", () => {
      const count = Impulse.of(1)
      const { result } = setup(count)

      result.current()

      expect(count).toHaveProperty("emitters.size", 1)
    })
  })

  describe("when re-renders", () => {
    it.concurrent(
      "does not change resulting function with same Impulse",
      () => {
        const count = Impulse.of(1)
        const { result, rerender } = setup(count)
        const initial = result.current

        rerender(count)

        expect(result.current).toBe(initial)
      },
    )

    it.concurrent("changes resulting function by a new Impulse", () => {
      const count_1 = Impulse.of(1)
      const { result, rerender } = setup(count_1)
      const initial = result.current

      const count_2 = Impulse.of(2)
      rerender(count_2)

      expect(result.current).not.toBe(initial)
      expect(count_1).toHaveProperty("emitters.size", 0)
      expect(count_2).toHaveProperty("emitters.size", 0)
    })

    it.concurrent("keeps attached Impulse", () => {
      const count = Impulse.of(1)
      const { result, rerender } = setup(count)

      result.current()

      rerender(count)

      expect(count).toHaveProperty("emitters.size", 1)
    })
  })
})
