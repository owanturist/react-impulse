import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { Impulse, type Scope, batch, subscribe, useScoped } from "../../src"
import { Counter } from "../common"

describe.each([
  ["not batched", (cb: VoidFunction) => cb()],
  ["batched", batch],
])("multiple impulses %s calls with direct impulse access", (_, execute) => {
  it("re-renders once for Impulse#setValue calls", () => {
    const onRender = vi.fn()
    const impulse1 = Impulse({ count: 1 })
    const impulse2 = Impulse({ count: 2 })

    const Component: React.FC = () => {
      const counter1 = useScoped((scope) => impulse1.getValue(scope))
      const counter2 = useScoped(impulse2)

      return (
        <React.Profiler id="test" onRender={onRender}>
          <span data-testid="count">{counter1.count + counter2.count}</span>
        </React.Profiler>
      )
    }

    render(<Component />)

    expect(screen.getByTestId("count")).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      execute(() => {
        impulse1.setValue(Counter.inc)
        impulse2.setValue(Counter.inc)
      })
    })
    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("re-renders once for multiple useScoped", () => {
    const onRender = vi.fn()
    const impulse1 = Impulse({ count: 1 })
    const impulse2 = Impulse({ count: 2 })

    const Component: React.FC = () => {
      const counter1 = useScoped((scope) => impulse1.getValue(scope))
      const counter2 = useScoped(impulse2)

      return (
        <React.Profiler id="test" onRender={onRender}>
          <button
            type="button"
            data-testid="inc"
            onClick={() => {
              execute(() => {
                impulse1.setValue(Counter.inc)
                impulse2.setValue(Counter.inc)
              })
            }}
          />
          <span data-testid="count">{counter1.count + counter2.count}</span>
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
    const impulse = Impulse({
      first: Impulse({ count: 1 }),
      second: Impulse({ count: 2 }),
    })

    const Component: React.FC = () => {
      const acc = useScoped((scope) => impulse.getValue(scope))
      const counter1 = useScoped((scope) => acc.first.getValue(scope))
      const counter2 = useScoped(acc.second)

      return (
        <React.Profiler id="test" onRender={onRender}>
          <span data-testid="count">{counter1.count + counter2.count}</span>
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
    const impulse = Impulse({
      first: Impulse({ count: 1 }),
      second: Impulse({ count: 2 }),
    })

    const Component: React.FC = () => {
      const acc = useScoped(impulse)
      const counter1 = useScoped((scope) => acc.first.getValue(scope))
      const counter2 = useScoped((scope) => acc.second.getValue(scope))

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
          <span data-testid="count">{counter1.count + counter2.count}</span>
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
    useCount: (factory: (scope: Scope) => number) => useScoped((scope) => factory(scope)),
  },
  {
    name: "with batching for inline factory",
    expectedFactoryCallsForMultiple: 2,
    expectedFactoryCallsForNested: 2,
    execute: batch,
    useCount: (factory: (scope: Scope) => number) => useScoped((scope) => factory(scope)),
  },
  {
    name: "no batching for memoized factory",
    expectedFactoryCallsForMultiple: 2,
    expectedFactoryCallsForNested: 1,
    execute: (cb: VoidFunction) => cb(),
    useCount: (factory: (scope: Scope) => number) =>
      useScoped(React.useCallback((scope: Scope) => factory(scope), [factory])),
  },
  {
    name: "with batching for memoized factory",
    expectedFactoryCallsForMultiple: 1,
    expectedFactoryCallsForNested: 1,
    execute: batch,
    useCount: (factory: (scope: Scope) => number) =>
      useScoped(React.useCallback((scope: Scope) => factory(scope), [factory])),
  },
])("when $name", ({
  expectedFactoryCallsForMultiple,
  expectedFactoryCallsForNested,
  execute,
  useCount,
}) => {
  describe("for multiple impulses", () => {
    const setup = () => {
      const spy = vi.fn()
      const onRender = vi.fn()
      const first = Impulse({ count: 1 })
      const second = Impulse({ count: 2 })
      const factory = (scope: Scope) => {
        spy()

        return Counter.getCount(first.getValue(scope)) + Counter.getCount(second.getValue(scope))
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
      const impulse = Impulse({
        first: Impulse({ count: 1 }),
        second: Impulse({ count: 2 }),
      })
      const factory = (scope: Scope) => {
        spy()

        const { first, second } = impulse.getValue(scope)

        return Counter.getCount(first.getValue(scope)) + Counter.getCount(second.getValue(scope))
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
})

describe("when reading value during batching", () => {
  it("returns new value right after update", ({ scope }) => {
    const source = Impulse(1)
    const spy = vi.fn()

    expect(source.getValue(scope)).toBe(1)

    batch((scope) => {
      source.setValue(2)
      spy(source.getValue(scope))

      source.setValue(3)
      spy(source.getValue(scope))
    })

    expect(source.getValue(scope)).toBe(3)

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenNthCalledWith(1, 2)
    expect(spy).toHaveBeenNthCalledWith(2, 3)
  })
})

/**
 * bugfix: DerivedImpulse does not update it's value when batching #893
 * @link https://github.com/owanturist/react-impulse/issues/893
 */
describe("when reading derived value during batching", () => {
  it("updates derived value after source changes", ({ scope }) => {
    expect.assertions(5)

    const source = Impulse(1)
    const derived = Impulse(source)

    expect(derived.getValue(scope)).toBe(1)

    batch((scope) => {
      source.setValue(1)
      expect(derived.getValue(scope)).toBe(1)

      source.setValue(2)
      expect(derived.getValue(scope)).toBe(2)

      source.setValue(3)
      expect(derived.getValue(scope)).toBe(3)
    })

    expect(derived.getValue(scope)).toBe(3)
  })

  it("updates derived values after source changes in subscribe", () => {
    expect.assertions(5)

    const source = Impulse(1)
    const derived = Impulse(source)
    const spy = vi.fn()

    subscribe((scope) => {
      spy(derived.getValue(scope))
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith(1)
    vi.clearAllMocks()

    batch((scope) => {
      source.setValue(1)
      expect(derived.getValue(scope)).toBe(1)

      source.setValue(2)
      expect(derived.getValue(scope)).toBe(2)

      source.setValue(3)
      expect(derived.getValue(scope)).toBe(3)
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
  })

  it("updates derived value after some sources change", ({ scope }) => {
    expect.assertions(4)

    const source1 = Impulse(1)
    const source2 = Impulse(2)
    const derived = Impulse((scope) => source1.getValue(scope) + source2.getValue(scope))

    expect(derived.getValue(scope)).toBe(3)

    batch((scope) => {
      source1.setValue(2)
      expect(derived.getValue(scope)).toBe(4)

      source2.setValue(3)
      expect(derived.getValue(scope)).toBe(5)
    })

    expect(derived.getValue(scope)).toBe(5)
  })

  it("updates derived value after all sources change", ({ scope }) => {
    expect.assertions(4)

    const source1 = Impulse(1)
    const source2 = Impulse(2)
    const derived = Impulse((scope) => source1.getValue(scope) + source2.getValue(scope))

    expect(derived.getValue(scope)).toBe(3)

    batch((scope) => {
      source1.setValue(2)
      source2.setValue(3)
      expect(derived.getValue(scope)).toBe(5)

      source1.setValue(3)
      source2.setValue(4)
      expect(derived.getValue(scope)).toBe(7)
    })

    expect(derived.getValue(scope)).toBe(7)
  })

  it("updates derived values after source changes", ({ scope }) => {
    expect.assertions(8)

    const source = Impulse(1)
    const derived1 = Impulse(source)
    const derived2 = Impulse(source)

    expect(derived1.getValue(scope)).toBe(1)
    expect(derived2.getValue(scope)).toBe(1)

    batch((scope) => {
      source.setValue(2)
      expect(derived1.getValue(scope)).toBe(2)
      expect(derived2.getValue(scope)).toBe(2)

      source.setValue(3)
      expect(derived1.getValue(scope)).toBe(3)
      expect(derived2.getValue(scope)).toBe(3)
    })

    expect(derived1.getValue(scope)).toBe(3)
    expect(derived2.getValue(scope)).toBe(3)
  })

  it("updates chained derived values after source changes", ({ scope }) => {
    const source = Impulse(1)
    const derived = Impulse(source)
    const derivedDerived = Impulse(derived)

    batch((scope) => {
      expect(derivedDerived.getValue(scope)).toBe(1)

      batch((scope) => {
        source.setValue(2)
        expect(derivedDerived.getValue(scope)).toBe(2)

        source.setValue(3)
        expect(derivedDerived.getValue(scope)).toBe(3)
      })

      expect(derivedDerived.getValue(scope)).toBe(3)
    })

    expect(derived.getValue(scope)).toBe(3)
    expect(derivedDerived.getValue(scope)).toBe(3)
  })

  it("updates derived value after derived change", ({ scope }) => {
    expect.assertions(7)

    const source = Impulse(1)
    const derived = Impulse(source, source)

    batch((scope) => {
      derived.setValue(1)
      expect(source.getValue(scope)).toBe(1)
      expect(derived.getValue(scope)).toBe(1)

      derived.setValue(2)
      expect(source.getValue(scope)).toBe(2)
      expect(derived.getValue(scope)).toBe(2)

      derived.setValue(3)
      expect(source.getValue(scope)).toBe(3)
      expect(derived.getValue(scope)).toBe(3)
    })

    expect(source.getValue(scope)).toBe(3)
  })

  it("returns the same subsequent value after a source change", ({ scope }) => {
    expect.assertions(4)

    const source = Impulse(1)
    const derived = Impulse((scope) => ({ count: source.getValue(scope) }), {
      compare: Counter.compare,
    })

    expect(derived.getValue(scope)).toBe(derived.getValue(scope))

    batch((scope) => {
      source.setValue(2)
      expect(derived.getValue(scope)).toBe(derived.getValue(scope))

      source.setValue(3)
      expect(derived.getValue(scope)).toBe(derived.getValue(scope))
    })

    expect(derived.getValue(scope)).toBe(derived.getValue(scope))
  })

  it("returns the comparably equal value after a source change", ({ scope }) => {
    expect.assertions(7)

    const source = Impulse({ count: 1 })
    const derived = Impulse((scope) => source.getValue(scope), {
      compare: Counter.compare,
    })

    const source0 = source.getValue(scope)
    const derived0 = derived.getValue(scope)
    expect(source0).toBe(derived0)

    source.setValue(Counter.clone)

    const source1 = source.getValue(scope)
    expect(source1).not.toBe(source0)
    expect(source1).toStrictEqual(source0)

    const derived1 = derived.getValue(scope)
    expect(derived1).toBe(derived0)

    batch((scope) => {
      source.setValue(Counter.clone)

      const source2 = source.getValue(scope)
      expect(source2).not.toBe(source0)
      expect(source2).toStrictEqual(source0)

      const derived2 = derived.getValue(scope)
      expect(derived2).toBe(derived0)
    })
  })
})
