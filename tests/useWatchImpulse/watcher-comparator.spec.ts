import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { Impulse, useWatchImpulse } from "../../src"
import { Counter, WithCompare, WithImpulse } from "../common"
import { Compare, isEqual } from "../../src/utils"

describe.each([
  [
    "inline watcher",
    ({ impulse }: WithImpulse, compare?: Compare<Counter>) => {
      return useWatchImpulse(() => impulse.getState(), compare)
    },
  ],
  [
    "memoized watcher",
    ({ impulse }: WithImpulse, compare?: Compare<Counter>) => {
      return useWatchImpulse(
        useCallback(() => impulse.getState(), [impulse]),
        compare,
      )
    },
  ],
])("with %s", (_, useHookWithoutCompare) => {
  describe.each([
    [
      "with inline comparator",
      ({ compare, ...props }: WithImpulse & WithCompare) => {
        const cmp = compare ?? Counter.compare

        return useHookWithoutCompare(props, (prev, next) => cmp(prev, next))
      },
    ],
    [
      "with memoized comparator",
      ({ compare, ...props }: WithImpulse & WithCompare) => {
        return useHookWithoutCompare(props, compare ?? Counter.compare)
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
        impulse.setState({ count: 0 })
      })
      expect(result.current).toBe(initial)

      rerender({
        impulse,
        compare: isEqual,
      })
      expect(result.current).toBe(initial)

      act(() => {
        impulse.setState({ count: 0 })
      })
      expect(result.current).not.toBe(initial)
      expect(result.current).toStrictEqual(initial)
    })
  })
})
