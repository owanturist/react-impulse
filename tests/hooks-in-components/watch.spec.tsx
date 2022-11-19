import { render, screen, fireEvent, act } from "@testing-library/react-hooks"
import React from "react"

import { Sweety, watch } from "../../src"

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
