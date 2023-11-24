import { act, renderHook } from "@testing-library/react"

import { Impulse, useWatchImpulse } from "../../src"
import { Counter, type WithCompare, type WithImpulse } from "../common"

describe("watcher", () => {
  const watcher = ({ impulse }: WithImpulse) => impulse.getValue()

  describe.each([
    [
      "with inline comparator",
      ({ impulse, compare }: WithImpulse & WithCompare) => {
        const cmp = compare ?? Counter.compare

        return useWatchImpulse(() => watcher({ impulse }), [impulse], {
          compare: (prev, next) => cmp(prev, next),
        })
      },
    ],
    [
      "with memoized comparator",
      ({ impulse, compare }: WithImpulse & WithCompare) => {
        return useWatchImpulse(() => watcher({ impulse }), [impulse], {
          compare: compare ?? Counter.compare,
        })
      },
    ],
  ])("%s", (__, useHook) => {
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
})
