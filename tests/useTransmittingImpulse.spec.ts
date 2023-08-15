import { act, renderHook } from "@testing-library/react"
import { useState } from "react"

import {
  Impulse,
  batch,
  useImpulse,
  useTransmittingImpulse,
  type Compare,
  useImpulseEffect,
  type ReadonlyImpulse,
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
    const counter = useImpulse({ count: 0 })
    const impulse = useTransmittingImpulse(
      () => getter(counter.getValue().count),
      [counter],
      (x) => counter.setValue(setter({ count: x })),
    )

    return {
      impulse,
      getCount: () => counter.getValue().count,
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
  it("initializes the Impulse with the origin value", () => {
    const { result } = setup()

    expect(result.current.impulse.getValue()).toBe(0)
  })

  it("does not call getter nor setter on init", () => {
    const { getter, setter } = setup()

    expect(getter).not.toHaveBeenCalled()
    expect(setter).not.toHaveBeenCalled()
  })

  it("calls getter when the Impulse value is requested", () => {
    const { getter, result } = setup()

    result.current.impulse.getValue()
    expect(getter).toHaveBeenCalledOnce()
    expect(getter).toHaveLastReturnedWith(0)
  })

  it("calls the getter multiple times even if the value is fresh", () => {
    const { getter, result } = setup()

    result.current.impulse.getValue()
    result.current.impulse.getValue()
    expect(getter).toHaveBeenCalledTimes(2)
    expect(getter).toHaveLastReturnedWith(0)
  })

  it("updates the Impulse value when origin value changes", () => {
    const { result } = setup()

    act(() => {
      result.current.setCount(1)
    })
    expect(result.current.impulse.getValue()).toBe(1)
  })

  it("update the origin value when the Impulse value changes", () => {
    const { result } = setup()

    act(() => {
      result.current.impulse.setValue(1)
    })
    expect(result.current.getCount()).toBe(1)
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
        () => selected.every((impulse) => impulse.getValue()),
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
    it("initializes with the same value", () => {
      const { result } = setup([initial, initial, initial])

      expect(result.current.getValue()).toBe(initial)
    })
  })

  it("becomes true when all checkboxes become true", () => {
    const { result, selected } = setup([false, false, false])

    act(() => {
      selected[0]!.setValue(true)
    })
    expect(result.current.getValue()).toBe(false)

    act(() => {
      selected[1]!.setValue(true)
    })
    expect(result.current.getValue()).toBe(false)

    act(() => {
      selected[2]!.setValue(true)
    })
    expect(result.current.getValue()).toBe(true)
  })

  it("every becomes true when transmitted value becomes true", () => {
    const { result, selected } = setup([false, false, false])

    act(() => {
      result.current.setValue(true)
    })
    expect(selected[0]!.getValue()).toBe(true)
    expect(selected[1]!.getValue()).toBe(true)
    expect(selected[2]!.getValue()).toBe(true)
  })

  it("every becomes false when transmitted value becomes false", () => {
    const { result, selected } = setup([false, true, true])

    act(() => {
      result.current.setValue(false)
    })
    expect(selected[0]!.getValue()).toBe(false)
    expect(selected[1]!.getValue()).toBe(false)
    expect(selected[2]!.getValue()).toBe(false)
  })
})

