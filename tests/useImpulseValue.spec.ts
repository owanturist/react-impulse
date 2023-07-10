import { act, renderHook } from "@testing-library/react"

import { Impulse, useImpulseValue } from "../src"

import { Counter } from "./common"

it("returns initial value", () => {
  const initial = { count: 0 }
  const impulse = Impulse.of(initial)

  const { result } = renderHook(() => useImpulseValue(impulse))

  expect(result.current).toBe(initial)
  expect(result.current).toBe(impulse.getValue())
  expect(result.current).toStrictEqual({ count: 0 })
})

it("returns the same value when the hook re-renders", () => {
  const impulse = Impulse.of({ count: 0 })

  const { result, rerender } = renderHook(() => useImpulseValue(impulse))
  const firstResult = result.current

  rerender()

  expect(result.current).toBe(firstResult)
  expect(result.current).toBe(impulse.getValue())
  expect(result.current).toStrictEqual({ count: 0 })
})

it("watches after Impulse's updates", () => {
  const initial = { count: 0 }
  const impulse = Impulse.of(initial)

  const { result } = renderHook(() => useImpulseValue(impulse))

  act(() => {
    impulse.setValue(Counter.inc)
  })

  expect(result.current).not.toBe(initial)
  expect(result.current).toBe(impulse.getValue())
  expect(result.current).toStrictEqual({ count: 1 })
})

it("re-subscribes on new impulse", () => {
  const impulse_1 = Impulse.of({ count: 0 })
  const impulse_2 = Impulse.of({ count: 10 })

  const { result, rerender } = renderHook(
    (impulse) => useImpulseValue(impulse),
    {
      initialProps: impulse_1,
    },
  )

  rerender(impulse_2)

  expect(result.current).not.toBe(impulse_1.getValue())
  expect(result.current).toBe(impulse_2.getValue())
  expect(result.current).toStrictEqual({ count: 10 })

  act(() => {
    impulse_1.setValue(Counter.inc)
  })

  expect(impulse_1.getValue()).toStrictEqual({ count: 1 })
  expect(result.current).toBe(impulse_2.getValue())
  expect(result.current).toStrictEqual({ count: 10 })

  act(() => {
    impulse_2.setValue(Counter.inc)
  })

  expect(impulse_1.getValue()).toStrictEqual({ count: 1 })
  expect(result.current).toBe(impulse_2.getValue())
  expect(result.current).toStrictEqual({ count: 11 })
})
