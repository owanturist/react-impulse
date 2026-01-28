import { type Monitor, Signal, batch, effect } from "@owanturist/signal"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { type FC, Profiler, useCallback } from "react"

import { Counter } from "~/tools/testing/counter"

import { useComputed } from "../../src"

describe.each([
  ["not batched", (cb: VoidFunction) => cb()],
  ["batched", batch],
])("multiple signals %s calls with direct signal access", (_, execute) => {
  it("re-renders once for Signal#write calls", () => {
    const onRender = vi.fn()
    const signal1 = Signal({ count: 1 })
    const signal2 = Signal({ count: 2 })

    const Component: FC = () => {
      const counter1 = useComputed((monitor) => signal1.read(monitor))
      const counter2 = useComputed(signal2)

      return (
        <Profiler id="test" onRender={onRender}>
          <span data-testid="count">{counter1.count + counter2.count}</span>
        </Profiler>
      )
    }

    render(<Component />)

    expect(screen.getByTestId("count")).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      execute(() => {
        signal1.write(Counter.inc)
        signal2.write(Counter.inc)
      })
    })
    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("re-renders once for multiple useComputed", () => {
    const onRender = vi.fn()
    const signal1 = Signal({ count: 1 })
    const signal2 = Signal({ count: 2 })

    const Component: FC = () => {
      const counter1 = useComputed((monitor) => signal1.read(monitor))
      const counter2 = useComputed(signal2)

      return (
        <Profiler id="test" onRender={onRender}>
          <button
            type="button"
            data-testid="inc"
            onClick={() => {
              execute(() => {
                signal1.write(Counter.inc)
                signal2.write(Counter.inc)
              })
            }}
          />
          <span data-testid="count">{counter1.count + counter2.count}</span>
        </Profiler>
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
])("nested signals %s calls with direct signal access", (_, execute) => {
  it("re-renders once for Signal#write calls", () => {
    const onRender = vi.fn()
    const signal = Signal({
      first: Signal({ count: 1 }),
      second: Signal({ count: 2 }),
    })

    const Component: FC = () => {
      const acc = useComputed((monitor) => signal.read(monitor))
      const counter1 = useComputed((monitor) => acc.first.read(monitor))
      const counter2 = useComputed(acc.second)

      return (
        <Profiler id="test" onRender={onRender}>
          <span data-testid="count">{counter1.count + counter2.count}</span>
        </Profiler>
      )
    }

    render(<Component />)

    expect(screen.getByTestId("count")).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      execute(() => {
        signal.write((current) => {
          current.first.write(Counter.inc)
          current.second.write(Counter.inc)

          return current
        })
      })
    })
    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      signal.write((current) => {
        execute(() => {
          current.first.write(Counter.inc)
          current.second.write(Counter.inc)
        })

        return current
      })
    })
    expect(screen.getByTestId("count")).toHaveTextContent("7")
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("re-renders once for multiple useComputed", () => {
    const onRender = vi.fn()
    const signal = Signal({
      first: Signal({ count: 1 }),
      second: Signal({ count: 2 }),
    })

    const Component: FC = () => {
      const acc = useComputed(signal)
      const counter1 = useComputed((monitor) => acc.first.read(monitor))
      const counter2 = useComputed((monitor) => acc.second.read(monitor))

      return (
        <Profiler id="test" onRender={onRender}>
          <button
            type="button"
            data-testid="inc-1"
            onClick={() => {
              execute(() => {
                signal.write((value) => {
                  value.first.write(Counter.inc)
                  value.second.write(Counter.inc)

                  return value
                })
              })
            }}
          />
          <button
            type="button"
            data-testid="inc-2"
            onClick={() => {
              signal.write((value) => {
                execute(() => {
                  value.first.write(Counter.inc)
                  value.second.write(Counter.inc)
                })

                return value
              })
            }}
          />
          <span data-testid="count">{counter1.count + counter2.count}</span>
        </Profiler>
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
    useCount: (factory: (monitor: Monitor) => number) => useComputed((monitor) => factory(monitor)),
  },
  {
    name: "with batching for inline factory",
    expectedFactoryCallsForMultiple: 2,
    expectedFactoryCallsForNested: 2,
    execute: batch,
    useCount: (factory: (monitor: Monitor) => number) => useComputed((monitor) => factory(monitor)),
  },
  {
    name: "no batching for memoized factory",
    expectedFactoryCallsForMultiple: 2,
    expectedFactoryCallsForNested: 1,
    execute: (cb: VoidFunction) => cb(),
    useCount: (factory: (monitor: Monitor) => number) =>
      useComputed(useCallback((monitor: Monitor) => factory(monitor), [factory])),
  },
  {
    name: "with batching for memoized factory",
    expectedFactoryCallsForMultiple: 1,
    expectedFactoryCallsForNested: 1,
    execute: batch,
    useCount: (factory: (monitor: Monitor) => number) =>
      useComputed(useCallback((monitor: Monitor) => factory(monitor), [factory])),
  },
])("when $name", ({
  expectedFactoryCallsForMultiple,
  expectedFactoryCallsForNested,
  execute,
  useCount,
}) => {
  describe("for multiple signals", () => {
    const setup = () => {
      const spy = vi.fn()
      const onRender = vi.fn()
      const first = Signal({ count: 1 })
      const second = Signal({ count: 2 })
      const factory = (monitor: Monitor) => {
        spy()

        return Counter.getCount(first.read(monitor)) + Counter.getCount(second.read(monitor))
      }

      return { spy, onRender, first, second, factory }
    }

    it(`calls the factory ${expectedFactoryCallsForMultiple} times by Signal#write calls`, () => {
      const { spy, onRender, first, second, factory } = setup()

      const Component: FC = () => {
        const count = useCount(factory)

        return (
          <Profiler id="test" onRender={onRender}>
            <span data-testid="count">{count}</span>
          </Profiler>
        )
      }

      render(<Component />)

      expect(screen.getByTestId("count")).toHaveTextContent("3")
      expect(onRender).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledOnce()

      vi.clearAllMocks()

      act(() => {
        execute(() => {
          first.write(Counter.inc)
          second.write(Counter.inc)
        })
      })
      expect(screen.getByTestId("count")).toHaveTextContent("5")
      expect(onRender).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledTimes(expectedFactoryCallsForMultiple)
    })

    it(`calls the factory ${expectedFactoryCallsForMultiple} times by Signal#write calls`, () => {
      const { spy, onRender, first, second, factory } = setup()

      const Component: FC = () => {
        const count = useCount(factory)

        return (
          <Profiler id="test" onRender={onRender}>
            <button
              type="button"
              data-testid="inc"
              onClick={() => {
                execute(() => {
                  first.write(Counter.inc)
                  second.write(Counter.inc)
                })
              }}
            />
            <span data-testid="count">{count}</span>
          </Profiler>
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

  describe("for nested signals", () => {
    const setup = () => {
      const spy = vi.fn()
      const onRender = vi.fn()
      const signal = Signal({
        first: Signal({ count: 1 }),
        second: Signal({ count: 2 }),
      })
      const factory = (monitor: Monitor) => {
        spy()

        const { first, second } = signal.read(monitor)

        return Counter.getCount(first.read(monitor)) + Counter.getCount(second.read(monitor))
      }

      return { spy, onRender, signal, factory }
    }

    it(`calls the factory ${expectedFactoryCallsForNested} times by Signal#write calls`, () => {
      const { spy, onRender, signal, factory } = setup()

      const Component: FC = () => {
        const count = useCount(factory)

        return (
          <Profiler id="test" onRender={onRender}>
            <span data-testid="count">{count}</span>
          </Profiler>
        )
      }

      render(<Component />)

      expect(screen.getByTestId("count")).toHaveTextContent("3")
      expect(onRender).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      act(() => {
        execute(() => {
          signal.write((value) => {
            value.first.write(Counter.inc)
            value.second.write(Counter.inc)

            return value
          })
        })
      })
      expect(screen.getByTestId("count")).toHaveTextContent("5")
      expect(onRender).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledTimes(expectedFactoryCallsForNested)
      vi.clearAllMocks()

      act(() => {
        signal.write((value) => {
          execute(() => {
            value.first.write(Counter.inc)
            value.second.write(Counter.inc)
          })

          return value
        })
      })
      expect(screen.getByTestId("count")).toHaveTextContent("7")
      expect(onRender).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledTimes(expectedFactoryCallsForNested)
    })

    it(`calls the factory ${expectedFactoryCallsForNested} times by Signal#write calls`, () => {
      const { spy, onRender, signal, factory } = setup()

      const Component: FC = () => {
        const count = useCount(factory)

        return (
          <Profiler id="test" onRender={onRender}>
            <button
              type="button"
              data-testid="inc-1"
              onClick={() => {
                execute(() => {
                  signal.write((value) => {
                    value.first.write(Counter.inc)
                    value.second.write(Counter.inc)

                    return value
                  })
                })
              }}
            />
            <button
              type="button"
              data-testid="inc-2"
              onClick={() => {
                signal.write((value) => {
                  execute(() => {
                    value.first.write(Counter.inc)
                    value.second.write(Counter.inc)
                  })

                  return value
                })
              }}
            />
            <span data-testid="count">{count}</span>
          </Profiler>
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
  it("returns new value right after write", ({ monitor }) => {
    const source = Signal(1)
    const spy = vi.fn()

    expect(source.read(monitor)).toBe(1)

    batch((monitor) => {
      source.write(2)
      spy(source.read(monitor))

      source.write(3)
      spy(source.read(monitor))
    })

    expect(source.read(monitor)).toBe(3)

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenNthCalledWith(1, 2)
    expect(spy).toHaveBeenNthCalledWith(2, 3)
  })
})

/**
 * bugfix: DerivedImpulse does not update it's value when batching #893
 * @link https://github.com/owanturist/react-signal/issues/893
 */
describe("when reading derived value during batching", () => {
  it("updates derived value after source changes", ({ monitor }) => {
    expect.assertions(5)

    const source = Signal(1)
    const derived = Signal(source)

    expect(derived.read(monitor)).toBe(1)

    batch((monitor) => {
      source.write(1)
      expect(derived.read(monitor)).toBe(1)

      source.write(2)
      expect(derived.read(monitor)).toBe(2)

      source.write(3)
      expect(derived.read(monitor)).toBe(3)
    })

    expect(derived.read(monitor)).toBe(3)
  })

  it("updates derived values after source changes in effect", () => {
    expect.assertions(5)

    const source = Signal(1)
    const derived = Signal(source)
    const spy = vi.fn()

    effect((monitor) => {
      spy(derived.read(monitor))
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith(1)
    vi.clearAllMocks()

    batch((monitor) => {
      source.write(1)
      expect(derived.read(monitor)).toBe(1)

      source.write(2)
      expect(derived.read(monitor)).toBe(2)

      source.write(3)
      expect(derived.read(monitor)).toBe(3)
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
  })

  it("updates derived value after some sources change", ({ monitor }) => {
    expect.assertions(4)

    const source1 = Signal(1)
    const source2 = Signal(2)
    const derived = Signal((monitor) => source1.read(monitor) + source2.read(monitor))

    expect(derived.read(monitor)).toBe(3)

    batch((monitor) => {
      source1.write(2)
      expect(derived.read(monitor)).toBe(4)

      source2.write(3)
      expect(derived.read(monitor)).toBe(5)
    })

    expect(derived.read(monitor)).toBe(5)
  })

  it("updates derived value after all sources change", ({ monitor }) => {
    expect.assertions(4)

    const source1 = Signal(1)
    const source2 = Signal(2)
    const derived = Signal((monitor) => source1.read(monitor) + source2.read(monitor))

    expect(derived.read(monitor)).toBe(3)

    batch((monitor) => {
      source1.write(2)
      source2.write(3)
      expect(derived.read(monitor)).toBe(5)

      source1.write(3)
      source2.write(4)
      expect(derived.read(monitor)).toBe(7)
    })

    expect(derived.read(monitor)).toBe(7)
  })

  it("updates derived values after source changes", ({ monitor }) => {
    expect.assertions(8)

    const source = Signal(1)
    const derived1 = Signal(source)
    const derived2 = Signal(source)

    expect(derived1.read(monitor)).toBe(1)
    expect(derived2.read(monitor)).toBe(1)

    batch((monitor) => {
      source.write(2)
      expect(derived1.read(monitor)).toBe(2)
      expect(derived2.read(monitor)).toBe(2)

      source.write(3)
      expect(derived1.read(monitor)).toBe(3)
      expect(derived2.read(monitor)).toBe(3)
    })

    expect(derived1.read(monitor)).toBe(3)
    expect(derived2.read(monitor)).toBe(3)
  })

  it("updates chained derived values after source changes", ({ monitor }) => {
    const source = Signal(1)
    const derived = Signal(source)
    const derivedDerived = Signal(derived)

    batch((monitor) => {
      expect(derivedDerived.read(monitor)).toBe(1)

      batch((monitor) => {
        source.write(2)
        expect(derivedDerived.read(monitor)).toBe(2)

        source.write(3)
        expect(derivedDerived.read(monitor)).toBe(3)
      })

      expect(derivedDerived.read(monitor)).toBe(3)
    })

    expect(derived.read(monitor)).toBe(3)
    expect(derivedDerived.read(monitor)).toBe(3)
  })

  it("updates derived value after derived change", ({ monitor }) => {
    expect.assertions(7)

    const source = Signal(1)
    const derived = Signal(source, source)

    batch((monitor) => {
      derived.write(1)
      expect(source.read(monitor)).toBe(1)
      expect(derived.read(monitor)).toBe(1)

      derived.write(2)
      expect(source.read(monitor)).toBe(2)
      expect(derived.read(monitor)).toBe(2)

      derived.write(3)
      expect(source.read(monitor)).toBe(3)
      expect(derived.read(monitor)).toBe(3)
    })

    expect(source.read(monitor)).toBe(3)
  })

  it("returns the same subsequent value after a source change", ({ monitor }) => {
    expect.assertions(4)

    const source = Signal(1)
    const derived = Signal((monitor) => ({ count: source.read(monitor) }), {
      equals: Counter.equals,
    })

    expect(derived.read(monitor)).toBe(derived.read(monitor))

    batch((monitor) => {
      source.write(2)
      expect(derived.read(monitor)).toBe(derived.read(monitor))

      source.write(3)
      expect(derived.read(monitor)).toBe(derived.read(monitor))
    })

    expect(derived.read(monitor)).toBe(derived.read(monitor))
  })

  it("returns the comparably equal value after a source change", ({ monitor }) => {
    expect.assertions(7)

    const source = Signal({ count: 1 })
    const derived = Signal((monitor) => source.read(monitor), {
      equals: Counter.equals,
    })

    const source0 = source.read(monitor)
    const derived0 = derived.read(monitor)
    expect(source0).toBe(derived0)

    source.write(Counter.clone)

    const source1 = source.read(monitor)
    expect(source1).not.toBe(source0)
    expect(source1).toStrictEqual(source0)

    const derived1 = derived.read(monitor)
    expect(derived1).toBe(derived0)

    batch((monitor) => {
      source.write(Counter.clone)

      const source2 = source.read(monitor)
      expect(source2).not.toBe(source0)
      expect(source2).toStrictEqual(source0)

      const derived2 = derived.read(monitor)
      expect(derived2).toBe(derived0)
    })
  })
})
