import { renderHook } from "@testing-library/react-hooks"
import { act, waitFor } from "@testing-library/react"
import { useState } from "react"

import { Compare, Impulse, Scope, batch, useImpulse, useScoped } from "../src"
import * as utils from "../src/utils"

describe("without initial value", () => {
  it.concurrent(
    "should create an impulse with undefined initial value",
    ({ scope }) => {
      const { result } = renderHook(() => useImpulse())

      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      expect(result.current.getValue(scope)).toBeUndefined()
    },
  )

  it.concurrent("updates the impulse with a new value", ({ scope }) => {
    const { result } = renderHook(() => useImpulse<number>())

    result.current.setValue(1)

    expect(result.current.getValue(scope)).toBe(1)
  })

  it.concurrent("updates the impulse with a undefined", ({ scope }) => {
    const { result } = renderHook(() => useImpulse<number>())

    result.current.setValue(1)
    result.current.setValue(undefined)

    expect(result.current.getValue(scope)).toBeUndefined()
  })
})

describe("with direct initial value", () => {
  it.concurrent("creates an impulse with an initial value", ({ scope }) => {
    const initial = { count: 0 }

    const { result } = renderHook(() => useImpulse(initial))

    expect(result.current.getValue(scope)).toBe(initial)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
  })

  it.concurrent("keeps the same impulse during re-renders", ({ scope }) => {
    const initial = { count: 0 }

    const { result, rerender } = renderHook(() => useImpulse(initial))

    const firstResult = result.current

    rerender(initial)

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
  })

  it.concurrent(
    "does not create new impulse when the initial value changes",
    ({ scope }) => {
      const initial = { count: 0 }

      const { result, rerender } = renderHook(() => useImpulse(initial))

      const firstResult = result.current

      rerender({ count: 1 })

      expect(result.current).toBe(firstResult)
      expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
    },
  )
})

describe("with lazy initial value", () => {
  it.concurrent("creates an impulse with an initial value", ({ scope }) => {
    const initial = { count: 0 }
    const init = vi.fn(() => initial)

    const { result } = renderHook(() => useImpulse(init))

    expect(result.current.getValue(scope)).toBe(initial)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
    expect(init).toHaveBeenCalledOnce()
  })

  it.concurrent("keeps the same impulse during re-renders", ({ scope }) => {
    const initial = { count: 0 }
    const init = vi.fn(() => initial)

    const { result, rerender } = renderHook(() => useImpulse(init))

    const firstResult = result.current

    rerender(init)

    expect(result.current).toBe(firstResult)
    expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
    expect(init).toHaveBeenCalledOnce()
  })

  it.concurrent(
    "does not create new impulse when the init return value changes",
    ({ scope }) => {
      let initial = { count: 0 }
      const init = vi.fn(() => initial)

      const { result, rerender } = renderHook(() => useImpulse(init))

      const firstResult = result.current

      initial = { count: 1 }
      rerender(init)

      expect(result.current).toBe(firstResult)
      expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
      expect(init).toHaveBeenCalledOnce()
    },
  )

  it.concurrent(
    "does not create new impulse when the init function changes",
    ({ scope }) => {
      const initial = { count: 0 }
      let init = vi.fn(() => initial)

      const { result, rerender } = renderHook(() => useImpulse(init))

      const firstResult = result.current

      init = vi.fn(() => initial)
      rerender(init)

      expect(result.current).toBe(firstResult)
      expect(result.current.getValue(scope)).toStrictEqual({ count: 0 })
      expect(init).not.toHaveBeenCalled()
    },
  )

  it.concurrent("passes scope as an argument", ({ scope }) => {
    const impulse = Impulse.of<number>(1)

    const { result } = renderHook(() =>
      useImpulse((localScope) => impulse.getValue(localScope).toFixed(2)),
    )

    expect(result.current.getValue(scope)).toBe("1.00")
  })
})

