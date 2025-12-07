import { act, render, renderHook } from "@testing-library/react"
import React from "react"

import { Impulse, useScope } from "../src"

it("does not change scope value unless scoped impulse changes", () => {
  const spy = vi.fn()
  const impulse = Impulse(1)
  const { result, rerender } = renderHook(() => {
    const scope = useScope()

    React.useEffect(() => {
      spy(scope)
    }, [scope])

    return impulse.read(scope)
  })

  expect(result.current).toBe(1)
  expect(spy).toHaveBeenCalledTimes(1)

  rerender()
  expect(result.current).toBe(1)
  expect(spy).toHaveBeenCalledTimes(1)

  act(() => {
    impulse.update(2)
  })
  expect(result.current).toBe(2)
  expect(spy).toHaveBeenCalledTimes(2)
})

function Component({ value }: { value: Impulse<number> }) {
  const scope = useScope()

  return <>{value.read(scope)}</>
}

it("cannot unsubscribe when swapped", () => {
  const value1 = Impulse(1)
  const value2 = Impulse(3)
  const onRender = vi.fn()

  const { rerender } = render(<Component value={value1} />, {
    wrapper: ({ children }) => (
      <React.Profiler id="test" onRender={onRender}>
        {children}
      </React.Profiler>
    ),
  })

  expect(value1).toHaveEmittersSize(1)
  expect(value2).toHaveEmittersSize(0)

  rerender(<Component value={value2} />)
  /**
   * Not 0 because a scope cannot cleanup on every rerender,
   * otherwise memo/effect hooks with the scope dependency will lose subscriptions too eagerly.
   */
  expect(value1).toHaveEmittersSize(1)
  expect(value2).toHaveEmittersSize(1)

  vi.clearAllMocks()

  act(() => {
    value1.update(10)
  })

  expect(onRender).toHaveBeenCalledOnce()
  vi.clearAllMocks()

  act(() => {
    value2.update(5)
  })
  expect(onRender).toHaveBeenCalledOnce()

  expect(value1).toHaveEmittersSize(0)
  expect(value2).toHaveEmittersSize(1)
})
