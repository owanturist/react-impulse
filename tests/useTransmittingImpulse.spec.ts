import { act, renderHook } from "@testing-library/react"
import { useState } from "react"

import {
  Impulse,
  batch,
  useImpulse,
  useTransmittingImpulse,
  useScopedEffect,
  type ReadonlyImpulse,
  Scope,
} from "../src"

import type { Counter } from "./common"

function setupWithGlobal() {
  let counter = { count: 0 }

  const getter = vi.fn((x: number) => x)
  const setter = vi.fn((x: Counter) => x)

  const tools = renderHook(() => {
    const impulse = useTransmittingImpulse(
      () => getter(counter.count),
      [],
      (x) => {
        counter = setter({ count: x })
      },
    )

    return {
      impulse,
      getCount: () => counter.count,
      setCount: (x: number) => {
        counter = { count: x }
      },
    }
  })

  return { ...tools, getter, setter }
}

function setupWithReactState() {
  const getter = vi.fn((x: number) => x)
  const setter = vi.fn((x: Counter) => x)

  const tools = renderHook(() => {
    const [{ count }, setCounter] = useState({ count: 0 })
    const impulse = useTransmittingImpulse(
      () => getter(count),
      [count],
      (x) => setCounter(setter({ count: x })),
    )

    return {
      impulse,
      getCount: () => count,
      setCount: (x: number) => setCounter({ count: x }),
    }
  })

  return { ...tools, getter, setter }
}

function setupWithImpulse() {
  const getter = vi.fn((x: number) => x)
  const setter = vi.fn((x: Counter) => x)

  const tools = renderHook(() => {
    const counter = useImpulse({ count: 0 }, (x, y) => x === y)
    const impulse = useTransmittingImpulse(
      (scope) => getter(counter.getValue(scope).count),
      [counter],
      (x) => counter.setValue(setter({ count: x })),
    )

    return {
      impulse,
      getCount: (scope: Scope) => counter.getValue(scope).count,
      setCount: (x: number) => counter.setValue({ count: x }),
    }
  })

  return { ...tools, getter, setter }
}

describe.each([
  ["a global variable", setupWithGlobal],
  ["React.useState", setupWithReactState],
  ["an Impulse", setupWithImpulse],
])("transmitting %s to Impulse", (_, setup) => {
  it("initializes the Impulse with the origin value", ({ scope }) => {
    const { result } = setup()

    expect(result.current.impulse.getValue(scope)).toBe(0)
  })

  it("does not call getter nor setter on init", () => {
    const { getter, setter } = setup()

    expect(getter).not.toHaveBeenCalled()
    expect(setter).not.toHaveBeenCalled()
  })

  it("calls getter when the Impulse value is requested", ({ scope }) => {
    const { getter, result } = setup()

    result.current.impulse.getValue(scope)
    expect(getter).toHaveBeenCalledOnce()
    expect(getter).toHaveLastReturnedWith(0)
  })

  it("calls the getter multiple times even if the value is fresh", ({
    scope,
  }) => {
    const { getter, result } = setup()

    result.current.impulse.getValue(scope)
    result.current.impulse.getValue(scope)
    expect(getter).toHaveBeenCalledTimes(2)
    expect(getter).toHaveLastReturnedWith(0)
  })

  it("updates the Impulse value when origin value changes", ({ scope }) => {
    const { result } = setup()

    act(() => {
      result.current.setCount(1)
    })
    expect(result.current.impulse.getValue(scope)).toBe(1)
  })

  it("update the origin value when the Impulse value changes", ({ scope }) => {
    const { result } = setup()

    act(() => {
      result.current.impulse.setValue(1)
    })
    expect(result.current.getCount(scope)).toBe(1)
  })

  it("calls setter when the Impulse value changes", () => {
    const { setter, result } = setup()

    act(() => {
      result.current.impulse.setValue(1)
    })
    expect(setter).toHaveBeenCalledOnce()
    expect(setter).toHaveBeenLastCalledWith({ count: 1 })
  })
})

