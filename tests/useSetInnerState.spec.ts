import { Dispatch, SetStateAction } from "react"
import { act, renderHook } from "@testing-library/react-hooks"

import { Compare, InnerStore, useSetInnerState } from "../src"

import { Counter } from "./helpers"

describe("bypassed store", () => {
  it.concurrent("noop for null", () => {
    const { result } = renderHook(() => useSetInnerState<number>(null))

    expect(() => {
      result.current(1)
    }).not.toThrow()
  })

  it.concurrent("noop for undefined", () => {
    // eslint-disable-next-line no-undefined
    const { result } = renderHook(() => useSetInnerState<number>(undefined))

    expect(() => {
      result.current(1)
    }).not.toThrow()
  })
})

describe("defined store", () => {
  it.concurrent("keeps setState value over time", () => {
    const store = InnerStore.of(0)
    const onRender = jest.fn()
    const { result, rerender } = renderHook(() => {
      onRender()

      return useSetInnerState(store)
    })

    const dispatch = result.current

    expect(onRender).toHaveBeenCalledTimes(1)
    expect(result.all).toHaveLength(1)
    jest.clearAllMocks()

    rerender()
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(result.all).toHaveLength(2)
    expect(result.current).toBe(dispatch)
    jest.clearAllMocks()

    dispatch(1)
    expect(onRender).not.toHaveBeenCalled()
    expect(result.all).toHaveLength(2)
    expect(result.current).toBe(dispatch)
    jest.clearAllMocks()

    rerender()
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(result.all).toHaveLength(3)
    expect(result.current).toBe(dispatch)
  })

  describe("calls setState(value)", () => {
    let prev = { count: 0 }
    const store = InnerStore.of(prev)
    const spy = jest.fn()
    const unsubscribe = store.subscribe(spy)
    const { result } = renderHook(() => useSetInnerState(store))
    const setState = result.current

    beforeEach(() => {
      prev = store.getState()
      jest.clearAllMocks()
    })

    it("sets new state", () => {
      act(() => {
        setState({ count: 1 })
      })
      const state = store.getState()
      expect(state).not.toBe(prev)
      expect(state).toStrictEqual({ count: 1 })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it("sets same state", () => {
      act(() => {
        setState({ count: 1 })
      })
      const state = store.getState()
      expect(state).not.toBe(prev)
      expect(state).toStrictEqual({ count: 1 })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it("sets equal state", () => {
      act(() => {
        setState(prev)
      })
      const state = store.getState()
      expect(state).toBe(prev)
      expect(spy).not.toHaveBeenCalled()
    })

    it("unsubscribes", () => {
      unsubscribe()

      act(() => {
        setState({ count: 3 })
      })
      const state = store.getState()
      expect(state).not.toBe(prev)
      expect(state).toStrictEqual({ count: 3 })
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe("calls setState(transform)", () => {
    let prev = { count: 0 }
    const store = InnerStore.of(prev)
    const spy = jest.fn()
    const unsubscribe = store.subscribe(spy)
    const { result } = renderHook(() => useSetInnerState(store))
    const setState = result.current

    beforeEach(() => {
      prev = store.getState()
      jest.clearAllMocks()
    })

    it("sets new state", () => {
      act(() => {
        setState(Counter.inc)
      })
      const state = store.getState()
      expect(state).not.toBe(prev)
      expect(state).toStrictEqual({ count: 1 })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it("sets same state", () => {
      act(() => {
        setState(Counter.clone)
      })
      const state = store.getState()
      expect(state).not.toBe(prev)
      expect(state).toStrictEqual({ count: 1 })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it("sets equal state", () => {
      act(() => {
        setState(() => prev)
      })
      const state = store.getState()
      expect(state).toBe(prev)
      expect(spy).not.toHaveBeenCalled()
    })

    it("unsubscribes", () => {
      unsubscribe()

      act(() => {
        setState(Counter.inc)
      })
      const state = store.getState()
      expect(state).not.toBe(prev)
      expect(state).toStrictEqual({ count: 2 })
      expect(spy).not.toHaveBeenCalled()
    })
  })
})

// TODO continue from here
describe("defined store with compare", () => {
  it("keeps dispatch value over time", () => {
    const store = InnerStore.of({ count: 0 })
    const onRender = jest.fn()
    const { result, rerender } = renderHook<
      {
        compare?: Compare<Counter>
      },
      Dispatch<SetStateAction<Counter>>
    >(
      ({ compare }) => {
        onRender()

        return useSetInnerState(store, compare)
      },
      {
        initialProps: {
          compare: Counter.compare,
        },
      },
    )

    const dispatch = result.current

    expect(onRender).toHaveBeenCalledTimes(1)
    expect(result.all).toHaveLength(1)

    rerender({
      compare: (...args) => Counter.compare(...args),
    })
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(result.all).toHaveLength(2)
    expect(result.current).toBe(dispatch)

    dispatch(Counter.inc)
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(result.all).toHaveLength(2)
    expect(result.current).toBe(dispatch)

    rerender({})
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(result.all).toHaveLength(3)
    expect(result.current).toBe(dispatch)
  })

  it("changes state", () => {
    const store = InnerStore.of({ count: 0 })
    const spy = jest.fn()
    const spyCompare = jest.fn(Counter.compare)
    const unsubscribe = store.subscribe(spy)
    const { result } = renderHook(() => useSetInnerState(store, spyCompare))
    const dispatch = result.current

    const prev_1 = store.getState()
    act(() => {
      dispatch(Counter.inc)
    })
    const state_1 = store.getState()
    expect(state_1).not.toBe(prev_1)
    expect(state_1).toStrictEqual({ count: 1 })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spyCompare).toHaveBeenCalledTimes(1)

    const prev_2 = store.getState()
    act(() => {
      dispatch(Counter.clone)
    })
    const state_2 = store.getState()
    expect(state_2).toBe(prev_2)
    expect(state_2).toStrictEqual({ count: 1 })
    expect(spy).toHaveBeenCalledTimes(1) // does not emit listener
    expect(spyCompare).toHaveBeenCalledTimes(2)

    unsubscribe()

    const prev_3 = store.getState()
    act(() => {
      dispatch({ count: 10 })
    })
    const state_3 = store.getState()
    expect(state_3).not.toBe(prev_3)
    expect(state_3).toStrictEqual({ count: 10 })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spyCompare).toHaveBeenCalledTimes(3)
  })
})
