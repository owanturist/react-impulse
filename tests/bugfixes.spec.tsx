import { act, fireEvent, render, screen } from "@testing-library/react-hooks"
import React from "react"

import { Sweety, useSweetyState, useWatchSweety } from "../src"

describe("watching misses when defined after useEffect #140", () => {
  interface ComponentProps {
    first: Sweety<number>
    second: Sweety<number>
    useWatchSecond(second: Sweety<number>): number
  }

  const ComponentWatchBeforeEffect: React.FC<ComponentProps> = ({
    first,
    second,
    useWatchSecond,
  }) => {
    const [x, setX] = useSweetyState(first)
    const y = useWatchSecond(second)

    React.useEffect(() => {
      second.setState(x)
    }, [second, x])

    return (
      <button type="button" onClick={() => setX(x + 1)}>
        {y}
      </button>
    )
  }

  const ComponentWatchAfterEffect: React.FC<ComponentProps> = ({
    first,
    second,
    useWatchSecond,
  }) => {
    const [x, setX] = useSweetyState(first)

    React.useEffect(() => {
      second.setState(x)
    }, [second, x])

    const y = useWatchSecond(second)

    return (
      <button type="button" onClick={() => setX(x + 1)}>
        {y}
      </button>
    )
  }

  describe.each([
    ["before", ComponentWatchBeforeEffect],
    ["after", ComponentWatchAfterEffect],
  ])("useWatchSweety is %s useEffect", (_, Component) => {
    it.each([
      [
        "inline",
        (second: Sweety<number>) => {
          return useWatchSweety(() => second.getState())
        },
      ],
      [
        "memoized",
        (second: Sweety<number>) => {
          return useWatchSweety(
            React.useCallback(() => second.getState(), [second]),
          )
        },
      ],
    ])("with %s watcher", (__, useWatchSecond) => {
      const first = Sweety.of(0)
      const second = Sweety.of(5)

      render(
        <Component
          first={first}
          second={second}
          useWatchSecond={useWatchSecond}
        />,
      )

      const button = screen.getByRole("button")
      expect(button).toHaveTextContent("0")

      fireEvent.click(button)
      expect(button).toHaveTextContent("1")

      fireEvent.click(button)
      expect(button).toHaveTextContent("2")

      act(() => {
        first.setState(10)
      })
      expect(button).toHaveTextContent("10")

      fireEvent.click(button)
      expect(button).toHaveTextContent("11")

      act(() => {
        second.setState(20)
      })
      expect(button).toHaveTextContent("20")

      fireEvent.click(button)
      expect(button).toHaveTextContent("12")
    })
  })
})