describe("transmit many Impulses to one (select all checkboxes example)", () => {
  const setup = (initial: Array<boolean>) => {
    const selected = initial.map((x) => Impulse.of(x))

    const tools = renderHook(() => {
      return useTransmittingImpulse(
        (scope) => selected.every((impulse) => impulse.getValue(scope)),
        [],
        (x) => {
          batch(() => {
            selected.forEach((impulse) => impulse.setValue(x))
          })
        },
      )
    })

    return { ...tools, selected }
  }

  describe.each([true, false])("when all checkboxes are %s", (initial) => {
    it("initializes with the same value", ({ scope }) => {
      const { result } = setup([initial, initial, initial])

      expect(result.current.getValue(scope)).toBe(initial)
    })
  })

  it("becomes true when all checkboxes become true", ({ scope }) => {
    const { result, selected } = setup([false, false, false])

    act(() => {
      selected[0]!.setValue(true)
    })
    expect(result.current.getValue(scope)).toBe(false)

    act(() => {
      selected[1]!.setValue(true)
    })
    expect(result.current.getValue(scope)).toBe(false)

    act(() => {
      selected[2]!.setValue(true)
    })
    expect(result.current.getValue(scope)).toBe(true)
  })

  it("every becomes true when transmitted value becomes true", ({ scope }) => {
    const { result, selected } = setup([false, false, false])

    act(() => {
      result.current.setValue(true)
    })
    expect(selected[0]!.getValue(scope)).toBe(true)
    expect(selected[1]!.getValue(scope)).toBe(true)
    expect(selected[2]!.getValue(scope)).toBe(true)
  })
})

describe("replacing getter", () => {
  const setup = () => {
    const onEffect = vi.fn()

    const tools = renderHook(
      (counter: Counter) => {
        const impulse = useTransmittingImpulse(
          () => counter.count,
          [counter],
          () => {
            // noop
          },
        )

        useScopedEffect(
          (scope) => {
            onEffect(impulse.getValue(scope))
          },
          [impulse],
        )

        return impulse
      },
      {
        initialProps: { count: 0 },
      },
    )

    onEffect.mockClear()

    return { ...tools, onEffect }
  }

  it("should emit subscribers when getter changes", () => {
    const { rerender, onEffect } = setup()

    rerender({ count: 1 })
    expect(onEffect).toHaveBeenCalledOnce()
    expect(onEffect).toHaveBeenLastCalledWith(1)
  })

  it("should emit subscribers when getter returns the same value", () => {
    const { rerender, onEffect } = setup()

    rerender({ count: 0 })
    expect(onEffect).toHaveBeenCalledOnce()
    expect(onEffect).toHaveBeenLastCalledWith(0)
  })
})

describe("changeling setter", () => {
  const setup = (setter: React.Dispatch<number>) => {
    return renderHook(
      (set) => {
        return useTransmittingImpulse(() => 1, [], set)
      },
      { initialProps: setter },
    )
  }

  it("should not call setter on init", () => {
    const setter = vi.fn()

    setup(setter)
    expect(setter).not.toHaveBeenCalled()
  })

  it("should use initial setter on first render", () => {
    const setter = vi.fn()

    const { result } = setup(setter)

    result.current.setValue(2)

    expect(setter).toHaveBeenCalledOnce()
    expect(setter).toHaveBeenLastCalledWith(2, expect.anything())
  })

  it("should not call setter on a subsequent rerender", () => {
    const setter_0 = vi.fn()
    const setter_1 = vi.fn()

    const { rerender } = setup(setter_0)

    rerender(setter_1)

    expect(setter_0).not.toHaveBeenCalled()
    expect(setter_1).not.toHaveBeenCalled()
  })

  it("should use updated setter on subsequent renders", () => {
    const setter_0 = vi.fn()
    const setter_1 = vi.fn()
    const setter_2 = vi.fn()

    const { result, rerender } = setup(setter_0)

    rerender(setter_1)
    vi.clearAllMocks()

    result.current.setValue(2)
    expect(setter_0).not.toHaveBeenCalled()
    expect(setter_1).toHaveBeenLastCalledWith(2, expect.anything())

    rerender(setter_2)
    vi.clearAllMocks()

    result.current.setValue(3)
    expect(setter_0).not.toHaveBeenCalled()
    expect(setter_1).not.toHaveBeenCalled()
    expect(setter_2).toHaveBeenLastCalledWith(3, expect.anything())
  })
})

describe("type check", () => {
  it("returns Impulse when setter is defined", () => {
    const { result } = renderHook(() => {
      return useTransmittingImpulse(
        () => 1,
        [],
        () => {
          // noop
        },
      )
    })

    expectTypeOf(result.current).toMatchTypeOf<Impulse<number>>()
    expectTypeOf(result.current).toMatchTypeOf<ReadonlyImpulse<number>>()
  })

  it("returns ReadonlyImpulse when setter is not defined", () => {
    const { result } = renderHook(() => {
      return useTransmittingImpulse(() => 1, [])
    })

    // @ts-expect-error should be ReadonlyImpulse only
    expectTypeOf(result.current).toMatchTypeOf<Impulse<number>>()
    expectTypeOf(result.current).toMatchTypeOf<ReadonlyImpulse<number>>()
  })
})
