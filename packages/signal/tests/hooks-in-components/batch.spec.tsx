import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { Impulse, type Scope, batch, effect, useScoped } from "../../src"
import { Counter } from "../common"

describe.each([
  ["not batched", (cb: VoidFunction) => cb()],
  ["batched", batch],
])("multiple impulses %s calls with direct impulse access", (_, execute) => {
  it("re-renders once for Impulse#update calls", () => {
    const onRender = vi.fn()
    const impulse1 = Impulse({ count: 1 })
    const impulse2 = Impulse({ count: 2 })

    const Component: React.FC = () => {
      const counter1 = useScoped((scope) => impulse1.read(scope))
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
        impulse1.update(Counter.inc)
        impulse2.update(Counter.inc)
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
      const counter1 = useScoped((scope) => impulse1.read(scope))
      const counter2 = useScoped(impulse2)

      return (
        <React.Profiler id="test" onRender={onRender}>
          <button
            type="button"
            data-testid="inc"
            onClick={() => {
              execute(() => {
                impulse1.update(Counter.inc)
                impulse2.update(Counter.inc)
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
  it("re-renders once for Impulse#update calls", () => {
    const onRender = vi.fn()
    const impulse = Impulse({
      first: Impulse({ count: 1 }),
      second: Impulse({ count: 2 }),
    })

    const Component: React.FC = () => {
      const acc = useScoped((scope) => impulse.read(scope))
      const counter1 = useScoped((scope) => acc.first.read(scope))
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
        impulse.update((current) => {
          current.first.update(Counter.inc)
          current.second.update(Counter.inc)

          return current
        })
      })
    })
    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      impulse.update((current) => {
        execute(() => {
          current.first.update(Counter.inc)
          current.second.update(Counter.inc)
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
      const counter1 = useScoped((scope) => acc.first.read(scope))
      const counter2 = useScoped((scope) => acc.second.read(scope))

      return (
        <React.Profiler id="test" onRender={onRender}>
          <button
            type="button"
            data-testid="inc-1"
            onClick={() => {
              execute(() => {
                impulse.update((value) => {
                  value.first.update(Counter.inc)
                  value.second.update(Counter.inc)

                  return value
                })
              })
            }}
          />
          <button
            type="button"
            data-testid="inc-2"
            onClick={() => {
              impulse.update((value) => {
                execute(() => {
                  value.first.update(Counter.inc)
                  value.second.update(Counter.inc)
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

        return Counter.getCount(first.read(scope)) + Counter.getCount(second.read(scope))
      }

      return { spy, onRender, first, second, factory }
    }

    it(`calls the factory ${expectedFactoryCallsForMultiple} times by Impulse#update calls`, () => {
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
          first.update(Counter.inc)
          second.update(Counter.inc)
        })
      })
      expect(screen.getByTestId("count")).toHaveTextContent("5")
      expect(onRender).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledTimes(expectedFactoryCallsForMultiple)
    })

    it(`calls the factory ${expectedFactoryCallsForMultiple} times by Impulse#update calls`, () => {
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
                  first.update(Counter.inc)
                  second.update(Counter.inc)
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

        const { first, second } = impulse.read(scope)

        return Counter.getCount(first.read(scope)) + Counter.getCount(second.read(scope))
      }

      return { spy, onRender, impulse, factory }
    }

    it(`calls the factory ${expectedFactoryCallsForNested} times by Impulse#update calls`, () => {
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
          impulse.update((value) => {
            value.first.update(Counter.inc)
            value.second.update(Counter.inc)

            return value
          })
        })
      })
      expect(screen.getByTestId("count")).toHaveTextContent("5")
      expect(onRender).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledTimes(expectedFactoryCallsForNested)
      vi.clearAllMocks()

      act(() => {
        impulse.update((value) => {
          execute(() => {
            value.first.update(Counter.inc)
            value.second.update(Counter.inc)
          })

          return value
        })
      })
      expect(screen.getByTestId("count")).toHaveTextContent("7")
      expect(onRender).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledTimes(expectedFactoryCallsForNested)
    })

    it(`calls the factory ${expectedFactoryCallsForNested} times by Impulse#update calls`, () => {
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
                  impulse.update((value) => {
                    value.first.update(Counter.inc)
                    value.second.update(Counter.inc)

                    return value
                  })
                })
              }}
            />
            <button
              type="button"
              data-testid="inc-2"
              onClick={() => {
                impulse.update((value) => {
                  execute(() => {
                    value.first.update(Counter.inc)
                    value.second.update(Counter.inc)
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

    expect(source.read(scope)).toBe(1)

    batch((scope) => {
      source.update(2)
      spy(source.read(scope))

      source.update(3)
      spy(source.read(scope))
    })

    expect(source.read(scope)).toBe(3)

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

    expect(derived.read(scope)).toBe(1)

    batch((scope) => {
      source.update(1)
      expect(derived.read(scope)).toBe(1)

      source.update(2)
      expect(derived.read(scope)).toBe(2)

      source.update(3)
      expect(derived.read(scope)).toBe(3)
    })

    expect(derived.read(scope)).toBe(3)
  })

  it("updates derived values after source changes in effect", () => {
    expect.assertions(5)

    const source = Impulse(1)
    const derived = Impulse(source)
    const spy = vi.fn()

    effect((scope) => {
      spy(derived.read(scope))
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith(1)
    vi.clearAllMocks()

    batch((scope) => {
      source.update(1)
      expect(derived.read(scope)).toBe(1)

      source.update(2)
      expect(derived.read(scope)).toBe(2)

      source.update(3)
      expect(derived.read(scope)).toBe(3)
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
  })

  it("updates derived value after some sources change", ({ scope }) => {
    expect.assertions(4)

    const source1 = Impulse(1)
    const source2 = Impulse(2)
    const derived = Impulse((scope) => source1.read(scope) + source2.read(scope))

    expect(derived.read(scope)).toBe(3)

    batch((scope) => {
      source1.update(2)
      expect(derived.read(scope)).toBe(4)

      source2.update(3)
      expect(derived.read(scope)).toBe(5)
    })

    expect(derived.read(scope)).toBe(5)
  })

  it("updates derived value after all sources change", ({ scope }) => {
    expect.assertions(4)

    const source1 = Impulse(1)
    const source2 = Impulse(2)
    const derived = Impulse((scope) => source1.read(scope) + source2.read(scope))

    expect(derived.read(scope)).toBe(3)

    batch((scope) => {
      source1.update(2)
      source2.update(3)
      expect(derived.read(scope)).toBe(5)

      source1.update(3)
      source2.update(4)
      expect(derived.read(scope)).toBe(7)
    })

    expect(derived.read(scope)).toBe(7)
  })

  it("updates derived values after source changes", ({ scope }) => {
    expect.assertions(8)

    const source = Impulse(1)
    const derived1 = Impulse(source)
    const derived2 = Impulse(source)

    expect(derived1.read(scope)).toBe(1)
    expect(derived2.read(scope)).toBe(1)

    batch((scope) => {
      source.update(2)
      expect(derived1.read(scope)).toBe(2)
      expect(derived2.read(scope)).toBe(2)

      source.update(3)
      expect(derived1.read(scope)).toBe(3)
      expect(derived2.read(scope)).toBe(3)
    })

    expect(derived1.read(scope)).toBe(3)
    expect(derived2.read(scope)).toBe(3)
  })

  it("updates chained derived values after source changes", ({ scope }) => {
    const source = Impulse(1)
    const derived = Impulse(source)
    const derivedDerived = Impulse(derived)

    batch((scope) => {
      expect(derivedDerived.read(scope)).toBe(1)

      batch((scope) => {
        source.update(2)
        expect(derivedDerived.read(scope)).toBe(2)

        source.update(3)
        expect(derivedDerived.read(scope)).toBe(3)
      })

      expect(derivedDerived.read(scope)).toBe(3)
    })

    expect(derived.read(scope)).toBe(3)
    expect(derivedDerived.read(scope)).toBe(3)
  })

  it("updates derived value after derived change", ({ scope }) => {
    expect.assertions(7)

    const source = Impulse(1)
    const derived = Impulse(source, source)

    batch((scope) => {
      derived.update(1)
      expect(source.read(scope)).toBe(1)
      expect(derived.read(scope)).toBe(1)

      derived.update(2)
      expect(source.read(scope)).toBe(2)
      expect(derived.read(scope)).toBe(2)

      derived.update(3)
      expect(source.read(scope)).toBe(3)
      expect(derived.read(scope)).toBe(3)
    })

    expect(source.read(scope)).toBe(3)
  })

  it("returns the same subsequent value after a source change", ({ scope }) => {
    expect.assertions(4)

    const source = Impulse(1)
    const derived = Impulse((scope) => ({ count: source.read(scope) }), {
      equals: Counter.equals,
    })

    expect(derived.read(scope)).toBe(derived.read(scope))

    batch((scope) => {
      source.update(2)
      expect(derived.read(scope)).toBe(derived.read(scope))

      source.update(3)
      expect(derived.read(scope)).toBe(derived.read(scope))
    })

    expect(derived.read(scope)).toBe(derived.read(scope))
  })

  it("returns the comparably equal value after a source change", ({ scope }) => {
    expect.assertions(7)

    const source = Impulse({ count: 1 })
    const derived = Impulse((scope) => source.read(scope), {
      equals: Counter.equals,
    })

    const source0 = source.read(scope)
    const derived0 = derived.read(scope)
    expect(source0).toBe(derived0)

    source.update(Counter.clone)

    const source1 = source.read(scope)
    expect(source1).not.toBe(source0)
    expect(source1).toStrictEqual(source0)

    const derived1 = derived.read(scope)
    expect(derived1).toBe(derived0)

    batch((scope) => {
      source.update(Counter.clone)

      const source2 = source.read(scope)
      expect(source2).not.toBe(source0)
      expect(source2).toStrictEqual(source0)

      const derived2 = derived.read(scope)
      expect(derived2).toBe(derived0)
    })
  })
})