describe("with compare function", () => {
  const setup = (cmp?: null | Compare<{ x: boolean }>) => {
    const source = Impulse.of(0)

    const tools = renderHook(
      (compare) => {
        return useTransmittingImpulse(
          () => ({ x: source.getValue() > 3 }),
          [source],
          { compare },
        )
      },
      {
        initialProps: cmp,
      },
    )

    return { ...tools, source }
  }

  it("does not call compare on first #getValue() call", () => {
    const { result } = setup()

    expect(Object.is).not.toHaveBeenCalled()
    act(() => {
      result.current.getValue()
    })

    expect(Object.is).not.toHaveBeenCalled()
  })

  it("returns different values for subsequent #getValue() calls when comparably not equal", () => {
    const { result } = setup()
    const value_1 = result.current.getValue()
    const value_2 = result.current.getValue()

    expect(value_1).not.toBe(value_2)
    expect(value_1).toStrictEqual(value_2)
  })

  it("returns the same value for subsequent #getValue() calls when comparably equal", () => {
    const { result } = setup((left, right) => left.x === right.x)
    const value_1 = result.current.getValue()
    const value_2 = result.current.getValue()

    expect(value_1).toBe(value_2)
    expect(value_1).toStrictEqual(value_2)
  })

  it("returns different values when source changes", () => {
    const { source, result } = setup((left, right) => left.x === right.x)

    expect(result.current.getValue()).toStrictEqual({ x: false })
    source.setValue(4)
    expect(result.current.getValue()).toStrictEqual({ x: true })
  })

  it("applies Object.is by default", () => {
    const { result } = setup()

    expect(Object.is).not.toHaveBeenCalled()
    act(() => {
      result.current.getValue()
      result.current.getValue()
    })

    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ x: false }, { x: false })
  })

  it("applies Object.is when passing null as compare", () => {
    const { result } = setup(null)

    expect(Object.is).not.toHaveBeenCalled()
    act(() => {
      result.current.getValue()
      result.current.getValue()
    })

    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ x: false }, { x: false })
  })

  it("passes custom compare function", () => {
    const compare = vi.fn().mockReturnValue(false)
    const { result } = setup(compare)

    expect(compare).not.toHaveBeenCalled()
    act(() => {
      result.current.getValue()
      result.current.getValue()
    })

    expect(Object.is).not.toHaveBeenCalled()
    expect(compare).toHaveBeenCalledOnce()
    expect(compare).toHaveBeenLastCalledWith({ x: false }, { x: false })
  })

  it("updates compare function on re-render", () => {
    const compare_1 = vi.fn().mockImplementation(Object.is)
    const compare_2 = vi.fn().mockImplementation(Object.is)

    const { result, rerender } = setup(compare_1)
    vi.clearAllMocks()

    act(() => {
      result.current.getValue()
      result.current.getValue()
    })
    expect(compare_1).toHaveBeenCalledOnce()
    expect(compare_1).toHaveBeenLastCalledWith({ x: false }, { x: false })
    vi.clearAllMocks()

    rerender(compare_2)
    act(() => {
      result.current.getValue()
    })
    expect(compare_1).not.toHaveBeenCalled()
    expect(compare_2).toHaveBeenCalledOnce()
    expect(compare_2).toHaveBeenLastCalledWith({ x: false }, { x: false })
    vi.clearAllMocks()

    rerender(null)
    act(() => {
      result.current.getValue()
    })
    expect(compare_1).not.toHaveBeenCalled()
    expect(compare_2).not.toHaveBeenCalled()
    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ x: false }, { x: false })
  })
})

describe("replacing getter", () => {
  const setup = () => {
    const onEffect = vi.fn()

    const tools = renderHook(
      (counter: Counter) => {
        const impulse = useTransmittingImpulse(() => counter.count, [counter])

        useImpulseEffect(() => {
          onEffect(impulse.getValue())
        }, [impulse])

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

  it("does not emit subscribers when getter returns the same value", () => {
    const { rerender, onEffect } = setup()

    rerender({ count: 0 })
    expect(onEffect).not.toHaveBeenCalled()
  })

  it("should subscribe to correct source even if getter returns the same value", () => {
    const impulse_1 = Impulse.of(1)
    const impulse_2 = Impulse.of(2)

    const { result, rerender } = renderHook(
      (count) => {
        return useTransmittingImpulse(() => count.getValue(), [count])
      },
      {
        initialProps: impulse_1,
      },
    )

    expect(result.current.getValue()).toBe(1)

    impulse_1.setValue(2)
    expect(result.current.getValue()).toBe(2)

    rerender(impulse_2)
    expect(result.current.getValue()).toBe(2)

    impulse_1.setValue(3)
    expect(result.current.getValue()).toBe(2)

    impulse_2.setValue(3)
    expect(result.current.getValue()).toBe(3)
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