describe("with compare function", () => {
  it.concurrent("applies Object.is by default", () => {
    const spy_isEqual = vi.spyOn(utils, "isEqual")
    const { result } = renderHook(() => useImpulse<number>(0))

    expect(spy_isEqual).not.toHaveBeenCalled()

    act(() => {
      result.current.setValue((x) => x + 1)
    })

    expect(spy_isEqual).toHaveBeenCalledOnce()
    expect(spy_isEqual).toHaveBeenLastCalledWith(0, 1)
  })

  it.concurrent("applies Object.is when passing null as compare", () => {
    const spy_isEqual = vi.spyOn(utils, "isEqual")
    const { result } = renderHook(() => useImpulse<number>(0, null))

    expect(spy_isEqual).not.toHaveBeenCalled()

    act(() => {
      result.current.setValue((x) => x + 1)
    })

    expect(spy_isEqual).toHaveBeenCalledOnce()
    expect(spy_isEqual).toHaveBeenLastCalledWith(0, 1)
  })

  it.concurrent("does not call the function on init", () => {
    const compare = vi.fn()
    renderHook(() => useImpulse({ count: 0 }, compare))

    expect(compare).not.toHaveBeenCalled()
  })

  it.concurrent("passes custom compare function", () => {
    const compare = vi.fn()
    const { result } = renderHook(() => useImpulse<number>(0, compare))

    act(() => {
      result.current.setValue(1)
    })

    expect(compare).toHaveBeenCalledOnce()
    expect(compare).toHaveBeenLastCalledWith(0, 1)
  })

  it.concurrent("updates compare function on re-render", () => {
    const compare_1 = vi.fn().mockImplementation(Object.is)
    const compare_2 = vi.fn().mockImplementation(Object.is)
    const spy_isEqual = vi.spyOn(utils, "isEqual")

    const { result, rerender } = renderHook(
      (compare: null | Compare<number>) => useImpulse<number>(0, compare),
      {
        initialProps: compare_1,
      },
    )

    act(() => {
      result.current.setValue((x) => x + 1)
    })
    expect(compare_1).toHaveBeenCalledOnce()
    expect(compare_1).toHaveBeenLastCalledWith(0, 1)
    vi.clearAllMocks()

    rerender(compare_2)
    act(() => {
      result.current.setValue((x) => x + 1)
    })
    expect(compare_1).not.toHaveBeenCalled()
    expect(compare_2).toHaveBeenCalledOnce()
    expect(compare_2).toHaveBeenLastCalledWith(1, 2)
    vi.clearAllMocks()

    rerender(null)
    act(() => {
      result.current.setValue((x) => x + 1)
    })
    expect(compare_2).not.toHaveBeenCalled()
    expect(spy_isEqual).toHaveBeenCalledOnce()
    expect(spy_isEqual).toHaveBeenLastCalledWith(2, 3)
  })
})

