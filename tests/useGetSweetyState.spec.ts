import { act, renderHook } from "@testing-library/react-hooks"

import { Sweety, useGetSweetyState } from "../src"

import { Counter } from "./common"

it.concurrent("returns initial state", () => {
  const initial = { count: 0 }
  const store = Sweety.of(initial)

  const { result } = renderHook(() => useGetSweetyState(store))

  expect(result.current).toBe(initial)
  expect(result.current).toBe(store.getState())
  expect(result.current).toStrictEqual({ count: 0 })
})

it.concurrent("returns the same value when the hook re-renders", () => {
  const store = Sweety.of({ count: 0 })

  const { result, rerender } = renderHook(() => useGetSweetyState(store))
  const firstResult = result.current

  rerender()

  expect(result.current).toBe(firstResult)
  expect(result.current).toBe(store.getState())
  expect(result.current).toStrictEqual({ count: 0 })
})

it.concurrent("watches after store's updates", () => {
  const initial = { count: 0 }
  const store = Sweety.of(initial)

  const { result } = renderHook(() => useGetSweetyState(store))

  act(() => {
    store.setState(Counter.inc)
  })

  expect(result.current).not.toBe(initial)
  expect(result.current).toBe(store.getState())
  expect(result.current).toStrictEqual({ count: 1 })
})

it.concurrent("re-subscribes on new store", () => {
  const store_1 = Sweety.of({ count: 0 })
  const store_2 = Sweety.of({ count: 10 })

  const { result, rerender } = renderHook((store) => useGetSweetyState(store), {
    initialProps: store_1,
  })

  rerender(store_2)

  expect(result.current).not.toBe(store_1.getState())
  expect(result.current).toBe(store_2.getState())
  expect(result.current).toStrictEqual({ count: 10 })

  act(() => {
    store_1.setState(Counter.inc)
  })

  expect(store_1.getState()).toStrictEqual({ count: 1 })
  expect(result.current).toBe(store_2.getState())
  expect(result.current).toStrictEqual({ count: 10 })

  act(() => {
    store_2.setState(Counter.inc)
  })

  expect(store_1.getState()).toStrictEqual({ count: 1 })
  expect(result.current).toBe(store_2.getState())
  expect(result.current).toStrictEqual({ count: 11 })
})
