import { act, renderHook } from "@testing-library/react"

import { Impulse, type Scope, useScoped } from "../../src"
import { Counter, type WithEquals, type WithImpulse } from "../common"

function factory(scope: Scope, { impulse }: WithImpulse) {
  return impulse.read(scope)
}

describe.each([
  [
    "inline",
    ({ impulse, equals }: WithImpulse & WithEquals) => {
      const cmp = equals ?? Counter.equals

      return useScoped((scope) => factory(scope, { impulse }), [impulse], {
        equals: (prev, next) => cmp(prev, next),
      })
    },
  ],
  [
    "memoized",
    ({ impulse, equals }: WithImpulse & WithEquals) =>
      useScoped((scope) => factory(scope, { impulse }), [impulse], {
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
      impulse.setValue({ count: 0 })
    })
    expect(result.current).toBe(initial)

    rerender({
      impulse,
      equals: Object.is,
    })
    expect(result.current).toBe(initial)

    act(() => {
      impulse.setValue({ count: 0 })
    })
    expect(result.current).not.toBe(initial)
    expect(result.current).toStrictEqual(initial)
  })
})
