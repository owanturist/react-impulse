import { act, renderHook } from "@testing-library/react"
import { useEffect } from "react"

import { Impulse, useScope } from "../src"

it("does not change scope value unless scoped impulse changes", () => {
  const spy = vi.fn()
  const impulse = Impulse(1)
  const { result, rerender } = renderHook(() => {
    const scope = useScope()

    useEffect(() => {
      spy(scope)
    }, [scope])

    return impulse.getValue(scope)
  })

  expect(result.current).toBe(1)
  expect(spy).toHaveBeenCalledTimes(1)

  rerender()
  expect(result.current).toBe(1)
  expect(spy).toHaveBeenCalledTimes(1)

  act(() => {
    impulse.setValue(2)
  })
  expect(result.current).toBe(2)
  expect(spy).toHaveBeenCalledTimes(2)
})
