import { render, screen, fireEvent, act } from "@testing-library/react"
import React from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { Impulse, useImpulseValue, useWatchImpulse, watch } from "../../src"

vi.mock("use-sync-external-store/shim/with-selector.js", async () => {
  const actual: {
    useSyncExternalStoreWithSelector: typeof useSyncExternalStoreWithSelector
  } = await vi.importActual("use-sync-external-store/shim/with-selector.js")

  return {
    useSyncExternalStoreWithSelector: vi.fn(
      actual.useSyncExternalStoreWithSelector,
    ),
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

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
    expect(onRender).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("2")
    expect(onRender).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("3")
    expect(onRender).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    act(() => {
      count.setValue(3)
    })
    expect(btn).toHaveTextContent("9")
    expect(onRender).toHaveBeenCalledTimes(1)
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
    expect(onRender).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("17")
    expect(onRender).toHaveBeenCalledTimes(1)
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
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(useSyncExternalStoreWithSelector).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("2")
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(useSyncExternalStoreWithSelector).toHaveBeenCalledTimes(1)
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
    expect(onRender).toHaveBeenCalledTimes(1)
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
    expect(onRender).toHaveBeenCalledTimes(1)
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
})

describe("watch.memo()", () => {
  it.each([
    ["watch.memo()", watch.memo],
    ["watch.memo.forwardRef()", watch.memo.forwardRef],
    ["watch.forwardRef.memo()", watch.forwardRef.memo],
    [
      "React.memo(watch())",
      <TProps,>(fc: React.FC<TProps>) => React.memo(watch(fc)),
    ],
  ])("should memoize with %s", (_, memo) => {
    const Component: React.FC<{
      state: Impulse<number>
      onRender: VoidFunction
    }> = ({ state, onRender }) => (
      <React.Profiler id="test" onRender={onRender}>
        <div data-testid="count">{state.getValue()}</div>
      </React.Profiler>
    )

    const Watched = watch(Component)
    const WatchedMemoized = (memo as typeof React.memo)(Component)

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

    expect(onWatchedRender).toHaveBeenCalledTimes(1)
    expect(onWatchedMemoizedRender).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("force"))
    expect(onWatchedRender).toHaveBeenCalledTimes(1)
    expect(onWatchedMemoizedRender).toHaveBeenCalledTimes(0)
    vi.clearAllMocks()

    rerender(
      <Host
        state={state}
        onWatchedRender={onWatchedRender}
        onWatchedMemoizedRender={onWatchedMemoizedRender}
      />,
    )
    expect(onWatchedRender).toHaveBeenCalledTimes(1)
    expect(onWatchedMemoizedRender).toHaveBeenCalledTimes(0)
    vi.clearAllMocks()

    act(() => {
      state.setValue((x) => x + 1)
    })
    expect(onWatchedRender).toHaveBeenCalledTimes(1)
    expect(onWatchedMemoizedRender).toHaveBeenCalledTimes(1)
    expect(counts[0]).toHaveTextContent("1")
    expect(counts[1]).toHaveTextContent("1")
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
    expect(divRef).toHaveBeenCalledTimes(1)
    expect(divRef).toHaveBeenLastCalledWith(expect.any(HTMLDivElement))
    vi.clearAllMocks()

    act(() => {
      state.setValue((x) => x + 1)
    })

    expect(count).toHaveTextContent("1")
    expect(divRef).not.toHaveBeenCalled()
  })
})
