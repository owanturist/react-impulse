import { render, screen, fireEvent, act } from "@testing-library/react"
import React from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { Sweety, watch } from "../../src"

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
      count: Sweety<number>
    }>(({ count }) => {
      const [multiplier, setMultiplier] = React.useState(1)

      return (
        <button
          type="button"
          data-testid="btn"
          onClick={() => setMultiplier((x) => x + 1)}
        >
          {count.getState() * multiplier}
        </button>
      )
    })

    const store = Sweety.of(1)
    const onRender = vi.fn()

    render(
      <React.Profiler id="test" onRender={onRender}>
        <Component count={store} />
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
      store.setState(3)
    })
    expect(btn).toHaveTextContent("9")
    expect(onRender).toHaveBeenCalledTimes(1)
  })

  it("should handle multi store updates without batching", () => {
    const Component: React.FC<{
      first: Sweety<number>
      second: Sweety<number>
      third: Sweety<number>
    }> = watch(({ first, second, third }) => (
      <button
        type="button"
        data-testid="btn"
        onClick={() => {
          first.setState((x) => x + 1)
          second.setState((x) => x + 1)
          third.setState((x) => x + 1)
        }}
      >
        {first.getState() * second.getState() + third.getState()}
      </button>
    ))

    const first = Sweety.of(2)
    const second = Sweety.of(3)
    const third = Sweety.of(4)
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
        count: Sweety<number>
      }>(({ count }) => (
        <button
          type="button"
          data-testid="btn"
          onClick={() => count.setState((x) => x + 1)}
        >
          {count.getState()}
        </button>
      )),
    )

    const store = Sweety.of(1)
    const onRender = vi.fn()

    render(
      <React.Profiler id="test" onRender={onRender}>
        <Component count={store} />
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

  it("should work fine in Strict mode", () => {
    const Component = watch<{
      count: Sweety<number>
    }>(({ count }) => (
      <button
        type="button"
        data-testid="btn"
        onClick={() => count.setState((x) => x + 1)}
      >
        {count.getState()}
      </button>
    ))

    const store = Sweety.of(1)

    render(
      <React.StrictMode>
        <Component count={store} />
      </React.StrictMode>,
    )

    const btn = screen.getByTestId("btn")

    expect(btn).toHaveTextContent("1")

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("2")
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
      state: Sweety<number>
      onRender: VoidFunction
    }> = ({ state, onRender }) => (
      <React.Profiler id="test" onRender={onRender}>
        <div data-testid="count">{state.getState()}</div>
      </React.Profiler>
    )

    const Watched = watch(Component)
    const WatchedMemoized = (memo as typeof React.memo)(Component)

    const Host: React.FC<{
      state: Sweety<number>
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

    const state = Sweety.of(0)
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
      state.setState((x) => x + 1)
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
        state: Sweety<number>
      }
    >(({ state }, ref) => (
      <div ref={ref} data-testid="count">
        {state.getState()}
      </div>
    ))

    const state = Sweety.of(0)
    const divRef = vi.fn()

    render(<Component state={state} ref={divRef} />)

    const count = screen.getByTestId("count")

    expect(count).toHaveTextContent("0")
    expect(divRef).toHaveBeenCalledTimes(1)
    expect(divRef).toHaveBeenLastCalledWith(expect.any(HTMLDivElement))
    vi.clearAllMocks()

    act(() => {
      state.setState((x) => x + 1)
    })

    expect(count).toHaveTextContent("1")
    expect(divRef).not.toHaveBeenCalled()
  })
})
