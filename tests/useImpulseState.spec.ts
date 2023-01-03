import { act, renderHook } from "@testing-library/react-hooks"

import { Impulse, useImpulseState } from "../src"

import { Counter } from "./common"

it.concurrent("returns initial state", () => {
  const initial = { count: 0 }
  const impulse = Impulse.of(initial)

  const { result } = renderHook(() => useImpulseState(impulse))

  expect(result.current).toBe(initial)
  expect(result.current).toBe(impulse.getState())
  expect(result.current).toStrictEqual({ count: 0 })
})

it.concurrent("returns the same value when the hook re-renders", () => {
  const impulse = Impulse.of({ count: 0 })

  const { result, rerender } = renderHook(() => useImpulseState(impulse))
  const firstResult = result.current

  rerender()

  expect(result.current).toBe(firstResult)
  expect(result.current).toBe(impulse.getState())
  expect(result.current).toStrictEqual({ count: 0 })
})

it.concurrent("watches after impulse's updates", () => {
  const initial = { count: 0 }
  const impulse = Impulse.of(initial)

  const { result } = renderHook(() => useImpulseState(impulse))

  act(() => {
    impulse.setState(Counter.inc)
  })

  expect(result.current).not.toBe(initial)
  expect(result.current).toBe(impulse.getState())
  expect(result.current).toStrictEqual({ count: 1 })
})

it.concurrent("re-subscribes on new impulse", () => {
  const impulse_1 = Impulse.of({ count: 0 })
  const impulse_2 = Impulse.of({ count: 10 })

  const { result, rerender } = renderHook(
    (impulse) => useImpulseState(impulse),
    {
      initialProps: impulse_1,
    },
  )

  rerender(impulse_2)

  expect(result.current).not.toBe(impulse_1.getState())
  expect(result.current).toBe(impulse_2.getState())
  expect(result.current).toStrictEqual({ count: 10 })

  act(() => {
    impulse_1.setState(Counter.inc)
  })

  expect(impulse_1.getState()).toStrictEqual({ count: 1 })
  expect(result.current).toBe(impulse_2.getState())
  expect(result.current).toStrictEqual({ count: 10 })

  act(() => {
    impulse_2.setState(Counter.inc)
  })

  expect(impulse_1.getState()).toStrictEqual({ count: 1 })
  expect(result.current).toBe(impulse_2.getState())
  expect(result.current).toStrictEqual({ count: 11 })
})
