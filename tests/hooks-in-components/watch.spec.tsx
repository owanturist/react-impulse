import { render, screen, fireEvent, act } from "@testing-library/react"
import React from "react"

import {
  Compare,
  Impulse,
  useImpulseValue,
  useWatchImpulse,
  watch,
} from "../../src"

describe("watch()", () => {
  it("should work fine together with useState", () => {
    const Component = watch<{
      count: Impulse<number>
    }>(({ count }) => {
      const [multiplier, setMultiplier] = React.useState(1)

      return (
        <button
          type="button"
          data-testid="btn"
          onClick={() => setMultiplier((x) => x + 1)}
        >
          {count.getValue() * multiplier}
        </button>
      )
    })

    const count = Impulse.of(1)
    const onRender = vi.fn()

    render(
      <React.Profiler id="test" onRender={onRender}>
        <Component count={count} />
      </React.Profiler>,
    )

    const btn = screen.getByTestId("btn")

    expect(btn).toHaveTextContent("1")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("2")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      count.setValue(3)
    })
    expect(btn).toHaveTextContent("9")
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("should handle multi impulse updates without batching", () => {
    const Component: React.FC<{
      first: Impulse<number>
      second: Impulse<number>
      third: Impulse<number>
    }> = watch(({ first, second, third }) => (
      <button
        type="button"
        data-testid="btn"
        onClick={() => {
          first.setValue((x) => x + 1)
          second.setValue((x) => x + 1)
          third.setValue((x) => x + 1)
        }}
      >
        {first.getValue() * second.getValue() + third.getValue()}
      </button>
    ))

    const first = Impulse.of(2)
    const second = Impulse.of(3)
    const third = Impulse.of(4)
    const onRender = vi.fn()

    render(
      <React.Profiler id="test" onRender={onRender}>
        <Component first={first} second={second} third={third} />
      </React.Profiler>,
    )

    const btn = screen.getByTestId("btn")

    expect(btn).toHaveTextContent("10")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("17")
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("should work fine with watch(watch())", () => {
    const Component = watch(
      watch<{
        count: Impulse<number>
      }>(({ count }) => (
        <button
          type="button"
          data-testid="btn"
          onClick={() => count.setValue((x) => x + 1)}
        >
          {count.getValue()}
        </button>
      )),
    )

    const count = Impulse.of(1)
    const onRender = vi.fn()

    render(
      <React.Profiler id="test" onRender={onRender}>
        <Component count={count} />
      </React.Profiler>,
    )

    const btn = screen.getByTestId("btn")

    expect(btn).toHaveTextContent("1")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("2")
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("should work fine in strict mode", () => {
    const Component = watch<{
      count: Impulse<number>
    }>(({ count }) => (
      <button
        type="button"
        data-testid="btn"
        onClick={() => count.setValue((x) => x + 1)}
      >
        {count.getValue()}
      </button>
    ))

    const count = Impulse.of(1)

    render(
      <React.StrictMode>
        <Component count={count} />
      </React.StrictMode>,
    )

    const btn = screen.getByTestId("btn")

    expect(btn).toHaveTextContent("1")

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("2")
  })

  it("should scope re-renders via useWatchImpulse", () => {
    const Component = watch<{
      count: Impulse<number>
    }>(({ count }) => {
      const isMoreThanTwo = useWatchImpulse(() => count.getValue() > 2)

      return <span data-testid="result">{isMoreThanTwo && "Done"}</span>
    })

    const count = Impulse.of(1)
    const onRender = vi.fn()

    render(
      <React.Profiler id="test" onRender={onRender}>
        <Component count={count} />
      </React.Profiler>,
    )

    const result = screen.getByTestId("result")

    expect(result).not.toHaveTextContent("Done")
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      count.setValue(2)
    })

    expect(result).not.toHaveTextContent("Done")
    expect(onRender).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      count.setValue(3)
    })

    expect(result).toHaveTextContent("Done")
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("should subscribe only ones for the same impulse", () => {
    const Component = watch<{
      count: Impulse<number>
    }>(({ count }) => (
      <span data-testid="result">{count.getValue() + count.getValue()}</span>
    ))

    const count = Impulse.of(1)

    render(<Component count={count} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("2")
    expect(count).toHaveProperty("emitters.size", 1)

    act(() => {
      count.setValue(3)
    })

    expect(result).toHaveTextContent("6")
    expect(count).toHaveProperty("emitters.size", 1)
  })

  it("should unsubscribe when impulse changes", () => {
    const Component = watch<{
      count: Impulse<number>
    }>(({ count }) => <span data-testid="result">{count.getValue()}</span>)

    const count_1 = Impulse.of(1)
    const count_2 = Impulse.of(3)

    const { rerender } = render(<Component count={count_1} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("1")
    expect(count_1).toHaveProperty("emitters.size", 1)
    expect(count_2).toHaveProperty("emitters.size", 0)

    rerender(<Component count={count_2} />)

    expect(result).toHaveTextContent("3")
    expect(count_1).toHaveProperty("emitters.size", 0)
    expect(count_2).toHaveProperty("emitters.size", 1)
  })

  it("should unsubscribe for conditionally rendered impulse when re-render is triggered by changing impulse value", () => {
    const Component = watch<{
      count: Impulse<number>
      condition: Impulse<boolean>
    }>(({ count, condition }) => (
      <span data-testid="result">
        {condition.getValue() ? count.getValue() : "none"}
      </span>
    ))

    const count = Impulse.of(1)
    const condition = Impulse.of(false)

    render(<Component count={count} condition={condition} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("none")
    expect(count).toHaveProperty("emitters.size", 0)
    expect(condition).toHaveProperty("emitters.size", 1)

    act(() => {
      condition.setValue(true)
    })
    expect(result).toHaveTextContent("1")
    expect(count).toHaveProperty("emitters.size", 1)
    expect(condition).toHaveProperty("emitters.size", 1)

    act(() => {
      count.setValue(2)
    })
    expect(result).toHaveTextContent("2")

    act(() => {
      condition.setValue(false)
    })
    expect(result).toHaveTextContent("none")
    expect(count).toHaveProperty("emitters.size", 0)
    expect(condition).toHaveProperty("emitters.size", 1)
  })

  it("should unsubscribe for conditionally rendered impulse when re-render is triggered by changing props", () => {
    const Component = watch<{
      count: Impulse<number>
      condition: boolean
    }>(({ count, condition }) => (
      <span data-testid="result">{condition ? count.getValue() : "none"}</span>
    ))

    const count = Impulse.of(1)

    const { rerender } = render(<Component count={count} condition={false} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("none")
    expect(count).toHaveProperty("emitters.size", 0)

    rerender(<Component count={count} condition={true} />)
    expect(result).toHaveTextContent("1")
    expect(count).toHaveProperty("emitters.size", 1)

    act(() => {
      count.setValue(2)
    })
    expect(result).toHaveTextContent("2")

    rerender(<Component count={count} condition={false} />)
    expect(result).toHaveTextContent("none")
    expect(count).toHaveProperty("emitters.size", 0)
  })

  it("should unsubscribe for conditionally rendered impulse when re-render is triggered by changing useState", () => {
    const Component = watch<{
      count: Impulse<number>
    }>(({ count }) => {
      const [condition, setCondition] = React.useState(false)

      return (
        <button
          type="button"
          data-testid="result"
          onClick={() => setCondition((x) => !x)}
        >
          {/* eslint-disable-next-line jest/no-if */}
          {condition ? count.getValue() : "none"}
        </button>
      )
    })

    const count = Impulse.of(1)

    render(<Component count={count} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("none")
    expect(count).toHaveProperty("emitters.size", 0)

    fireEvent.click(result)
    expect(result).toHaveTextContent("1")
    expect(count).toHaveProperty("emitters.size", 1)

    act(() => {
      count.setValue(2)
    })
    expect(result).toHaveTextContent("2")

    fireEvent.click(result)
    expect(result).toHaveTextContent("none")
    expect(count).toHaveProperty("emitters.size", 0)
  })

  it("should not unsubscribe conditionally rendered impulse if it is used in another place", () => {
    const Component = watch<{
      count: Impulse<number>
      condition: boolean
    }>(({ count, condition }) => (
      <>
        <span data-testid="x">{condition ? count.getValue() : "none"}</span>
        <span data-testid="y">{count.getValue()}</span>
      </>
    ))

    const count = Impulse.of(1)

    const { rerender } = render(<Component count={count} condition={false} />)

    const x = screen.getByTestId("x")
    const y = screen.getByTestId("y")

    expect(x).toHaveTextContent("none")
    expect(y).toHaveTextContent("1")
    expect(count).toHaveProperty("emitters.size", 1)

    rerender(<Component count={count} condition={true} />)
    expect(x).toHaveTextContent("1")
    expect(y).toHaveTextContent("1")
    expect(count).toHaveProperty("emitters.size", 1)

    act(() => {
      count.setValue(2)
    })
    expect(x).toHaveTextContent("2")
    expect(y).toHaveTextContent("2")

    rerender(<Component count={count} condition={false} />)
    expect(x).toHaveTextContent("none")
    expect(y).toHaveTextContent("2")
    expect(count).toHaveProperty("emitters.size", 1)
  })

  it("should unsubscribe on unmount", () => {
    const Component = watch<{
      count: Impulse<number>
    }>(({ count }) => <span data-testid="result">{count.getValue()}</span>)

    const count = Impulse.of(1)

    const { unmount } = render(<Component count={count} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("1")
    expect(count).toHaveProperty("emitters.size", 1)

    unmount()

    expect(count).toHaveProperty("emitters.size", 0)
  })

  it("should not subscribe twice with useImpulseValue", () => {
    const Component = watch<{
      count: Impulse<number>
    }>(({ count }) => {
      const x = useImpulseValue(count)

      return <span data-testid="result">{x}</span>
    })

    const count = Impulse.of(1)

    render(<Component count={count} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("1")
    expect(count).toHaveProperty("emitters.size", 1)

    act(() => {
      count.setValue(2)
    })

    expect(result).toHaveTextContent("2")
    expect(count).toHaveProperty("emitters.size", 1)
  })
})

describe.each([
  ["watch.memo()", watch.memo],
  ["watch.memo.forwardRef()", watch.memo.forwardRef],
  ["watch.forwardRef.memo()", watch.forwardRef.memo],
  [
    "React.memo(watch())",
    <TProps,>(
      Component: React.FC<TProps>,
      propsAreEqual?: Compare<Readonly<TProps>>,
    ) => {
      return React.memo(watch(Component), propsAreEqual)
    },
  ],
])("memoizing with %s", (_, customMemo) => {
  const memo = customMemo as typeof watch.memo

  it("should memoize", () => {
    const Component: React.FC<{
      state: Impulse<number>
      onRender: VoidFunction
    }> = ({ state, onRender }) => (
      <React.Profiler id="test" onRender={onRender}>
        <div data-testid="count">{state.getValue()}</div>
      </React.Profiler>
    )

    const Watched = watch(Component)
    const WatchedMemoized = memo(Component)

    const Host: React.FC<{
      state: Impulse<number>
      onWatchedRender: VoidFunction
      onWatchedMemoizedRender: VoidFunction
    }> = ({ state, onWatchedRender, onWatchedMemoizedRender }) => {
      const [, force] = React.useState(0)

      return (
        <button
          type="button"
          data-testid="force"
          onClick={() => force((x) => x + 1)}
        >
          <Watched state={state} onRender={onWatchedRender} />
          <WatchedMemoized state={state} onRender={onWatchedMemoizedRender} />
        </button>
      )
    }

    const state = Impulse.of(0)
    const onWatchedRender = vi.fn()
    const onWatchedMemoizedRender = vi.fn()

    const { rerender } = render(
      <Host
        state={state}
        onWatchedRender={onWatchedRender}
        onWatchedMemoizedRender={onWatchedMemoizedRender}
      />,
    )

    const counts = screen.getAllByTestId("count")
    expect(counts).toHaveLength(2)
    expect(counts[0]).toHaveTextContent("0")
    expect(counts[1]).toHaveTextContent("0")

    expect(onWatchedRender).toHaveBeenCalledOnce()
    expect(onWatchedMemoizedRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("force"))
    expect(onWatchedRender).toHaveBeenCalledOnce()
    expect(onWatchedMemoizedRender).not.toHaveBeenCalled()
    vi.clearAllMocks()

    rerender(
      <Host
        state={state}
        onWatchedRender={onWatchedRender}
        onWatchedMemoizedRender={onWatchedMemoizedRender}
      />,
    )
    expect(onWatchedRender).toHaveBeenCalledOnce()
    expect(onWatchedMemoizedRender).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      state.setValue((x) => x + 1)
    })
    expect(onWatchedRender).toHaveBeenCalledOnce()
    expect(onWatchedMemoizedRender).toHaveBeenCalledOnce()
    expect(counts[0]).toHaveTextContent("1")
    expect(counts[1]).toHaveTextContent("1")
  })

  it("should pass `propsAreEqual`", () => {
    const Component = memo<{
      state: { count: Impulse<number> }
      onRender: VoidFunction
    }>(
      ({ state, onRender }, _refSuppressReactWarning) => (
        <React.Profiler id="test" onRender={onRender}>
          <div data-testid="count">{state.count.getValue()}</div>
        </React.Profiler>
      ),
      (prev, next) => prev.state.count === next.state.count,
    )

    const Host: React.FC<{
      count: Impulse<number>
      onWatchedRender: VoidFunction
    }> = ({ count, onWatchedRender }) => {
      const [, force] = React.useState(0)

      return (
        <button
          type="button"
          data-testid="force"
          onClick={() => force((x) => x + 1)}
        >
          <Component state={{ count }} onRender={onWatchedRender} />
        </button>
      )
    }

    const count = Impulse.of(0)
    const onWatchedRender = vi.fn()

    const { rerender } = render(
      <Host count={count} onWatchedRender={onWatchedRender} />,
    )

    const counter = screen.getByTestId("count")
    expect(counter).toHaveTextContent("0")
    expect(onWatchedRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("force"))
    expect(counter).toHaveTextContent("0")
    expect(onWatchedRender).toHaveBeenCalledTimes(0)
    vi.clearAllMocks()

    rerender(<Host count={count} onWatchedRender={onWatchedRender} />)
    expect(counter).toHaveTextContent("0")
    expect(onWatchedRender).toHaveBeenCalledTimes(0)
    vi.clearAllMocks()

    act(() => {
      count.setValue((x) => x + 1)
    })
    expect(counter).toHaveTextContent("1")
    expect(onWatchedRender).toHaveBeenCalledOnce()
  })
})

describe("watch.forwardRef()", () => {
  it.each([
    ["watch.forwardRef()", watch.forwardRef],
    ["watch.memo.forwardRef()", watch.memo.forwardRef],
    ["watch.forwardRef.memo()", watch.forwardRef.memo],
    [
      "React.forwardRef(watch())",
      <TNode, TProps>(
        renderFn: React.ForwardRefRenderFunction<TNode, TProps>,
      ): React.ForwardRefExoticComponent<
        React.PropsWithoutRef<TProps> & React.RefAttributes<TNode>
      > => {
        const component = watch(renderFn) as React.ForwardRefRenderFunction<
          TNode,
          TProps
        >

        return React.forwardRef(component)
      },
    ],
  ])("should pass the reference with %s", (_, forwardRef) => {
    const Component = forwardRef<
      HTMLDivElement,
      {
        state: Impulse<number>
      }
    >(({ state }, ref) => (
      <div ref={ref} data-testid="count">
        {state.getValue()}
      </div>
    ))

    const state = Impulse.of(0)
    const divRef = vi.fn()

    render(<Component state={state} ref={divRef} />)

    const count = screen.getByTestId("count")

    expect(count).toHaveTextContent("0")
    expect(divRef).toHaveBeenCalledOnce()
    expect(divRef).toHaveBeenLastCalledWith(expect.any(HTMLDivElement))
    vi.clearAllMocks()

    act(() => {
      state.setValue((x) => x + 1)
    })

    expect(count).toHaveTextContent("1")
    expect(divRef).not.toHaveBeenCalled()
  })
})

describe("wild cases", () => {
  it("should work with `React.lazy()`", async () => {
    const Component = watch.memo<{ count: Impulse<number> }>(({ count }) => (
      <div data-testid="count">{count.getValue()}</div>
    ))

    const LazyComponent = React.lazy(() =>
      Promise.resolve({ default: Component }),
    )
    const count = Impulse.of(0)

    render(
      <React.Suspense fallback={null}>
        <LazyComponent count={count} />
      </React.Suspense>,
    )

    expect(await screen.findByTestId("count")).toHaveTextContent("0")

    act(() => {
      count.setValue((x) => x + 1)
    })
    expect(screen.getByTestId("count")).toHaveTextContent("1")
  })
})
