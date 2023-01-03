import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { Impulse, useWatchImpulse } from "../../src"
import { Counter, WithCompare, WithStore } from "../common"
import { Compare, isEqual } from "../../src/utils"

describe.each([
  [
    "inline watcher",
    ({ store }: WithStore, compare?: Compare<Counter>) => {
      return useWatchImpulse(() => store.getState(), compare)
    },
  ],
  [
    "memoized watcher",
    ({ store }: WithStore, compare?: Compare<Counter>) => {
      return useWatchImpulse(
        useCallback(() => store.getState(), [store]),
        compare,
      )
    },
  ],
])("with %s", (_, useHookWithoutCompare) => {
  describe.each([
    [
      "with inline comparator",
      ({ compare, ...props }: WithStore & WithCompare) => {
        const cmp = compare ?? Counter.compare

        return useHookWithoutCompare(props, (prev, next) => cmp(prev, next))
      },
    ],
    [
      "with memoized comparator",
      ({ compare, ...props }: WithStore & WithCompare) => {
        return useHookWithoutCompare(props, compare ?? Counter.compare)
      },
    ],
  ])("%s", (__, useHook) => {
    it.concurrent("swapping compare", () => {
      const initial = { count: 0 }
      const store = Impulse.of(initial)

      const { result, rerender } = renderHook(useHook, {
        initialProps: { store },
      })
      expect(result.current).toBe(initial)

      act(() => {
        store.setState({ count: 0 })
      })
      expect(result.current).toBe(initial)

      rerender({
        store,
        compare: isEqual,
      })
      expect(result.current).toBe(initial)

      act(() => {
        store.setState({ count: 0 })
      })
      expect(result.current).not.toBe(initial)
      expect(result.current).toStrictEqual(initial)
    })
  })
})
