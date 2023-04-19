import { act, renderHook } from "@testing-library/react-hooks"

import { Impulse, useScoped } from "../../src"
import { Counter, WithCompare, WithImpulse } from "../common"
import { isEqual } from "../../src/utils"

describe.each([
  [
    "with inline comparator",
    ({ compare, impulse }: WithImpulse & WithCompare) => {
      const cmp = compare ?? Counter.compare

      return useScoped(
        (scope) => impulse.getValue(scope),
        [impulse],
        (prev, next) => cmp(prev, next),
      )
    },
  ],
  [
    "with memoized comparator",
    ({ compare, impulse }: WithImpulse & WithCompare) => {
      return useScoped(
        (scope) => impulse.getValue(scope),
        [impulse],
        compare ?? Counter.compare,
      )
    },
  ],
])("%s", (__, useHook) => {
  it.concurrent("swapping compare", () => {
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
      compare: isEqual,
    })
    expect(result.current).toBe(initial)

    act(() => {
      impulse.setValue({ count: 0 })
    })
    expect(result.current).not.toBe(initial)
    expect(result.current).toStrictEqual(initial)
  })
})
