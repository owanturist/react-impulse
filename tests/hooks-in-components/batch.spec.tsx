import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { batch, Impulse, useWatchImpulse } from "../../src"
import { Counter } from "../common"

describe.each([
  ["not batched", (cb: VoidFunction) => cb()],
  ["batched", batch],
])("multiple impulses %s calls with direct impulse access", (_, execute) => {
  it("re-renders once for Impulse#setValue calls", () => {
    const onRender = vi.fn()
    const impulse_1 = Impulse.of({ count: 1 })
    const impulse_2 = Impulse.of({ count: 2 })

    const Component: React.FC = () => {
      const counter_1 = useWatchImpulse(() => impulse_1.getValue())
      const counter_2 = useWatchImpulse(() => impulse_2.getValue())

      return (
        <React.Profiler id="test" onRender={onRender}>
          <span data-testid="count">{counter_1.count + counter_2.count}</span>
        </React.Profiler>
      )
    }

    render(<Component />)

    expect(screen.getByTestId("count")).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      execute(() => {
        impulse_1.setValue(Counter.inc)
        impulse_2.setValue(Counter.inc)
      })
    })
    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("re-renders once for useWatchImpulse calls", () => {
    const onRender = vi.fn()
    const impulse_1 = Impulse.of({ count: 1 })
    const impulse_2 = Impulse.of({ count: 2 })

    const Component: React.FC = () => {
      const counter_1 = useWatchImpulse(() => impulse_1.getValue())
      const counter_2 = useWatchImpulse(() => impulse_2.getValue())

      return (
        <React.Profiler id="test" onRender={onRender}>
          <button
            type="button"
            data-testid="inc"
            onClick={() => {
              execute(() => {
                impulse_1.setValue(Counter.inc)
                impulse_2.setValue(Counter.inc)
              })
            }}
          />
          <span data-testid="count">{counter_1.count + counter_2.count}</span>
        </React.Profiler>
      )
    }

    render(<Component />)

    expect(screen.getByTestId("count")).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("inc"))
    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledOnce()
  })
})

describe.each([
  ["not batched", (cb: VoidFunction) => cb()],
  ["batched", batch],
])("nested impulses %s calls with direct impulse access", (_, execute) => {
  it("re-renders once for Impulse#setValue calls", () => {
    const onRender = vi.fn()
    const impulse = Impulse.of({
      first: Impulse.of({ count: 1 }),
      second: Impulse.of({ count: 2 }),
    })

    const Component: React.FC = () => {
      const { first: impulse_1, second: impulse_2 } = useWatchImpulse(() =>
        impulse.getValue(),
      )
      const counter_1 = useWatchImpulse(() => impulse_1.getValue())
      const counter_2 = useWatchImpulse(() => impulse_2.getValue())

      return (
        <React.Profiler id="test" onRender={onRender}>
          <span data-testid="count">{counter_1.count + counter_2.count}</span>
        </React.Profiler>
      )
    }

    render(<Component />)

    expect(screen.getByTestId("count")).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      execute(() => {
        impulse.setValue((current) => {
          current.first.setValue(Counter.inc)
          current.second.setValue(Counter.inc)

          return current
        })
      })
    })
    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      impulse.setValue((current) => {
        execute(() => {
          current.first.setValue(Counter.inc)
          current.second.setValue(Counter.inc)
        })

        return current
      })
    })
    expect(screen.getByTestId("count")).toHaveTextContent("7")
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("re-renders once for useWatchImpulse calls", () => {
    const onRender = vi.fn()
    const impulse = Impulse.of({
      first: Impulse.of({ count: 1 }),
      second: Impulse.of({ count: 2 }),
    })

    const Component: React.FC = () => {
      const { first: impulse_1, second: impulse_2 } = useWatchImpulse(() =>
        impulse.getValue(),
      )
      const counter_1 = useWatchImpulse(() => impulse_1.getValue())
      const counter_2 = useWatchImpulse(() => impulse_2.getValue())

      return (
        <React.Profiler id="test" onRender={onRender}>
          <button
            type="button"
            data-testid="inc-1"
            onClick={() => {
              execute(() => {
                impulse.setValue((value) => {
                  value.first.setValue(Counter.inc)
                  value.second.setValue(Counter.inc)

                  return value
                })
              })
            }}
          />
          <button
            type="button"
            data-testid="inc-2"
            onClick={() => {
              impulse.setValue((value) => {
                execute(() => {
                  value.first.setValue(Counter.inc)
                  value.second.setValue(Counter.inc)
                })

                return value
              })
            }}
          />
          <span data-testid="count">{counter_1.count + counter_2.count}</span>
        </React.Profiler>
      )
    }

    render(<Component />)

    expect(screen.getByTestId("count")).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("inc-1"))
    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("inc-2"))
    expect(screen.getByTestId("count")).toHaveTextContent("7")
    expect(onRender).toHaveBeenCalledOnce()
  })
})

