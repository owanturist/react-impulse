import { type Monitor, Signal } from "@owanturist/signal"
import { act, renderHook } from "@testing-library/react"

import { Counter } from "~/tools/testing/counter"

import { useComputed } from "../../src"
import type { WithEquals, WithSignal } from "../common"

function factory(monitor: Monitor, { signal }: WithSignal) {
  return signal.read(monitor)
}

describe.each([
  [
    "inline",
    ({ signal, equals }: WithSignal & WithEquals) => {
      const cmp = equals ?? Counter.equals

      return useComputed((monitor) => factory(monitor, { signal }), [signal], {
        equals: (prev, next) => cmp(prev, next),
      })
    },
  ],
  [
    "memoized",
    ({ signal, equals }: WithSignal & WithEquals) =>
      useComputed((monitor) => factory(monitor, { signal }), [signal], {
        equals: equals ?? Counter.equals,
      }),
  ],
])("factory with %s comparator", (_, useHook) => {
  it("swapping equals", () => {
    const initial = { count: 0 }
    const signal = Signal(initial)

    const { result, rerender } = renderHook<Counter, WithSignal & WithEquals>(useHook, {
      initialProps: { signal },
    })
    expect(result.current).toBe(initial)

    act(() => {
      signal.write({ count: 0 })
    })
    expect(result.current).toBe(initial)

    rerender({
      signal,
      equals: Object.is,
    })
    expect(result.current).toBe(initial)

    act(() => {
      signal.write({ count: 0 })
    })
    expect(result.current).not.toBe(initial)
    expect(result.current).toStrictEqual(initial)
  })
})
