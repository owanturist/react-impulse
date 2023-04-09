import { render, screen, fireEvent, act } from "@testing-library/react"
import React from "react"

import {
  Compare,
  Impulse,
  PropsWithScope,
  PropsWithoutScope,
  Scope,
  useImpulseValue,
  useWatchImpulse,
  watch,
} from "../../src"

describe("watch()", () => {
  it("should work fine together with useState", () => {
    const Component = watch<{
      count: Impulse<number>
    }>(({ scope, count }) => {
      const [multiplier, setMultiplier] = React.useState(1)

      return (
        <button
          type="button"
          data-testid="btn"
          onClick={() => setMultiplier((x) => x + 1)}
        >
          {count.getValue(scope) * multiplier}
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
    }> = watch(({ scope, first, second, third }) => (
      <button
        type="button"
        data-testid="btn"
        onClick={() => {
          first.setValue((x) => x + 1)
          second.setValue((x) => x + 1)
          third.setValue((x) => x + 1)
        }}
      >
        {first.getValue(scope) * second.getValue(scope) + third.getValue(scope)}
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
      }>(({ scope, count }) => (
        <button
          type="button"
          data-testid="btn"
          onClick={() => count.setValue((x) => x + 1)}
        >
          {count.getValue(scope)}
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
    }>(({ scope, count }) => (
      <button
        type="button"
        data-testid="btn"
        onClick={() => count.setValue((x) => x + 1)}
      >
        {count.getValue(scope)}
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
      const isMoreThanTwo = useWatchImpulse(
        (scope) => count.getValue(scope) > 2,
      )

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
    expect(count).toHaveProperty("subscribers.size", 1)

    act(() => {
      count.setValue(2)
    })

    expect(result).toHaveTextContent("2")
    expect(count).toHaveProperty("subscribers.size", 1)
  })

  it("should subscribe only ones for the same impulse", () => {
    const Component = watch<{
      count: Impulse<number>
    }>(({ scope, count }) => (
      <span data-testid="result">
        {count.getValue(scope) + count.getValue(scope)}
      </span>
    ))

    const count = Impulse.of(1)

    render(<Component count={count} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("2")
    expect(count).toHaveProperty("subscribers.size", 1)

    act(() => {
      count.setValue(3)
    })

    expect(result).toHaveTextContent("6")
    expect(count).toHaveProperty("subscribers.size", 1)
  })

  it("should unsubscribe when impulse changes", () => {
    const Component = watch<{
      count: Impulse<number>
    }>(({ scope, count }) => (
      <span data-testid="result">{count.getValue(scope)}</span>
    ))

    const count_1 = Impulse.of(1)
    const count_2 = Impulse.of(3)

    const { rerender } = render(<Component count={count_1} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("1")
    expect(count_1).toHaveProperty("subscribers.size", 1)
    expect(count_2).toHaveProperty("subscribers.size", 0)

    rerender(<Component count={count_2} />)

    expect(result).toHaveTextContent("3")
    expect(count_1).toHaveProperty("subscribers.size", 0)
    expect(count_2).toHaveProperty("subscribers.size", 1)
  })

  it("should unsubscribe for conditionally rendered impulses", () => {
    const Component = watch<{
      count: Impulse<number>
      condition: Impulse<boolean>
    }>(({ scope, count, condition }) => (
      <span data-testid="result">
        {condition.getValue(scope) ? count.getValue(scope) : "none"}
      </span>
    ))

    const count = Impulse.of(1)
    const condition = Impulse.of(false)

    render(<Component count={count} condition={condition} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("none")
    expect(count).toHaveProperty("subscribers.size", 0)
    expect(condition).toHaveProperty("subscribers.size", 1)

    act(() => {
      condition.setValue(true)
    })
    expect(result).toHaveTextContent("1")
    expect(count).toHaveProperty("subscribers.size", 1)
    expect(condition).toHaveProperty("subscribers.size", 1)

    act(() => {
      count.setValue(2)
    })
    expect(result).toHaveTextContent("2")

    act(() => {
      condition.setValue(false)
    })
    expect(result).toHaveTextContent("none")
    expect(count).toHaveProperty("subscribers.size", 0)
    expect(condition).toHaveProperty("subscribers.size", 1)
  })

  it("should unsubscribe for conditionally rendered impulse", () => {
    const Component = watch<{
      count: Impulse<number>
      condition: boolean
    }>(({ scope, count, condition }) => (
      <span data-testid="result">
        {condition ? count.getValue(scope) : "none"}
      </span>
    ))

    const count = Impulse.of(1)

    const { rerender } = render(<Component count={count} condition={false} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("none")
    expect(count).toHaveProperty("subscribers.size", 0)

    rerender(<Component count={count} condition={true} />)
    expect(result).toHaveTextContent("1")
    expect(count).toHaveProperty("subscribers.size", 1)

    act(() => {
      count.setValue(2)
    })
    expect(result).toHaveTextContent("2")

    rerender(<Component count={count} condition={false} />)
    expect(result).toHaveTextContent("none")
    expect(count).toHaveProperty("subscribers.size", 0)
  })

  it("should unsubscribe on unmount", () => {
    const Component = watch<{
      count: Impulse<number>
    }>(({ scope, count }) => (
      <span data-testid="result">{count.getValue(scope)}</span>
    ))

    const count = Impulse.of(1)

    const { unmount } = render(<Component count={count} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("1")
    expect(count).toHaveProperty("subscribers.size", 1)

    unmount()

    expect(count).toHaveProperty("subscribers.size", 0)
  })
})

describe.each([
  ["watch.memo()", 0, watch.memo],
  ["watch.memo.forwardRef()", 0, watch.memo.forwardRef],
  ["watch.forwardRef.memo()", 0, watch.forwardRef.memo],
  [
    "React.memo(watch())",
    0,
    <TProps,>(
      Component: React.FC<PropsWithScope<TProps>>,
      propsAreEqual?: Compare<Readonly<PropsWithoutScope<TProps>>>,
    ) => {
      return React.memo(watch(Component), propsAreEqual)
    },
  ],
  [
    "watch(React.memo())",
    1,
    <TProps,>(
      Component: React.FC<PropsWithScope<TProps>>,
      propsAreEqual?: Compare<Readonly<TProps>>,
    ) => {
      if (propsAreEqual == null) {
        return watch(React.memo(Component))
      }

      return watch(
        React.memo(Component, (prev, next) => {
          return prev.scope === next.scope && propsAreEqual(prev, next)
        }),
      )
    },
  ],
])("memoizing with %s", (_, unnecessaryRerendersCount, customMemo) => {
  const memo = customMemo as typeof watch.memo

  it("should memoize", () => {
    const Component: React.FC<{
      scope: Scope
      state: Impulse<number>
      onRender: VoidFunction
    }> = ({ scope, state, onRender }, _refSuppressReactWarning) => (
      <React.Profiler id="test" onRender={onRender}>
        <div data-testid="count">{state.getValue(scope)}</div>
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
    expect(counts[0]).toHaveTextContent("0")
    expect(counts[1]).toHaveTextContent("0")
    expect(onWatchedRender).toHaveBeenCalledOnce()
    expect(onWatchedMemoizedRender).toHaveBeenCalledTimes(
      unnecessaryRerendersCount,
    )
    vi.clearAllMocks()

    rerender(
      <Host
        state={state}
        onWatchedRender={onWatchedRender}
        onWatchedMemoizedRender={onWatchedMemoizedRender}
      />,
    )
    expect(counts[0]).toHaveTextContent("0")
    expect(counts[1]).toHaveTextContent("0")
    expect(onWatchedRender).toHaveBeenCalledOnce()
    expect(onWatchedMemoizedRender).toHaveBeenCalledTimes(
      unnecessaryRerendersCount,
    )
    vi.clearAllMocks()

    act(() => {
      state.setValue((x) => x + 1)
    })
    expect(counts[0]).toHaveTextContent("1")
    expect(counts[1]).toHaveTextContent("1")
    expect(onWatchedRender).toHaveBeenCalledOnce()
    expect(onWatchedMemoizedRender).toHaveBeenCalledOnce()
  })

  it("should pass `propsAreEqual`", () => {
    const Component = memo<{
      state: { count: Impulse<number> }
      onRender: VoidFunction
    }>(
      ({ scope, state, onRender }, _refSuppressReactWarning) => (
        <React.Profiler id="test" onRender={onRender}>
          <div data-testid="count">{state.count.getValue(scope)}</div>
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
    expect(onWatchedRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    vi.clearAllMocks()

    rerender(<Host count={count} onWatchedRender={onWatchedRender} />)
    expect(counter).toHaveTextContent("0")
    expect(onWatchedRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
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
      "watch(React.forwardRef())",
      <TNode, TProps>(
        renderFn: React.ForwardRefRenderFunction<TNode, PropsWithScope<TProps>>,
      ) => watch(React.forwardRef(renderFn)),
    ],
  ])("should pass the reference with %s", (_, forwardRef) => {
    const Component = forwardRef<
      HTMLDivElement,
      {
        state: Impulse<number>
      }
    >(({ scope, state }, ref) => (
      <div ref={ref} data-testid="count">
        {state.getValue(scope)}
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
