import { act, renderHook } from "@testing-library/react"
import { useState } from "react"

import {
  Impulse,
  batch,
  useImpulse,
  useTransmittingImpulse,
  type Compare,
  useScopedEffect,
  type ReadonlyImpulse,
  type Scope,
} from "../src"

import type { Counter } from "./common"

function setupWithGlobal() {
  let counter = { count: 0 }

  const tools = renderHook(() => {
    const impulse = useTransmittingImpulse(
      () => counter.count,
      [],
      (x) => {
        counter = { count: x }
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

  return {
    ...tools,
    getter: vi.spyOn(tools.result.current.impulse, "getValue"),
    setter: vi.spyOn(tools.result.current.impulse, "setValue"),
  }
}

function setupWithReactState() {
  const tools = renderHook(() => {
    const [{ count }, setCounter] = useState({ count: 0 })
    const impulse = useTransmittingImpulse(
      () => count,
      [count],
      (x) => setCounter({ count: x }),
    )

    return {
      impulse,
      getCount: () => count,
      setCount: (x: number) => setCounter({ count: x }),
    }
  })

  return {
    ...tools,
    getter: vi.spyOn(tools.result.current.impulse, "getValue"),
    setter: vi.spyOn(tools.result.current.impulse, "setValue"),
  }
}

function setupWithImpulse() {
  const tools = renderHook(() => {
    const counter = useImpulse({ count: 0 })
    const impulse = useTransmittingImpulse(
      (scope) => counter.getValue(scope).count,
      [counter],
      (x) => counter.setValue({ count: x }),
    )

    return {
      impulse,
      getCount: (scope: Scope) => counter.getValue(scope).count,
      setCount: (x: number) => counter.setValue({ count: x }),
    }
  })

  return {
    ...tools,
    getter: vi.spyOn(tools.result.current.impulse, "getValue"),
    setter: vi.spyOn(tools.result.current.impulse, "setValue"),
  }
}

function setupWithImpulseGetterShortcut() {
  const tools = renderHook(() => {
    const counter = useImpulse(0)
    const impulse = useTransmittingImpulse(counter, [counter], (x) =>
      counter.setValue(x),
    )

    return {
      impulse,
      getCount: (scope: Scope) => counter.getValue(scope),
      setCount: (x: number) => counter.setValue(x),
    }
  })

  return {
    ...tools,
    getter: vi.spyOn(tools.result.current.impulse, "getValue"),
    setter: vi.spyOn(tools.result.current.impulse, "setValue"),
  }
}

function setupWithImpulseSetterShortcut() {
  const tools = renderHook(() => {
    const counter = useImpulse(0)
    const impulse = useTransmittingImpulse(
      (scope) => counter.getValue(scope),
      [counter],
      counter,
    )

    return {
      impulse,
      getCount: (scope: Scope) => counter.getValue(scope),
      setCount: (x: number) => counter.setValue(x),
    }
  })

  return {
    ...tools,
    getter: vi.spyOn(tools.result.current.impulse, "getValue"),
    setter: vi.spyOn(tools.result.current.impulse, "setValue"),
  }
}

function setupWithImpulseGetterAndSetterShortcuts() {
  const tools = renderHook(() => {
    const counter = useImpulse(0)
    const impulse = useTransmittingImpulse(counter, [counter], counter)

    return {
      impulse,
      getCount: (scope: Scope) => counter.getValue(scope),
      setCount: (x: number) => counter.setValue(x),
    }
  })

  return {
    ...tools,
    getter: vi.spyOn(tools.result.current.impulse, "getValue"),
    setter: vi.spyOn(tools.result.current.impulse, "setValue"),
  }
}

describe.each([
  ["a global variable", setupWithGlobal],
  ["React.useState", setupWithReactState],
  ["an Impulse", setupWithImpulse],
  ["an Impulse with getter shortcut", setupWithImpulseGetterShortcut],
  ["an Impulse with setter shortcut", setupWithImpulseSetterShortcut],
  [
    "an Impulse with getter and setter shortcuts",
    setupWithImpulseGetterAndSetterShortcuts,
  ],
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
    expect(setter).toHaveBeenLastCalledWith(1)
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

  it("every becomes false when transmitted value becomes false", ({
    scope,
  }) => {
    const { result, selected } = setup([false, true, true])

    act(() => {
      result.current.setValue(false)
    })
    expect(selected[0]!.getValue(scope)).toBe(false)
    expect(selected[1]!.getValue(scope)).toBe(false)
    expect(selected[2]!.getValue(scope)).toBe(false)
  })
})

describe("with compare function", () => {
  const setup = (cmp?: null | Compare<{ x: boolean }>) => {
    const source = Impulse.of(0)

    const tools = renderHook(
      (compare) => {
        return useTransmittingImpulse(
          (scope) => ({ x: source.getValue(scope) > 3 }),
          [],
          { compare },
        )
      },
      {
        initialProps: cmp,
      },
    )

    return { ...tools, source }
  }

  it("does not call compare on first #getValue() call", ({ scope }) => {
    const { result } = setup()

    expect(Object.is).not.toHaveBeenCalled()
    act(() => {
      result.current.getValue(scope)
    })

    expect(Object.is).not.toHaveBeenCalled()
  })

  it("returns different values for subsequent #getValue() calls when comparably not equal", ({
    scope,
  }) => {
    const { result } = setup()
    const value_1 = result.current.getValue(scope)
    const value_2 = result.current.getValue(scope)

    expect(value_1).not.toBe(value_2)
    expect(value_1).toStrictEqual(value_2)
  })

  it("returns the same value for subsequent #getValue() calls when comparably equal", ({
    scope,
  }) => {
    const { result } = setup((left, right) => left.x === right.x)
    const value_1 = result.current.getValue(scope)
    const value_2 = result.current.getValue(scope)

    expect(value_1).toBe(value_2)
    expect(value_1).toStrictEqual(value_2)
  })

  it("returns different values when source changes", ({ scope }) => {
    const { source, result } = setup((left, right) => left.x === right.x)

    expect(result.current.getValue(scope)).toStrictEqual({ x: false })
    source.setValue(4)
    expect(result.current.getValue(scope)).toStrictEqual({ x: true })
  })

  it("applies Object.is by default", ({ scope }) => {
    const { result } = setup()

    expect(Object.is).not.toHaveBeenCalled()
    act(() => {
      result.current.getValue(scope)
      result.current.getValue(scope)
    })

    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ x: false }, { x: false })
  })

  it("applies Object.is when passing null as compare", ({ scope }) => {
    const { result } = setup(null)

    expect(Object.is).not.toHaveBeenCalled()
    act(() => {
      result.current.getValue(scope)
      result.current.getValue(scope)
    })

    expect(Object.is).toHaveBeenCalledOnce()
    expect(Object.is).toHaveBeenLastCalledWith({ x: false }, { x: false })
  })

  it("passes custom compare function", ({ scope }) => {
    const compare = vi.fn().mockReturnValue(false)
    const { result } = setup(compare)

    expect(compare).not.toHaveBeenCalled()
    act(() => {
      result.current.getValue(scope)
      result.current.getValue(scope)
    })

    expect(Object.is).not.toHaveBeenCalled()
    expect(compare).toHaveBeenCalledOnce()
    expect(compare).toHaveBeenLastCalledWith({ x: false }, { x: false })
  })

  it("updates compare function on re-render", ({ scope }) => {
    const compare_1 = vi.fn().mockImplementation(Object.is)
    const compare_2 = vi.fn().mockImplementation(Object.is)

    const { result, rerender } = setup(compare_1)
    vi.clearAllMocks()

    act(() => {
      result.current.getValue(scope)
      result.current.getValue(scope)
    })
    expect(compare_1).toHaveBeenCalledOnce()
    expect(compare_1).toHaveBeenLastCalledWith({ x: false }, { x: false })
    vi.clearAllMocks()

    rerender(compare_2)
    act(() => {
      result.current.getValue(scope)
    })
    expect(compare_1).not.toHaveBeenCalled()
    expect(compare_2).toHaveBeenCalledOnce()
    expect(compare_2).toHaveBeenLastCalledWith({ x: false }, { x: false })
    vi.clearAllMocks()

    rerender(null)
    act(() => {
      result.current.getValue(scope)
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

  it("does not emit subscribers when getter returns the same value", () => {
    const { rerender, onEffect } = setup()

    rerender({ count: 0 })
    expect(onEffect).not.toHaveBeenCalled()
  })

  it("should subscribe to correct source even if getter returns the same value", ({
    scope,
  }) => {
    const impulse_1 = Impulse.of(1)
    const impulse_2 = Impulse.of(2)

    const { result, rerender } = renderHook(
      (count) => {
        return useTransmittingImpulse((scope) => count.getValue(scope), [count])
      },
      {
        initialProps: impulse_1,
      },
    )

    expect(result.current.getValue(scope)).toBe(1)

    impulse_1.setValue(2)
    expect(result.current.getValue(scope)).toBe(2)

    rerender(impulse_2)
    expect(result.current.getValue(scope)).toBe(2)

    impulse_1.setValue(3)
    expect(result.current.getValue(scope)).toBe(2)

    impulse_2.setValue(3)
    expect(result.current.getValue(scope)).toBe(3)
  })
})

describe("changeling setter", () => {
  const setup = (setter: (x: number, scope: Scope) => void) => {
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

  it("should use initial setter on first render", ({ scope }) => {
    const setter = vi.fn()

    const { result } = setup(setter)

    result.current.setValue(2)

    expect(setter).toHaveBeenCalledOnce()
    expect(setter).toHaveBeenLastCalledWith(2, scope)
  })

  it("should not call setter on a subsequent rerender", () => {
    const setter_0 = vi.fn()
    const setter_1 = vi.fn()

    const { rerender } = setup(setter_0)

    rerender(setter_1)

    expect(setter_0).not.toHaveBeenCalled()
    expect(setter_1).not.toHaveBeenCalled()
  })

  it("should use updated setter on subsequent renders", ({ scope }) => {
    const setter_0 = vi.fn()
    const setter_1 = vi.fn()
    const setter_2 = vi.fn()

    const { result, rerender } = setup(setter_0)

    rerender(setter_1)
    vi.clearAllMocks()

    result.current.setValue(2)
    expect(setter_0).not.toHaveBeenCalled()
    expect(setter_1).toHaveBeenLastCalledWith(2, scope)

    rerender(setter_2)
    vi.clearAllMocks()

    result.current.setValue(3)
    expect(setter_0).not.toHaveBeenCalled()
    expect(setter_1).not.toHaveBeenCalled()
    expect(setter_2).toHaveBeenLastCalledWith(3, scope)
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

    expectTypeOf(result.current).toEqualTypeOf<Impulse<number>>()
    expectTypeOf(result.current).toMatchTypeOf<ReadonlyImpulse<number>>()
  })

  it("returns ReadonlyImpulse when setter is not defined", () => {
    const { result } = renderHook(() => {
      return useTransmittingImpulse(() => 1, [])
    })

    expectTypeOf(result.current).not.toEqualTypeOf<Impulse<number>>()
    expectTypeOf(result.current).toEqualTypeOf<ReadonlyImpulse<number>>()
  })

  it("allows ReadonlyImpulse as getter", () => {
    const { result } = renderHook(() => {
      const readonly = useTransmittingImpulse(() => 0, [])

      return useTransmittingImpulse(readonly, [readonly], () => {
        // noop
      })
    })

    expectTypeOf(result.current).toEqualTypeOf<Impulse<number>>()
    expectTypeOf(result.current).not.toEqualTypeOf<ReadonlyImpulse<number>>()
  })

  it("does not allow ReadonlyImpulse as setter", () => {
    const { result } = renderHook(() => {
      const readonly = useTransmittingImpulse(() => 0, [])

      // @ts-expect-error - readonly is not a setter
      return useTransmittingImpulse(readonly, [readonly], readonly)
    })

    expectTypeOf(result.current).toEqualTypeOf<ReadonlyImpulse<unknown>>()
  })

  it("requires getter dependencies", () => {
    const { result } = renderHook(() => {
      const x = useTransmittingImpulse(() => 0, [])

      // eslint-disable-next-line react-hooks/exhaustive-deps
      return useTransmittingImpulse(x, [], () => {
        // noop
      })
    })

    expectTypeOf(result.current).toEqualTypeOf<Impulse<number>>()
  })
})
