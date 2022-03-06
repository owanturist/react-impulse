import { useCallback } from "react"
import { renderHook } from "@testing-library/react-hooks"

import { useInnerWatch } from "../../src"

describe("watching no stores", () => {
  it.concurrent.each([
    [
      "inline",
      () => {
        return useInnerWatch(() => 1)
      },
    ],
    [
      "memoized",
      () => {
        return useInnerWatch(useCallback(() => 1, []))
      },
    ],
  ])("returns %s watcher result", (_, useHook) => {
    const { result } = renderHook(useHook)

    expect(result.current).toBe(1)
  })

  it.concurrent.each([
    [
      "inline",
      ({ value }: { value: number }) => {
        return useInnerWatch(() => 2 * value)
      },
    ],
    [
      "memoized",
      ({ value }: { value: number }) => {
        return useInnerWatch(useCallback(() => 2 * value, [value]))
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
