import { useCallback } from "react"
import { renderHook } from "@testing-library/react"

import { useWatchImpulse } from "../../src"

describe("watching no impulses", () => {
  it.each([
    [
      "inline",
      () => {
        return useWatchImpulse(() => 1)
      },
    ],
    [
      "memoized",
      () => {
        return useWatchImpulse(useCallback(() => 1, []))
      },
    ],
  ])("returns %s watcher result", (_, useHook) => {
    const { result } = renderHook(useHook)

    expect(result.current).toBe(1)
  })

  it.each([
    [
      "inline",
      ({ value }: { value: number }) => {
        return useWatchImpulse(() => 2 * value)
      },
    ],
    [
      "memoized",
      ({ value }: { value: number }) => {
        return useWatchImpulse(useCallback(() => 2 * value, [value]))
      },
    ],
  ])("returns %s watcher result from clojure", (_, useHook) => {
    const { result, rerender } = renderHook(useHook, {
      initialProps: { value: 2 },
    })

    expect(result.current).toBe(4)

    rerender({ value: 3 })
    expect(result.current).toBe(6)
  })
})