describe.each([
  {
    name: "no batching for inline watcher",
    expectedWatcherCallsForMultiple: 3,
    expectedWatcherCallsForNested: 2,
    execute: (cb: VoidFunction) => cb(),
    useCount: (watcher: () => number) => {
      return useWatchImpulse(() => watcher())
    },
  },
  {
    name: "with batching for inline watcher",
    expectedWatcherCallsForMultiple: 2,
    expectedWatcherCallsForNested: 2,
    execute: batch,
    useCount: (watcher: () => number) => {
      return useWatchImpulse(() => watcher())
    },
  },
  {
    name: "no batching for memoized watcher",
    expectedWatcherCallsForMultiple: 2,
    expectedWatcherCallsForNested: 1,
    execute: (cb: VoidFunction) => cb(),
    useCount: (watcher: () => number) => {
      return useWatchImpulse(React.useCallback(() => watcher(), [watcher]))
    },
  },
  {
    name: "with batching for memoized watcher",
    expectedWatcherCallsForMultiple: 1,
    expectedWatcherCallsForNested: 1,
    execute: batch,
    useCount: (watcher: () => number) => {
      return useWatchImpulse(React.useCallback(() => watcher(), [watcher]))
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
    describe("for multiple impulses", () => {
      const setup = () => {
        const spy = vi.fn()
        const onRender = vi.fn()
        const first = Impulse.of({ count: 1 })
        const second = Impulse.of({ count: 2 })
        const watcher = () => {
          spy()

          return (
            first.getValue(Counter.getCount) + second.getValue(Counter.getCount)
          )
        }

        return { spy, onRender, first, second, watcher }
      }

      it(`calls the watcher ${expectedWatcherCallsForMultiple} times by Impulse#setValue calls`, () => {
        const { spy, onRender, first, second, watcher } = setup()

        const Component: React.FC = () => {
          const count = useCount(watcher)

          return (
            <React.Profiler id="test" onRender={onRender}>
              <span data-testid="count">{count}</span>
            </React.Profiler>
          )
        }

        render(<Component />)

        expect(screen.getByTestId("count")).toHaveTextContent("3")
        expect(onRender).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledOnce()

        vi.clearAllMocks()

        act(() => {
          execute(() => {
            first.setValue(Counter.inc)
            second.setValue(Counter.inc)
          })
        })
        expect(screen.getByTestId("count")).toHaveTextContent("5")
        expect(onRender).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledTimes(expectedWatcherCallsForMultiple)
      })

      it(`calls the watcher ${expectedWatcherCallsForMultiple} times by Impulse#setValue calls`, () => {
        const { spy, onRender, first, second, watcher } = setup()

        const Component: React.FC = () => {
          const count = useCount(watcher)

          return (
            <React.Profiler id="test" onRender={onRender}>
              <button
                type="button"
                data-testid="inc"
                onClick={() => {
                  execute(() => {
                    first.setValue(Counter.inc)
                    second.setValue(Counter.inc)
                  })
                }}
              />
              <span data-testid="count">{count}</span>
            </React.Profiler>
          )
        }

        render(<Component />)

        expect(screen.getByTestId("count")).toHaveTextContent("3")
        expect(onRender).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledOnce()
        vi.clearAllMocks()

        fireEvent.click(screen.getByTestId("inc"))
        expect(screen.getByTestId("count")).toHaveTextContent("5")
        expect(onRender).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledTimes(expectedWatcherCallsForMultiple)
      })
    })

    describe("for nested impulses", () => {
      const setup = () => {
        const spy = vi.fn()
        const onRender = vi.fn()
        const impulse = Impulse.of({
          first: Impulse.of({ count: 1 }),
          second: Impulse.of({ count: 2 }),
        })
        const watcher = () => {
          spy()

          return impulse.getValue(
            ({ first, second }) =>
              first.getValue(Counter.getCount) +
              second.getValue(Counter.getCount),
          )
        }

        return { spy, onRender, impulse, watcher }
      }

      it(`calls the watcher ${expectedWatcherCallsForNested} times by Impulse#setValue calls`, () => {
        const { spy, onRender, impulse, watcher } = setup()

        const Component: React.FC = () => {
          const count = useCount(watcher)

          return (
            <React.Profiler id="test" onRender={onRender}>
              <span data-testid="count">{count}</span>
            </React.Profiler>
          )
        }

        render(<Component />)

        expect(screen.getByTestId("count")).toHaveTextContent("3")
        expect(onRender).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledOnce()
        vi.clearAllMocks()

        act(() => {
          execute(() => {
            impulse.setValue((value) => {
              value.first.setValue(Counter.inc)
              value.second.setValue(Counter.inc)

              return value
            })
          })
        })
        expect(screen.getByTestId("count")).toHaveTextContent("5")
        expect(onRender).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledTimes(expectedWatcherCallsForNested)
        vi.clearAllMocks()

        act(() => {
          impulse.setValue((value) => {
            execute(() => {
              value.first.setValue(Counter.inc)
              value.second.setValue(Counter.inc)
            })

            return value
          })
        })
        expect(screen.getByTestId("count")).toHaveTextContent("7")
        expect(onRender).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledTimes(expectedWatcherCallsForNested)
      })

      it(`calls the watcher ${expectedWatcherCallsForNested} times by Impulse#setValue calls`, () => {
        const { spy, onRender, impulse, watcher } = setup()

        const Component: React.FC = () => {
          const count = useCount(watcher)

          return (
            <React.Profiler id="test" onRender={onRender}>
              <button
                type="button"
                data-testid="inc-1"
                onClick={() => {
                  execute(() => {
                    impulse.setValue((value) => {
                      value.first.setValue(Counter.inc)
                      value.second.setValue(Counter.inc)

                      return value
                    })
                  })
                }}
              />
              <button
                type="button"
                data-testid="inc-2"
                onClick={() => {
                  impulse.setValue((value) => {
                    execute(() => {
                      value.first.setValue(Counter.inc)
                      value.second.setValue(Counter.inc)
                    })

                    return value
                  })
                }}
              />
              <span data-testid="count">{count}</span>
            </React.Profiler>
          )
        }

        render(<Component />)

        expect(screen.getByTestId("count")).toHaveTextContent("3")
        expect(onRender).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledOnce()
        vi.clearAllMocks()

        fireEvent.click(screen.getByTestId("inc-1"))
        expect(screen.getByTestId("count")).toHaveTextContent("5")
        expect(onRender).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledTimes(expectedWatcherCallsForNested)
        vi.clearAllMocks()

        fireEvent.click(screen.getByTestId("inc-2"))
        expect(screen.getByTestId("count")).toHaveTextContent("7")
        expect(onRender).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledTimes(expectedWatcherCallsForNested)
      })
    })
  },
)
