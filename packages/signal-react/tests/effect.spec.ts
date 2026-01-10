import { Signal, effect } from "@owanturist/signal"
import { act, renderHook } from "@testing-library/react"

import { useComputed } from "../src"

describe("batching against a hook", () => {
  it("enqueues single re-render to a hook which signals write inside effect's listener", () => {
    const signal1 = Signal(1)
    const signal2 = Signal(2)
    const signal3 = Signal(3)
    const signal4 = Signal(0)
    const spy = vi.fn()

    const { result } = renderHook(() =>
      useComputed((monitor) => {
        spy()

        return signal1.read(monitor) + signal2.read(monitor) + signal3.read(monitor)
      }, []),
    )

    const unsubscribe = effect((monitor) => {
      if (signal4.read(monitor) > 1 && signal4.read(monitor) < 5) {
        signal1.write((x) => x + 1)
        signal2.write((x) => x + 1)
        signal3.write((x) => x + 1)
      }
    })

    expect(result.current).toBe(6)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      signal4.write(1)
    })
    expect(result.current).toBe(6)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      signal4.write(2)
    })
    expect(result.current).toBe(9)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      signal1.write((x) => x + 1)
      signal2.write((x) => x + 1)
      signal3.write((x) => x + 1)
    })
    expect(result.current).toBe(12)
    expect(spy).toHaveBeenCalledTimes(3)
    vi.clearAllMocks()

    unsubscribe()
    act(() => {
      signal4.write(3)
    })
    expect(result.current).toBe(12)
    expect(spy).not.toHaveBeenCalled()
  })

  it("enqueues single re-render to a hook which signals write inside effect's cleanup", () => {
    const signal1 = Signal(1)
    const signal2 = Signal(2)
    const signal3 = Signal(3)
    const signal4 = Signal(0)
    const spy = vi.fn()

    const { result } = renderHook(() =>
      useComputed((monitor) => {
        spy()

        return signal1.read(monitor) + signal2.read(monitor) + signal3.read(monitor)
      }, []),
    )

    const unsubscribe = effect((monitor) => {
      if (signal4.read(monitor) > 1 && signal4.read(monitor) < 5) {
        return () => {
          signal1.write((x) => x + 1)
          signal2.write((x) => x + 1)
          signal3.write((x) => x + 1)
        }
      }

      return undefined
    })

    expect(result.current).toBe(6)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      signal4.write(1)
    })
    expect(result.current).toBe(6)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      signal4.write(2)
    })
    expect(result.current).toBe(6)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      signal4.write(3)
    })
    expect(result.current).toBe(9)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      signal1.write((x) => x + 1)
      signal2.write((x) => x + 1)
      signal3.write((x) => x + 1)
    })
    expect(result.current).toBe(12)
    expect(spy).toHaveBeenCalledTimes(3)
    vi.clearAllMocks()

    act(() => {
      unsubscribe()
    })
    expect(result.current).toBe(15)
    expect(spy).toHaveBeenCalledOnce()
  })
})
