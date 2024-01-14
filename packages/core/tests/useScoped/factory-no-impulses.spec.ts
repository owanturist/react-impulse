import { useCallback } from "react"
import { renderHook } from "@testing-library/react"

import { useScoped } from "../../src"

describe("factory no impulses", () => {
  it.each([
    [
      "inline",
      () => {
        // eslint-disable-next-line no-restricted-syntax
        return useScoped(() => 1)
      },
    ],
    [
      "memoized",
      () => {
        // eslint-disable-next-line no-restricted-syntax
        return useScoped(() => 1, [])
      },
    ],
  ])("returns %s factory result", (_, useHook) => {
    const { result } = renderHook(useHook)

    expect(result.current).toBe(1)
  })

  it.each([
    [
      "inline",
      ({ value }: { value: number }) => {
        // eslint-disable-next-line no-restricted-syntax
        return useScoped(() => 2 * value)
      },
    ],
    [
      "memoized",
      ({ value }: { value: number }) => {
        return useScoped(useCallback(() => 2 * value, [value]))
      },
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
