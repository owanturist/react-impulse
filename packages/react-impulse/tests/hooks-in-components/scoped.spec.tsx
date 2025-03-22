import { render, screen, fireEvent, act, waitFor } from "@testing-library/react"
import React from "react"

import {
  Impulse,
  useScoped,
  scoped,
  type PropsWithScope,
  type Scope,
  type PropsWithoutScope,
} from "../../src"

describe("scoped()", () => {
  it("should work fine together with useState", () => {
    const Component = scoped<{
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
    }> = scoped(({ scope, first, second, third }) => (
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

  it("should work fine with scoped(scoped())", () => {
    const Component = scoped(
      scoped<{
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
    const Component = scoped<{
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

  it("should scope re-renders via useScoped", () => {
    const Component = scoped<{
      count: Impulse<number>
      // eslint-disable-next-line no-restricted-syntax
    }>(({ count }) => {
      const isMoreThanTwo = useScoped((scope) => count.getValue(scope) > 2)

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
    const Component = scoped<{
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
    expect(count).toHaveEmittersSize(1)

    act(() => {
      count.setValue(3)
    })

    expect(result).toHaveTextContent("6")
    expect(count).toHaveEmittersSize(1)
  })

  it("should unsubscribe when impulse changes", () => {
    const Component = scoped<{
      count: Impulse<number>
    }>(({ scope, count }) => (
      <span data-testid="result">{count.getValue(scope)}</span>
    ))

    const count_1 = Impulse.of(1)
    const count_2 = Impulse.of(3)

    const { rerender } = render(<Component count={count_1} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("1")
    expect(count_1).toHaveEmittersSize(1)
    expect(count_2).toHaveEmittersSize(0)

    rerender(<Component count={count_2} />)

    expect(result).toHaveTextContent("3")
    expect(count_1).toHaveEmittersSize(0)
    expect(count_2).toHaveEmittersSize(1)
  })

  it("should unsubscribe for conditionally rendered impulse when re-render is triggered by changing impulse value", () => {
    const Component = scoped<{
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
    expect(count).toHaveEmittersSize(0)
    expect(condition).toHaveEmittersSize(1)

    act(() => {
      condition.setValue(true)
    })
    expect(result).toHaveTextContent("1")
    expect(count).toHaveEmittersSize(1)
    expect(condition).toHaveEmittersSize(1)

    act(() => {
      count.setValue(2)
    })
    expect(result).toHaveTextContent("2")

    act(() => {
      condition.setValue(false)
    })
    expect(result).toHaveTextContent("none")
    expect(count).toHaveEmittersSize(0)
    expect(condition).toHaveEmittersSize(1)
  })

  it("should unsubscribe for conditionally rendered impulse when re-render is triggered by changing props", () => {
    const Component = scoped<{
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
    expect(count).toHaveEmittersSize(0)

    rerender(<Component count={count} condition={true} />)
    expect(result).toHaveTextContent("1")
    expect(count).toHaveEmittersSize(1)

    act(() => {
      count.setValue(2)
    })
    expect(result).toHaveTextContent("2")

    rerender(<Component count={count} condition={false} />)
    expect(result).toHaveTextContent("none")
    expect(count).toHaveEmittersSize(0)
  })

  it("should unsubscribe for conditionally rendered impulse when re-render is triggered by changing useState", () => {
    const Component = scoped<{
      count: Impulse<number>
    }>(({ scope, count }) => {
      const [condition, setCondition] = React.useState(false)

      return (
        <button
          type="button"
          data-testid="result"
          onClick={() => setCondition((x) => !x)}
        >
          {condition ? count.getValue(scope) : "none"}
        </button>
      )
    })

    const count = Impulse.of(1)

    render(<Component count={count} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("none")
    expect(count).toHaveEmittersSize(0)

    fireEvent.click(result)
    expect(result).toHaveTextContent("1")
    expect(count).toHaveEmittersSize(1)

    act(() => {
      count.setValue(2)
    })
    expect(result).toHaveTextContent("2")

    fireEvent.click(result)
    expect(result).toHaveTextContent("none")
    expect(count).toHaveEmittersSize(0)
  })

  it("should not unsubscribe conditionally rendered impulse if it is used in another place", () => {
    const Component = scoped<{
      count: Impulse<number>
      condition: boolean
    }>(({ scope, count, condition }) => (
      <>
        <span data-testid="x">
          {condition ? count.getValue(scope) : "none"}
        </span>
        <span data-testid="y">{count.getValue(scope)}</span>
      </>
    ))

    const count = Impulse.of(1)

    const { rerender } = render(<Component count={count} condition={false} />)

    const x = screen.getByTestId("x")
    const y = screen.getByTestId("y")

    expect(x).toHaveTextContent("none")
    expect(y).toHaveTextContent("1")
    expect(count).toHaveEmittersSize(1)

    rerender(<Component count={count} condition={true} />)
    expect(x).toHaveTextContent("1")
    expect(y).toHaveTextContent("1")
    expect(count).toHaveEmittersSize(1)

    act(() => {
      count.setValue(2)
    })
    expect(x).toHaveTextContent("2")
    expect(y).toHaveTextContent("2")

    rerender(<Component count={count} condition={false} />)
    expect(x).toHaveTextContent("none")
    expect(y).toHaveTextContent("2")
    expect(count).toHaveEmittersSize(1)
  })

  it("should unsubscribe on unmount", () => {
    const Component = scoped<{
      count: Impulse<number>
    }>(({ scope, count }) => (
      <span data-testid="result">{count.getValue(scope)}</span>
    ))

    const count = Impulse.of(1)

    const { unmount } = render(<Component count={count} />)

    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("1")
    expect(count).toHaveEmittersSize(1)

    unmount()

    expect(count).toHaveEmittersSize(0)
  })

  it("forwards ref", () => {
    interface Props {
      ref?: React.Ref<HTMLSpanElement>
      state: Impulse<number>
    }

    const MemoizedForwarded = scoped<Props>(({ scope, state, ref }) => (
      <span ref={ref} data-testid="count">
        {state.getValue(scope)}
      </span>
    ))

    const state = Impulse.of(0)
    const divRef = vi.fn()

    render(<MemoizedForwarded state={state} ref={divRef} />)

    const count = screen.getByTestId("count")

    expect(count).toHaveTextContent("0")
    expect(divRef).toHaveBeenCalledExactlyOnceWith(expect.any(HTMLSpanElement))
    vi.clearAllMocks()

    act(() => {
      state.setValue((x) => x + 1)
    })

    expect(count).toHaveTextContent("1")
    expect(divRef).not.toHaveBeenCalled()
  })

  it("works with `React.lazy()`", async () => {
    const Component = scoped<{
      count: Impulse<number>
    }>(({ scope, count }) => (
      <div data-testid="count">{count.getValue(scope)}</div>
    ))

    const LazyComponent = React.lazy<typeof Component>(() => {
      return new Promise((done) => {
        setTimeout(() => done({ default: Component }), 10)
      })
    })
    const count = Impulse.of(0)

    render(
      <React.Suspense fallback={null}>
        <LazyComponent count={count} />
      </React.Suspense>,
    )

    expect(screen.queryByTestId("count")).not.toBeInTheDocument()

    expect(await screen.findByTestId("count")).toHaveTextContent("0")

    act(() => {
      count.setValue((x) => x + 1)
    })

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("1")
    })
  })
})

describe.each([
  ["scoped.memo()", scoped.memo],
  [
    "React.memo(scoped())",
    <TProps,>(
      Component: React.FC<PropsWithScope<TProps>>,
      propsAreEqual?: (
        prev: Readonly<PropsWithoutScope<TProps>>,
        next: Readonly<PropsWithoutScope<TProps>>,
      ) => boolean,
    ) => {
      return React.memo(scoped(Component), propsAreEqual)
    },
  ],
])("memoizing with %s", (_, memo) => {
  it("should memoize", () => {
    const Component: React.FC<{
      scope: Scope
      state: Impulse<number>
      onRender: VoidFunction
    }> = ({ scope, state, onRender }) => (
      <React.Profiler id="test" onRender={onRender}>
        <div data-testid="count">{state.getValue(scope)}</div>
      </React.Profiler>
    )

    const Scoped = scoped(Component)
    const ScopedMemoized = memo(Component)

    const Host: React.FC<{
      state: Impulse<number>
      onScopedRender: VoidFunction
      onScopedMemoizedRender: VoidFunction
    }> = ({ state, onScopedRender, onScopedMemoizedRender }) => {
      const [, force] = React.useState(0)

      return (
        <button
          type="button"
          data-testid="force"
          onClick={() => force((x) => x + 1)}
        >
          <Scoped state={state} onRender={onScopedRender} />
          <ScopedMemoized state={state} onRender={onScopedMemoizedRender} />
        </button>
      )
    }

    const state = Impulse.of(0)
    const onScopedRender = vi.fn()
    const onScopedMemoizedRender = vi.fn()

    const { rerender } = render(
      <Host
        state={state}
        onScopedRender={onScopedRender}
        onScopedMemoizedRender={onScopedMemoizedRender}
      />,
    )

    const counts = screen.getAllByTestId("count")
    expect(counts).toHaveLength(2)
    expect(counts[0]).toHaveTextContent("0")
    expect(counts[1]).toHaveTextContent("0")

    expect(onScopedRender).toHaveBeenCalledOnce()
    expect(onScopedMemoizedRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("force"))
    expect(counts[0]).toHaveTextContent("0")
    expect(counts[1]).toHaveTextContent("0")
    expect(onScopedRender).toHaveBeenCalledOnce()
    expect(onScopedMemoizedRender).not.toHaveBeenCalled()
    vi.clearAllMocks()

    rerender(
      <Host
        state={state}
        onScopedRender={onScopedRender}
        onScopedMemoizedRender={onScopedMemoizedRender}
      />,
    )
    expect(counts[0]).toHaveTextContent("0")
    expect(counts[1]).toHaveTextContent("0")
    expect(onScopedRender).toHaveBeenCalledOnce()
    expect(onScopedMemoizedRender).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      state.setValue((x) => x + 1)
    })
    expect(counts[0]).toHaveTextContent("1")
    expect(counts[1]).toHaveTextContent("1")
    expect(onScopedRender).toHaveBeenCalledOnce()
    expect(onScopedMemoizedRender).toHaveBeenCalledOnce()
  })

  it("should pass `propsAreEqual`", () => {
    const Component = memo<{
      scope: Scope
      state: { count: Impulse<number> }
      onRender: VoidFunction
    }>(
      ({ scope, state, onRender }) => (
        <React.Profiler id="test" onRender={onRender}>
          <div data-testid="count">{state.count.getValue(scope)}</div>
        </React.Profiler>
      ),
      (prev, next) => prev.state.count === next.state.count,
    )

    const Host: React.FC<{
      count: Impulse<number>
      onScopedRender: VoidFunction
    }> = ({ count, onScopedRender }) => {
      const [, force] = React.useState(0)

      return (
        <button
          type="button"
          data-testid="force"
          onClick={() => force((x) => x + 1)}
        >
          <Component state={{ count }} onRender={onScopedRender} />
        </button>
      )
    }

    const count = Impulse.of(0)
    const onScopedRender = vi.fn()

    const { rerender } = render(
      <Host count={count} onScopedRender={onScopedRender} />,
    )

    const counter = screen.getByTestId("count")
    expect(counter).toHaveTextContent("0")
    expect(onScopedRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("force"))
    expect(counter).toHaveTextContent("0")
    expect(onScopedRender).toHaveBeenCalledTimes(0)
    vi.clearAllMocks()

    rerender(<Host count={count} onScopedRender={onScopedRender} />)
    expect(counter).toHaveTextContent("0")
    expect(onScopedRender).toHaveBeenCalledTimes(0)
    vi.clearAllMocks()

    act(() => {
      count.setValue((x) => x + 1)
    })
    expect(counter).toHaveTextContent("1")
    expect(onScopedRender).toHaveBeenCalledOnce()
  })

  it("works with `React.lazy()`", async () => {
    const Component = memo<{
      count: Impulse<number>
    }>(({ scope, count }) => (
      <div data-testid="count">{count.getValue(scope)}</div>
    ))

    const LazyComponent = React.lazy<typeof Component>(() => {
      return new Promise((done) => {
        setTimeout(() => done({ default: Component }), 10)
      })
    })
    const count = Impulse.of(0)

    render(
      <React.Suspense fallback={null}>
        <LazyComponent count={count} />
      </React.Suspense>,
    )

    expect(screen.queryByTestId("count")).not.toBeInTheDocument()

    expect(await screen.findByTestId("count")).toHaveTextContent("0")

    act(() => {
      count.setValue((x) => x + 1)
    })

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("1")
    })
  })

  it("forwards ref", () => {
    interface Props {
      ref?: React.Ref<HTMLParagraphElement>
      state: Impulse<number>
    }

    const MemoizedForwarded = memo<Props>(({ scope, state, ref }) => (
      <p ref={ref} data-testid="count">
        {state.getValue(scope)}
      </p>
    ))

    const state = Impulse.of(0)
    const divRef = vi.fn()

    render(<MemoizedForwarded state={state} ref={divRef} />)

    const count = screen.getByTestId("count")

    expect(count).toHaveTextContent("0")
    expect(divRef).toHaveBeenCalledExactlyOnceWith(
      expect.any(HTMLParagraphElement),
    )
    vi.clearAllMocks()

    act(() => {
      state.setValue((x) => x + 1)
    })

    expect(count).toHaveTextContent("1")
    expect(divRef).not.toHaveBeenCalled()
  })
})

describe.each([
  ["not memoized", ((x) => x) as typeof React.useCallback],
  ["memoized", React.useCallback],
])("when %s rendering function passed as prop", (_, useCallback) => {
  it("should re-render when impulse value changes", () => {
    const Host: React.FC<{
      renderCount: (x: number) => React.ReactNode
      onRender: VoidFunction
    }> = ({ renderCount, onRender }) => {
      const [count, setCount] = React.useState(2)

      return (
        <React.Profiler id="host" onRender={onRender}>
          <button
            type="button"
            data-testid="increment"
            onClick={() => setCount((x) => x + 1)}
          />
          {renderCount(count)}
        </React.Profiler>
      )
    }

    const Component: React.FC<{
      count: Impulse<number>
      onRender: VoidFunction
      onHostRender: VoidFunction
    }> = scoped(({ scope, count, onRender, onHostRender }) => {
      onRender()

      return (
        <Host
          renderCount={useCallback(
            (x) => (
              <span data-testid="result">{x * count.getValue(scope)}</span>
            ),
            // eslint-disable-next-line no-restricted-syntax
            [count, scope],
          )}
          onRender={onHostRender}
        />
      )
    })

    const count = Impulse.of(1)
    const onRender = vi.fn()
    const onHostRender = vi.fn()
    render(
      <Component
        count={count}
        onRender={onRender}
        onHostRender={onHostRender}
      />,
    )

    const increment = screen.getByTestId("increment")
    const result = screen.getByTestId("result")

    expect(result).toHaveTextContent("2")
    expect(onRender).toHaveBeenCalledOnce()
    expect(onHostRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(increment)
    expect(result).toHaveTextContent("3")
    expect(onRender).not.toHaveBeenCalled()
    expect(onHostRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      count.setValue((x) => x + 1)
    })

    expect(result).toHaveTextContent("6")
    expect(onRender).toHaveBeenCalledOnce()
    expect(onHostRender).toHaveBeenCalledOnce()
  })
})

describe.each([
  ["React.useEffect", React.useEffect],
  ["React.useLayoutEffect", React.useLayoutEffect],
  ["React.useMemo", React.useMemo],
])("when scope is a dependency of %s", (_, useHookWithDependencies) => {
  it("should run the effect on every render", () => {
    const Component: React.FC<{
      count: Impulse<number>
      onEffect: React.Dispatch<number>
      onRender: VoidFunction
    }> = scoped(({ scope, count, onEffect, onRender }) => {
      const [, force] = React.useState(0)

      useHookWithDependencies(() => {
        onEffect(count.getValue(scope))
        // eslint-disable-next-line no-restricted-syntax
      }, [count, onEffect, scope])

      return (
        <React.Profiler id="root" onRender={onRender}>
          <button
            type="button"
            data-testid="force"
            onClick={() => force((x) => x + 1)}
          />
        </React.Profiler>
      )
    })

    const count = Impulse.of(0)
    const onEffect = vi.fn()
    const onRender = vi.fn()

    const { rerender } = render(
      <Component count={count} onEffect={onEffect} onRender={onRender} />,
    )

    expect(count).toHaveEmittersSize(1)
    expect(onEffect).toHaveBeenCalledExactlyOnceWith(0)
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("force"))
    expect(count).toHaveEmittersSize(1)
    expect(onEffect).toHaveBeenCalledOnce()
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      count.setValue((x) => x + 1)
    })
    expect(count).toHaveEmittersSize(1)
    expect(onEffect).toHaveBeenCalledExactlyOnceWith(1)
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    rerender(
      <Component count={count} onEffect={onEffect} onRender={onRender} />,
    )
    expect(count).toHaveEmittersSize(1)
    expect(onEffect).toHaveBeenCalledExactlyOnceWith(1)
    expect(onRender).toHaveBeenCalledOnce()
  })
})

describe.each([
  ["not memoized", (<T,>(x: T): T => x) as typeof React.memo],
  ["memoized", React.memo],
])("when scope passes as a property to %s component", (_, memo) => {
  const Host: React.FC<{
    count: Impulse<number>
    countChild: Impulse<number>
    onRender: VoidFunction
    onChildRender: VoidFunction
  }> = scoped(({ scope, count, countChild, onRender, onChildRender }) => {
    const [, force] = React.useState(0)

    return (
      <React.Profiler id="host" onRender={onRender}>
        <button
          type="button"
          data-testid="force"
          onClick={() => force((x) => x + 1)}
        />
        <span data-testid="result">{count.getValue(scope)}</span>
        <Child count={countChild} scope={scope} onRender={onChildRender} />
      </React.Profiler>
    )
  })

  const Child: React.FC<{
    count: Impulse<number>
    scope: Scope
    onRender: VoidFunction
  }> = memo(({ count, scope, onRender }) => (
    <React.Profiler id="child" onRender={onRender}>
      <span data-testid="child-result">{count.getValue(scope)}</span>
      <button
        type="button"
        data-testid="increment"
        onClick={() => count.setValue((x) => x + 1)}
      />
    </React.Profiler>
  ))

  const setup = () => {
    const count = Impulse.of(5)
    const countChild = Impulse.of(10)
    const onRender = vi.fn()
    const onChildRender = vi.fn()
    const { rerender } = render(
      <Host
        count={count}
        countChild={countChild}
        onRender={onRender}
        onChildRender={onChildRender}
      />,
    )

    return {
      count,
      countChild,
      onRender,
      onChildRender,
      rerender: () => {
        rerender(
          <Host
            count={count}
            countChild={countChild}
            onRender={onRender}
            onChildRender={onChildRender}
          />,
        )
      },
    }
  }

  it("should successfully render", () => {
    const { onRender, onChildRender, count, countChild } = setup()

    expect(screen.getByTestId("result")).toHaveTextContent("5")
    expect(screen.getByTestId("child-result")).toHaveTextContent("10")
    expect(onRender).toHaveBeenCalledOnce()
    expect(onChildRender).toHaveBeenCalledOnce()
    expect(count).toHaveEmittersSize(1)
    expect(countChild).toHaveEmittersSize(1)
  })

  it.each([
    [
      "inside",
      () => {
        fireEvent.click(screen.getByTestId("increment"))
      },
    ],
    [
      "outside",
      (count: Impulse<number>) => {
        act(() => {
          count.setValue((x) => x + 1)
        })
      },
    ],
  ])(
    "should re-render when countChild value changes from the %s",
    (_, increment) => {
      const { onRender, onChildRender, countChild } = setup()
      vi.clearAllMocks()

      increment(countChild)
      expect(screen.getByTestId("result")).toHaveTextContent("5")
      expect(screen.getByTestId("child-result")).toHaveTextContent("11")
      expect(onRender).toHaveBeenCalledOnce()
      expect(onChildRender).toHaveBeenCalledOnce()
      expect(countChild).toHaveEmittersSize(1)
    },
  )

  it("should re-render when count value changes", () => {
    const { onRender, onChildRender, count } = setup()
    vi.clearAllMocks()

    act(() => {
      count.setValue((x) => x + 1)
    })
    expect(screen.getByTestId("result")).toHaveTextContent("6")
    expect(screen.getByTestId("child-result")).toHaveTextContent("10")
    expect(onRender).toHaveBeenCalledOnce()
    expect(onChildRender).toHaveBeenCalledOnce()
    expect(count).toHaveEmittersSize(1)
  })

  it("should re-render when the host re-renders", () => {
    const { onRender, onChildRender, count, countChild } = setup()
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("force"))
    expect(screen.getByTestId("result")).toHaveTextContent("5")
    expect(screen.getByTestId("child-result")).toHaveTextContent("10")
    expect(onRender).toHaveBeenCalledOnce()
    expect(onChildRender).toHaveBeenCalledOnce()
    expect(count).toHaveEmittersSize(1)
    expect(countChild).toHaveEmittersSize(1)
  })

  it("should re-render on `rerender`", () => {
    const { onRender, onChildRender, count, countChild, rerender } = setup()
    vi.clearAllMocks()

    rerender()
    expect(screen.getByTestId("result")).toHaveTextContent("5")
    expect(screen.getByTestId("child-result")).toHaveTextContent("10")
    expect(onRender).toHaveBeenCalledOnce()
    expect(onChildRender).toHaveBeenCalledOnce()
    expect(count).toHaveEmittersSize(1)
    expect(countChild).toHaveEmittersSize(1)
  })
})
