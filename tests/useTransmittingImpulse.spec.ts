import { act, renderHook } from "@testing-library/react"
import { useState } from "react"

import {
  Impulse,
  Scope,
  batch,
  useImpulse,
  useTransmittingImpulse,
  Compare,
  useScopedEffect,
} from "../src"
import * as utils from "../src/utils"

import { Counter } from "./common"

function setupWithGlobal(compare?: null | Compare<number>) {
  let counter = { count: 0 }

  const getter = vi.fn((x: number) => x)
  const setter = vi.fn((x: number) => x)

  const tools = renderHook(
    (cmp?: null | Compare<number>) => {
      const impulse = useTransmittingImpulse(
        () => getter(counter.count),
        [],
        (x) => {
          counter = { count: setter(x) }
        },
        cmp,
      )

      return {
        impulse,
        getCount: () => counter.count,
        setCount: (x: number) => {
          counter = { count: x }
        },
      }
    },
    {
      initialProps: compare,
    },
  )

  return { ...tools, getter, setter }
}

function setupWithReactState(compare?: null | Compare<number>) {
  const getter = vi.fn((x: number) => x)
  const setter = vi.fn((x: number) => x)

  const tools = renderHook(
    (cmp?: null | Compare<number>) => {
      const [{ count }, setCounter] = useState({ count: 0 })
      const impulse = useTransmittingImpulse(
        () => getter(count),
        [count],
        (x) => setCounter({ count: setter(x) }),
        cmp,
      )

      return {
        impulse,
        getCount: () => count,
        setCount: (x: number) => setCounter({ count: x }),
      }
    },
    {
      initialProps: compare,
    },
  )

  return { ...tools, getter, setter }
}

function setupWithImpulse(compare?: null | Compare<number>) {
  const getter = vi.fn((x: number) => x)
  const setter = vi.fn((x: number) => x)

  const tools = renderHook(
    (cmp?: null | Compare<number>) => {
      const counter = useImpulse({ count: 0 }, (x, y) => x === y)
      const impulse = useTransmittingImpulse(
        (scope: Scope) => getter(counter.getValue(scope).count),
        [counter],
        (x) => counter.setValue({ count: setter(x) }),
        cmp,
      )

      return {
        impulse,
        getCount: (scope: Scope) => counter.getValue(scope).count,
        setCount: (x: number) => counter.setValue({ count: x }),
      }
    },
    {
      initialProps: compare,
    },
  )

  return { ...tools, getter, setter }
}

describe.each([
  ["a global variable", setupWithGlobal],
  ["React.useState", setupWithReactState],
  ["an Impulse", setupWithImpulse],
])("transmitting %s to Impulse", (_, setup) => {
  it.concurrent(
    "initializes the Impulse with the origin value",
    ({ scope }) => {
      const { result } = setup()

      expect(result.current.impulse.getValue(scope)).toBe(0)
    },
  )

  it.concurrent("does not call getter nor setter on init", () => {
    const { getter, setter } = setup()

    expect(getter).not.toHaveBeenCalled()
    expect(setter).not.toHaveBeenCalled()
  })

  it.concurrent(
    "updates the Impulse value when origin value changes",
    ({ scope }) => {
      const { result } = setup()

      act(() => {
        result.current.setCount(1)
      })
      expect(result.current.impulse.getValue(scope)).toBe(1)
    },
  )

  it.concurrent(
    "update the origin value when the Impulse value changes",
    ({ scope }) => {
      const { result } = setup()

      act(() => {
        result.current.impulse.setValue(1)
      })
      expect(result.current.getCount(scope)).toBe(1)
    },
  )

  it.concurrent("calls setter when the Impulse value changes", () => {
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
    it.concurrent("initializes with the same value", ({ scope }) => {
      const { result } = setup([initial, initial, initial])

      expect(result.current.getValue(scope)).toBe(initial)
    })
  })

  it.concurrent("becomes true when all checkboxes become true", ({ scope }) => {
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

  it.concurrent(
    "every becomes true when transmitted value becomes true",
    ({ scope }) => {
      const { result, selected } = setup([false, false, false])

      act(() => {
        result.current.setValue(true)
      })
      expect(selected[0]!.getValue(scope)).toBe(true)
      expect(selected[1]!.getValue(scope)).toBe(true)
      expect(selected[2]!.getValue(scope)).toBe(true)
    },
  )
})

describe("with compare function", () => {
  const spy_eq = vi.spyOn(utils, "eq")

  beforeEach(() => {
    spy_eq.mockClear()
  })

  it("applies Object.is by default", () => {
    const { result } = setupWithImpulse()

    expect(spy_eq).not.toHaveBeenCalled()
    act(() => {
      result.current.impulse.setValue((x) => x + 1)
    })

    expect(spy_eq).toHaveBeenCalledOnce()
    expect(spy_eq).toHaveBeenLastCalledWith(0, 1)
  })

  it("applies Object.is when passing null as compare", () => {
    const { result } = setupWithImpulse(null)

    expect(spy_eq).not.toHaveBeenCalled()
    act(() => {
      result.current.impulse.setValue((x) => x + 1)
    })

    expect(spy_eq).toHaveBeenCalledOnce()
    expect(spy_eq).toHaveBeenLastCalledWith(0, 1)
  })

  it("passes custom compare function", () => {
    const compare = vi.fn()
    const { result } = setupWithImpulse(compare)

    expect(compare).not.toHaveBeenCalled()
    act(() => {
      result.current.impulse.setValue((x) => x + 1)
    })

    expect(spy_eq).not.toHaveBeenCalled()
    expect(compare).toHaveBeenCalledOnce()
    expect(compare).toHaveBeenLastCalledWith(0, 1)
  })

  it("updates compare function on re-render", () => {
    const compare_1 = vi.fn().mockImplementation(Object.is)
    const compare_2 = vi.fn().mockImplementation(Object.is)

    const { result, rerender } = setupWithImpulse(compare_1)
    vi.clearAllMocks()

    act(() => {
      result.current.impulse.setValue((x) => x + 1)
    })
    expect(compare_1).toHaveBeenCalledOnce()
    expect(compare_1).toHaveBeenLastCalledWith(0, 1)
    vi.clearAllMocks()

    rerender(compare_2)
    act(() => {
      result.current.impulse.setValue((x) => x + 1)
    })
    expect(compare_1).not.toHaveBeenCalled()
    expect(compare_2).toHaveBeenCalledOnce()
    expect(compare_2).toHaveBeenLastCalledWith(1, 2)
    vi.clearAllMocks()

    rerender(null)
    act(() => {
      result.current.impulse.setValue((x) => x + 1)
    })
    expect(compare_2).not.toHaveBeenCalled()
    expect(spy_eq).toHaveBeenCalledOnce()
    expect(spy_eq).toHaveBeenLastCalledWith(2, 3)
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

  it.concurrent("should emit subscribers when getter changes", () => {
    const { rerender, onEffect } = setup()

    rerender({ count: 1 })
    expect(onEffect).toHaveBeenCalledOnce()
    expect(onEffect).toHaveBeenLastCalledWith(1)
  })

  it.concurrent(
    "does not emit subscribers when getter returns the same value",
    () => {
      const { rerender, onEffect } = setup()

      rerender({ count: 0 })
      expect(onEffect).not.toHaveBeenCalled()
    },
  )
})
