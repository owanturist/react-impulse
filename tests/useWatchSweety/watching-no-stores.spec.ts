import { useCallback } from "react"
import { renderHook } from "@testing-library/react-hooks"

import { useWatchSweety } from "../../src"

describe("watching no stores", () => {
  it.each([
    [
      "inline",
      () => {
        return useWatchSweety(() => 1)
      },
    ],
    [
      "memoized",
      () => {
        return useWatchSweety(useCallback(() => 1, []))
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
        return useWatchSweety(() => 2 * value)
      },
    ],
    [
      "memoized",
      ({ value }: { value: number }) => {
        return useWatchSweety(useCallback(() => 2 * value, [value]))
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
