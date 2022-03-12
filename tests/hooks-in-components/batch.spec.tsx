import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import {
  batch,
  InnerStore,
  useGetInnerState,
  useSetInnerState,
  useInnerState,
  useInnerWatch,
} from "../../src"
import { Counter } from "../common"

describe.each([
  ["not batched", (cb: VoidFunction) => cb()],
  ["batched", batch],
])("multiple stores %s calls with direct store access", (_, execute) => {
  it("re-renders once for InnerStore#setState calls", () => {
    const onRender = jest.fn()
    const store_1 = InnerStore.of({ count: 1 })
    const store_2 = InnerStore.of({ count: 2 })

    const Component: React.VFC = () => {
      const counter_1 = useGetInnerState(store_1)
      const counter_2 = useGetInnerState(store_2)

      onRender()

      return (
        <span data-testid="count">{counter_1.count + counter_2.count}</span>
      )
    }

    render(<Component />)

    expect(screen.getByTestId("count")).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledTimes(1)

    act(() => {
      execute(() => {
        store_1.setState(Counter.inc)
        store_2.setState(Counter.inc)
      })
    })
    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledTimes(2)
  })

  it("re-renders once for useInnerState calls", () => {
    const onRender = jest.fn()
    const store_1 = InnerStore.of({ count: 1 })
    const store_2 = InnerStore.of({ count: 2 })

    const Component: React.VFC = () => {
      const [counter_1, setCounter_1] = useInnerState(store_1)
      const [counter_2, setCounter_2] = useInnerState(store_2)

      onRender()

      return (
        <div>
          <button
            type="button"
            data-testid="inc"
            onClick={() => {
              execute(() => {
                setCounter_1(Counter.inc)
                setCounter_2(Counter.inc)
              })
            }}
          />
          <span data-testid="count">{counter_1.count + counter_2.count}</span>
        </div>
      )
    }

    render(<Component />)

    expect(screen.getByTestId("count")).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId("inc"))
    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledTimes(2)
  })
})

describe.each([
  ["not batched", (cb: VoidFunction) => cb()],
  ["batched", batch],
])("nested stores %s calls with direct store access", (_, execute) => {
  it("re-renders once for InnerStore#setState calls", () => {
    const onRender = jest.fn()
    const store = InnerStore.of({
      first: InnerStore.of({ count: 1 }),
      second: InnerStore.of({ count: 2 }),
    })

    const Component: React.VFC = () => {
      const { first: store_1, second: store_2 } = useGetInnerState(store)
      const counter_1 = useGetInnerState(store_1)
      const counter_2 = useGetInnerState(store_2)

      onRender()

      return (
        <span data-testid="count">{counter_1.count + counter_2.count}</span>
      )
    }

    render(<Component />)

    expect(screen.getByTestId("count")).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledTimes(1)

    act(() => {
      execute(() => {
        store.setState((state) => {
          state.first.setState(Counter.inc)
          state.second.setState(Counter.inc)

          return state
        })
      })
    })
    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledTimes(2)

    act(() => {
      store.setState((state) => {
        execute(() => {
          state.first.setState(Counter.inc)
          state.second.setState(Counter.inc)
        })

        return state
      })
    })
    expect(screen.getByTestId("count")).toHaveTextContent("7")
    expect(onRender).toHaveBeenCalledTimes(3)
  })

  it("re-renders once for useInnerState calls", () => {
    const onRender = jest.fn()
    const store = InnerStore.of({
      first: InnerStore.of({ count: 1 }),
      second: InnerStore.of({ count: 2 }),
    })

    const Component: React.VFC = () => {
      const [{ first: store_1, second: store_2 }, setState] =
        useInnerState(store)
      const counter_1 = useGetInnerState(store_1)
      const counter_2 = useGetInnerState(store_2)

      onRender()

      return (
        <div>
          <button
            type="button"
            data-testid="inc-1"
            onClick={() => {
              execute(() => {
                setState((state) => {
                  state.first.setState(Counter.inc)
                  state.second.setState(Counter.inc)

                  return state
                })
              })
            }}
          />
          <button
            type="button"
            data-testid="inc-2"
            onClick={() => {
              setState((state) => {
                execute(() => {
                  state.first.setState(Counter.inc)
                  state.second.setState(Counter.inc)
                })

                return state
              })
            }}
          />
          <span data-testid="count">{counter_1.count + counter_2.count}</span>
        </div>
      )
    }

    render(<Component />)

    expect(screen.getByTestId("count")).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId("inc-1"))
    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledTimes(2)

    fireEvent.click(screen.getByTestId("inc-2"))
    expect(screen.getByTestId("count")).toHaveTextContent("7")
    expect(onRender).toHaveBeenCalledTimes(3)
  })
})

