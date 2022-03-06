import { useCallback } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { InnerStore, useInnerWatch } from "../src"

import { Counter } from "./helpers"

interface WithStore<T = Counter> {
  store: InnerStore<T>
}

interface WithFirst<T = Counter> {
  first: InnerStore<T>
}

interface WithSecond<T = Counter> {
  second: InnerStore<T>
}

describe("nested stores are watching", () => {
  describe.each([
    [
      "inline watcher",
      ({ store }: WithStore<WithFirst & WithSecond>) => {
        return useInnerWatch(() => {
          const { first, second } = store.getState()

          return (
            first.getState(Counter.getCount) * second.getState(Counter.getCount)
          )
        })
      },
    ],
    [
      "memoized watcher",
      ({ store }: WithStore<WithFirst & WithSecond>) => {
        return useInnerWatch(
          useCallback(() => {
            const { first, second } = store.getState()

            return (
              first.getState(Counter.getCount) *
              second.getState(Counter.getCount)
            )
          }, [store]),
        )
      },
    ],
  ])("direct %s watching", (_, hook) => {
    const setup = () => {
      const first = InnerStore.of({ count: 2 })
      const second = InnerStore.of({ count: 2 })
      const store = InnerStore.of({ first, second })
      const { result } = renderHook(hook, {
        initialProps: { store },
      })

      return { store, first, second, result }
    }

    it.concurrent("initiates with expected result", () => {
      const { result } = setup()

      expect(result.current).toBe(4)
    })

    it.concurrent("increments only first", () => {
      const { first, result } = setup()

      act(() => {
        first.setState(Counter.inc)
      })
      expect(result.current).toBe(6)
    })

    it.concurrent("increments only second", () => {
      const { second, result } = setup()

      act(() => {
        second.setState(Counter.inc)
      })
      expect(result.current).toBe(6)
    })

    it.concurrent("increments both first and second", () => {
      const { first, second, result } = setup()

      act(() => {
        first.setState(Counter.inc)
        second.setState(Counter.inc)
      })
      expect(result.current).toBe(9)
    })

    it.concurrent("replaces nested stores", () => {
      const newFirst = InnerStore.of({ count: 4 })
      const { store, result } = setup()

      act(() => {
        store.setState((state) => ({
          ...state,
          first: newFirst,
        }))
      })
      expect(result.current).toBe(8)
    })

    it.concurrent("updates nested stores", () => {
      const { store, result } = setup()

      act(() => {
        store.setState((state) => {
          state.first.setState(Counter.inc)
          state.second.setState(Counter.inc)

          return state
        })
      })
      expect(result.current).toBe(9)
    })
  })
})
