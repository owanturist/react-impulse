import { act, renderHook } from "@testing-library/react"

import { Impulse, type Scope, useScoped } from "../../src"
import { Counter, type WithCompare, type WithImpulse } from "../common"

const factory = (scope: Scope, { impulse }: WithImpulse) =>
  impulse.getValue(scope)

describe.each([
  [
    "inline",
    ({ impulse, compare }: WithImpulse & WithCompare) => {
      const cmp = compare ?? Counter.compare

      return useScoped((scope) => factory(scope, { impulse }), [impulse], {
        compare: (prev, next) => cmp(prev, next),
      })
    },
  ],
  [
    "memoized",
    ({ impulse, compare }: WithImpulse & WithCompare) => {
      return useScoped((scope) => factory(scope, { impulse }), [impulse], {
        compare: compare ?? Counter.compare,
      })
    },
  ],
])("factory with %s comparator", (__, useHook) => {
  it("swapping compare", () => {
    const initial = { count: 0 }
    const impulse = Impulse.of(initial)

    const { result, rerender } = renderHook(useHook, {
      initialProps: { impulse },
    })
    expect(result.current).toBe(initial)

    act(() => {
      impulse.setValue({ count: 0 })
    })
    expect(result.current).toBe(initial)

    rerender({
      impulse,
      compare: Object.is,
    })
    expect(result.current).toBe(initial)

    act(() => {
      impulse.setValue({ count: 0 })
    })
    expect(result.current).not.toBe(initial)
    expect(result.current).toStrictEqual(initial)
  })
})