describe.each([
  {
    name: "no batching for inline watcher",
    expectedWatcherCallsForMultiple: 4,
    expectedWatcherCallsForNested: 3,
    execute: (cb: VoidFunction) => cb(),
    useCount: (watcher: () => number) => {
      return useInnerWatch(() => watcher())
    },
  },
  {
    name: "with batching for inline watcher",
    expectedWatcherCallsForMultiple: 3,
    expectedWatcherCallsForNested: 3,
    execute: batch,
    useCount: (watcher: () => number) => {
      return useInnerWatch(() => watcher())
    },
  },
  {
    name: "no batching for memoized watcher",
    expectedWatcherCallsForMultiple: 2,
    expectedWatcherCallsForNested: 1,
    execute: (cb: VoidFunction) => cb(),
    useCount: (watcher: () => number) => {
      return useInnerWatch(React.useCallback(() => watcher(), [watcher]))
    },
  },
  {
    name: "with batching for memoized watcher",
    expectedWatcherCallsForMultiple: 1,
    expectedWatcherCallsForNested: 1,
    execute: batch,
    useCount: (watcher: () => number) => {
      return useInnerWatch(React.useCallback(() => watcher(), [watcher]))
    },
  },
])(
  "when $name",
  ({
    expectedWatcherCallsForMultiple,
    expectedWatcherCallsForNested,
    execute,
    useCount,
  }) => {
    describe("for multiple stores", () => {
      const setup = () => {
        const spy = jest.fn()
        const onRender = jest.fn()
        const first = InnerStore.of({ count: 1 })
        const second = InnerStore.of({ count: 2 })
        const watcher = () => {
          spy()

          return (
            first.getState(Counter.getCount) + second.getState(Counter.getCount)
          )
        }

        return { spy, onRender, first, second, watcher }
      }

      it(`calls the watcher ${expectedWatcherCallsForMultiple} times by InnerStore#setState calls`, () => {
        const { spy, onRender, first, second, watcher } = setup()

        const Component: React.VFC = () => {
          const count = useCount(watcher)

          onRender()

          return <span data-testid="count">{count}</span>
        }

        render(<Component />)

        expect(screen.getByTestId("count")).toHaveTextContent("3")
        expect(onRender).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledTimes(2)
        spy.mockReset()

        act(() => {
          execute(() => {
            first.setState(Counter.inc)
            second.setState(Counter.inc)
          })
        })
        expect(screen.getByTestId("count")).toHaveTextContent("5")
        expect(onRender).toHaveBeenCalledTimes(2)
        expect(spy).toHaveBeenCalledTimes(expectedWatcherCallsForMultiple)
      })

      it(`calls the watcher ${expectedWatcherCallsForMultiple} times by useSetInnerState calls`, () => {
        const { spy, onRender, first, second, watcher } = setup()

        const Component: React.VFC = () => {
          const count = useCount(watcher)
          const setFirst = useSetInnerState(first)
          const setSecond = useSetInnerState(second)

          onRender()

          return (
            <div>
              <button
                type="button"
                data-testid="inc"
                onClick={() => {
                  execute(() => {
                    setFirst(Counter.inc)
                    setSecond(Counter.inc)
                  })
                }}
              />
              <span data-testid="count">{count}</span>
            </div>
          )
        }

        render(<Component />)

        expect(screen.getByTestId("count")).toHaveTextContent("3")
        expect(onRender).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledTimes(2)
        spy.mockReset()

        fireEvent.click(screen.getByTestId("inc"))
        expect(screen.getByTestId("count")).toHaveTextContent("5")
        expect(onRender).toHaveBeenCalledTimes(2)
        expect(spy).toHaveBeenCalledTimes(expectedWatcherCallsForMultiple)
      })
    })

    describe("for nested stores", () => {
      const setup = () => {
        const spy = jest.fn()
        const onRender = jest.fn()
        const store = InnerStore.of({
          first: InnerStore.of({ count: 1 }),
          second: InnerStore.of({ count: 2 }),
        })
        const watcher = () => {
          spy()

          return store.getState(
            ({ first, second }) =>
              first.getState(Counter.getCount) +
              second.getState(Counter.getCount),
          )
        }

        return { spy, onRender, store, watcher }
      }

      it(`calls the watcher ${expectedWatcherCallsForNested} times by InnerStore#setState calls`, () => {
        const { spy, onRender, store, watcher } = setup()

        const Component: React.VFC = () => {
          const count = useCount(watcher)

          onRender()

          return <span data-testid="count">{count}</span>
        }

        render(<Component />)

        expect(screen.getByTestId("count")).toHaveTextContent("3")
        expect(onRender).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledTimes(2)
        spy.mockReset()

        act(() => {
          execute(() => {
            store.setState((state) => {
              state.first.setState(Counter.inc)
              state.second.setState(Counter.inc)

              return state
            })
          })
        })
        expect(screen.getByTestId("count")).toHaveTextContent("5")
        expect(onRender).toHaveBeenCalledTimes(2)
        expect(spy).toHaveBeenCalledTimes(expectedWatcherCallsForNested)
        spy.mockReset()

        act(() => {
          store.setState((state) => {
            execute(() => {
              state.first.setState(Counter.inc)
              state.second.setState(Counter.inc)
            })

            return state
          })
        })
        expect(screen.getByTestId("count")).toHaveTextContent("7")
        expect(onRender).toHaveBeenCalledTimes(3)
        expect(spy).toHaveBeenCalledTimes(expectedWatcherCallsForNested)
      })

      it(`calls the watcher ${expectedWatcherCallsForNested} times by useSetInnerState calls`, () => {
        const { spy, onRender, store, watcher } = setup()

        const Component: React.VFC = () => {
          const count = useCount(watcher)
          const setState = useSetInnerState(store)

          onRender()

          return (
            <div>
              <button
                type="button"
                data-testid="inc-1"
                onClick={() => {
                  execute(() => {
                    setState((state) => {
                      state.first.setState(Counter.inc)
                      state.second.setState(Counter.inc)

                      return state
                    })
                  })
                }}
              />
              <button
                type="button"
                data-testid="inc-2"
                onClick={() => {
                  setState((state) => {
                    execute(() => {
                      state.first.setState(Counter.inc)
                      state.second.setState(Counter.inc)
                    })

                    return state
                  })
                }}
              />
              <span data-testid="count">{count}</span>
            </div>
          )
        }

        render(<Component />)

        expect(screen.getByTestId("count")).toHaveTextContent("3")
        expect(onRender).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledTimes(2)
        spy.mockReset()

        fireEvent.click(screen.getByTestId("inc-1"))
        expect(screen.getByTestId("count")).toHaveTextContent("5")
        expect(onRender).toHaveBeenCalledTimes(2)
        expect(spy).toHaveBeenCalledTimes(expectedWatcherCallsForNested)
        spy.mockReset()

        fireEvent.click(screen.getByTestId("inc-2"))
        expect(screen.getByTestId("count")).toHaveTextContent("7")
        expect(onRender).toHaveBeenCalledTimes(3)
        expect(spy).toHaveBeenCalledTimes(expectedWatcherCallsForNested)
      })
    })
  },
)
