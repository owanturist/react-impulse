import { act, renderHook } from "@testing-library/react"

import { Impulse, type Monitor, useComputed } from "../../src"
import { Counter, type WithEquals, type WithImpulse } from "../common"

function factory(monitor: Monitor, { impulse }: WithImpulse) {
  return impulse.read(monitor)
}

describe.each([
  [
    "inline",
    ({ impulse, equals }: WithImpulse & WithEquals) => {
      const cmp = equals ?? Counter.equals

      return useComputed((monitor) => factory(monitor, { impulse }), [impulse], {
        equals: (prev, next) => cmp(prev, next),
      })
    },
  ],
  [
    "memoized",
    ({ impulse, equals }: WithImpulse & WithEquals) =>
      useComputed((monitor) => factory(monitor, { impulse }), [impulse], {
        equals: equals ?? Counter.equals,
      }),
  ],
])("factory with %s comparator", (_, useHook) => {
  it("swapping equals", () => {
    const initial = { count: 0 }
    const impulse = Impulse(initial)

    const { result, rerender } = renderHook<Counter, WithImpulse & WithEquals>(useHook, {
      initialProps: { impulse },
    })
    expect(result.current).toBe(initial)

    act(() => {
      impulse.update({ count: 0 })
    })
    expect(result.current).toBe(initial)

    rerender({
      impulse,
      equals: Object.is,
    })
    expect(result.current).toBe(initial)

    act(() => {
      impulse.update({ count: 0 })
    })
    expect(result.current).not.toBe(initial)
    expect(result.current).toStrictEqual(initial)
  })
})
