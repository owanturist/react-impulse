import { renderHook } from "@testing-library/react"
import { useCallback } from "react"

import { useComputed } from "../../src"

describe("factory no impulses", () => {
  it.each([
    ["inline", () => useComputed(() => 1)],
    ["memoized", () => useComputed(() => 1, [])],
  ])("returns %s factory result", (_, useHook) => {
    const { result } = renderHook(useHook)

    expect(result.current).toBe(1)
  })

  it.each([
    ["inline", ({ value }: { value: number }) => useComputed(() => 2 * value)],
    [
      "memoized",
      ({ value }: { value: number }) => useComputed(useCallback(() => 2 * value, [value])),
    ],
  ])("returns %s factory result from clojure", (_, useHook) => {
    const { result, rerender } = renderHook(useHook, {
      initialProps: { value: 2 },
    })

    expect(result.current).toBe(4)

    rerender({ value: 3 })
    expect(result.current).toBe(6)
  })
})
