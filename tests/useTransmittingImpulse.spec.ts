import { renderHook } from "@testing-library/react-hooks"
import { act } from "@testing-library/react"
import { useState } from "react"

import {
  Impulse,
  Scope,
  batch,
  useImpulse,
  useTransmittingImpulse,
  useScoped,
} from "../src"

describe.each([
  [
    "React.useState",
    function setup() {
      const getter = vi.fn((x: number) => x)
      const setter = vi.fn((x: number) => x)

      const tools = renderHook(() => {
        const [{ count }, setCounter] = useState({ count: 0 })
        const impulse = useTransmittingImpulse(
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
        const impulse = useTransmittingImpulse(
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

describe("setting origin values via setter", () => {
  const setup = (initial: boolean) => {
    const impulse = Impulse.of(initial)
    const setter = vi.fn((x: boolean) => impulse.setValue(x))

    const tools = renderHook(() => {
      return useTransmittingImpulse(
        (scope) => impulse.getValue(scope),
        [],
        setter,
      )
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
