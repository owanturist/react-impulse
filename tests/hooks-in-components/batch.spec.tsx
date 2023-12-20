import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { batch, Impulse, useScoped, type Scope } from "../../src"
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
      const counter_1 = useScoped((scope) => impulse_1.getValue(scope))
      const counter_2 = useScoped((scope) => impulse_2.getValue(scope))

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

  it("re-renders once for multiple useScoped", () => {
    const onRender = vi.fn()
    const impulse_1 = Impulse.of({ count: 1 })
    const impulse_2 = Impulse.of({ count: 2 })

    const Component: React.FC = () => {
      const counter_1 = useScoped((scope) => impulse_1.getValue(scope))
      const counter_2 = useScoped((scope) => impulse_2.getValue(scope))

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
      const acc = useScoped((scope) => impulse.getValue(scope))
      const counter_1 = useScoped((scope) => acc.first.getValue(scope))
      const counter_2 = useScoped((scope) => acc.second.getValue(scope))

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

  it("re-renders once for multiple useScoped", () => {
    const onRender = vi.fn()
    const impulse = Impulse.of({
      first: Impulse.of({ count: 1 }),
      second: Impulse.of({ count: 2 }),
    })

    const Component: React.FC = () => {
      const acc = useScoped((scope) => impulse.getValue(scope))
      const counter_1 = useScoped((scope) => acc.first.getValue(scope))
      const counter_2 = useScoped((scope) => acc.second.getValue(scope))

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
    name: "no batching for inline factory",
    expectedFactoryCallsForMultiple: 3,
    expectedFactoryCallsForNested: 2,
    execute: (cb: VoidFunction) => cb(),
    useCount: (factory: (scope: Scope) => number) => {
      return useScoped((scope) => factory(scope))
    },
  },
  {
    name: "with batching for inline factory",
    expectedFactoryCallsForMultiple: 2,
    expectedFactoryCallsForNested: 2,
    execute: batch,
    useCount: (factory: (scope: Scope) => number) => {
      return useScoped((scope) => factory(scope))
    },
  },
  {
    name: "no batching for memoized factory",
    expectedFactoryCallsForMultiple: 2,
    expectedFactoryCallsForNested: 1,
    execute: (cb: VoidFunction) => cb(),
    useCount: (factory: (scope: Scope) => number) => {
      return useScoped(React.useCallback((scope) => factory(scope), [factory]))
    },
  },
  {
    name: "with batching for memoized factory",
    expectedFactoryCallsForMultiple: 1,
    expectedFactoryCallsForNested: 1,
    execute: batch,
    useCount: (factory: (scope: Scope) => number) => {
      return useScoped(React.useCallback((scope) => factory(scope), [factory]))
    },
  },
])(
  "when $name",
  ({
    expectedFactoryCallsForMultiple,
    expectedFactoryCallsForNested,
    execute,
    useCount,
  }) => {
    describe("for multiple impulses", () => {
      const setup = () => {
        const spy = vi.fn()
        const onRender = vi.fn()
        const first = Impulse.of({ count: 1 })
        const second = Impulse.of({ count: 2 })
        const factory = (scope: Scope) => {
          spy()

          return (
            first.getValue(scope, Counter.getCount) +
            second.getValue(scope, Counter.getCount)
          )
        }

        return { spy, onRender, first, second, factory }
      }

      it(`calls the factory ${expectedFactoryCallsForMultiple} times by Impulse#setValue calls`, () => {
        const { spy, onRender, first, second, factory } = setup()

        const Component: React.FC = () => {
          const count = useCount(factory)

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
        expect(spy).toHaveBeenCalledTimes(expectedFactoryCallsForMultiple)
      })

      it(`calls the factory ${expectedFactoryCallsForMultiple} times by Impulse#setValue calls`, () => {
        const { spy, onRender, first, second, factory } = setup()

        const Component: React.FC = () => {
          const count = useCount(factory)

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
        expect(spy).toHaveBeenCalledTimes(expectedFactoryCallsForMultiple)
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
        const factory = (scope: Scope) => {
          spy()

          return impulse.getValue(scope, ({ first, second }, scope) => {
            return (
              first.getValue(scope, Counter.getCount) +
              second.getValue(scope, Counter.getCount)
            )
          })
        }

        return { spy, onRender, impulse, factory }
      }

      it(`calls the factory ${expectedFactoryCallsForNested} times by Impulse#setValue calls`, () => {
        const { spy, onRender, impulse, factory } = setup()

        const Component: React.FC = () => {
          const count = useCount(factory)

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
        expect(spy).toHaveBeenCalledTimes(expectedFactoryCallsForNested)
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
        expect(spy).toHaveBeenCalledTimes(expectedFactoryCallsForNested)
      })

      it(`calls the factory ${expectedFactoryCallsForNested} times by Impulse#setValue calls`, () => {
        const { spy, onRender, impulse, factory } = setup()

        const Component: React.FC = () => {
          const count = useCount(factory)

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
        expect(spy).toHaveBeenCalledTimes(expectedFactoryCallsForNested)
        vi.clearAllMocks()

        fireEvent.click(screen.getByTestId("inc-2"))
        expect(screen.getByTestId("count")).toHaveTextContent("7")
        expect(onRender).toHaveBeenCalledOnce()
        expect(spy).toHaveBeenCalledTimes(expectedFactoryCallsForNested)
      })
    })
  },
)