describe.each([
  [
    "React.useState",
    function setup() {
      const getter = vi.fn((x: number) => x)
      const setter = vi.fn((x: number) => x)

      const tools = renderHook(() => {
        const [{ count }, setCounter] = useState({ count: 0 })
        const impulse = useImpulse(
          () => getter(count),
          [count],
          (x) => setCounter({ count: setter(x) }),
        )

        return {
          impulse,
          count,
          setCount: (x: number) => setCounter({ count: x }),
        }
      })

      return { ...tools, getter, setter }
    },
  ],
  [
    "an Impulse",
    function setup() {
      const getter = vi.fn((x: number) => x)
      const setter = vi.fn((x: number) => x)

      const tools = renderHook(() => {
        const counter = useImpulse({ count: 0 })
        const impulse = useImpulse(
          (scope: Scope) => getter(counter.getValue(scope).count),
          [counter],
          (x) => counter.setValue({ count: setter(x) }),
        )

        return {
          impulse,
          count: useScoped((scope) => counter.getValue(scope).count),
          setCount: (x: number) => counter.setValue({ count: x }),
        }
      })

      return { ...tools, getter, setter }
    },
  ],
])("transmitting %s to Impulse", (_, setup) => {
  it.concurrent(
    "initializes the Impulse with the origin value",
    ({ scope }) => {
      const { result } = setup()

      expect(result.current.impulse.getValue(scope)).toBe(0)
    },
  )

  it.concurrent("calls getter only once on init", () => {
    const { getter, setter, result } = setup()
    const spy_impulse_setValue = vi.spyOn(result.current.impulse, "setValue")
    const spy_impulse_getValue = vi.spyOn(result.current.impulse, "getValue")

    expect(getter).toHaveBeenCalledOnce()
    expect(getter).toHaveBeenLastCalledWith(0)
    expect(setter).not.toHaveBeenCalled()
    expect(spy_impulse_setValue).not.toHaveBeenCalled()
    expect(spy_impulse_getValue).not.toHaveBeenCalled()
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

  it.concurrent("calls getter only once when origin value changes", () => {
    const { getter, setter, result } = setup()
    const spy_impulse_setValue = vi.spyOn(result.current.impulse, "setValue")
    const spy_impulse_getValue = vi.spyOn(result.current.impulse, "getValue")

    vi.clearAllMocks()

    act(() => {
      result.current.setCount(1)
    })
    expect(getter).toHaveBeenCalledOnce()
    expect(getter).toHaveBeenLastCalledWith(1)
    expect(setter).not.toHaveBeenCalled()
    expect(spy_impulse_setValue).toHaveBeenCalledOnce()
    expect(spy_impulse_setValue).toHaveBeenLastCalledWith(1)
    expect(spy_impulse_getValue).toHaveBeenCalledOnce()
    expect(spy_impulse_getValue).toHaveLastReturnedWith(1)
  })

  it.concurrent(
    "update the origin value when the Impulse value changes",
    () => {
      const { result } = setup()

      act(() => {
        result.current.impulse.setValue(1)
      })
      expect(result.current.count).toBe(1)
    },
  )

  it.concurrent("calls setter only once when the Impulse value changes", () => {
    const { getter, setter, result } = setup()
    const spy_impulse_setValue = vi.spyOn(result.current.impulse, "setValue")
    const spy_impulse_getValue = vi.spyOn(result.current.impulse, "getValue")

    vi.clearAllMocks()

    act(() => {
      result.current.impulse.setValue(1)
    })
    expect(setter).toHaveBeenCalledOnce()
    expect(setter).toHaveBeenLastCalledWith(1)
    expect(getter).toHaveBeenCalledOnce()
    expect(getter).toHaveBeenLastCalledWith(1)
    expect(spy_impulse_setValue).toHaveBeenCalledTimes(2)
    expect(spy_impulse_setValue).toHaveBeenNthCalledWith(1, 1)
    expect(spy_impulse_setValue).toHaveBeenNthCalledWith(2, 1)
    expect(spy_impulse_getValue).toHaveBeenCalledOnce()
    expect(spy_impulse_getValue).toHaveLastReturnedWith(1)
  })
})

describe("transmit many Impulses to one (select all checkboxes example)", () => {
  const setup = (initial: Array<boolean>) => {
    const selected = initial.map((x) => Impulse.of(x))

    const tools = renderHook(() => {
      return useImpulse(
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

describe("setting origin values via setter", () => {
  const setup = (initial: boolean) => {
    const impulse = Impulse.of(initial)
    const setter = vi.fn((x: boolean) => impulse.setValue(x))

    const tools = renderHook(() => {
      return useImpulse((scope) => impulse.getValue(scope), [], setter)
    })

    return { ...tools, setter, impulse }
  }

  it.concurrent("does not call the setter on init", () => {
    const { setter } = setup(false)

    expect(setter).toHaveBeenCalledTimes(0)
  })

  it.concurrent("calls setter with previous value", () => {
    const { result, setter } = setup(false)

    act(() => {
      result.current.setValue(true)
    })

    expect(setter).toHaveBeenCalledTimes(1)
    expect(setter).toHaveBeenLastCalledWith(true, false)
  })

  it.concurrent(
    "does not call setter if result.setValue() is not called",
    () => {
      const { impulse, setter } = setup(false)

      act(() => {
        impulse.setValue(true)
      })

      expect(setter).toHaveBeenCalledTimes(0)
    },
  )
})
