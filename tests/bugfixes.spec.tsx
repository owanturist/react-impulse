import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { Sweety, useSweetyState, useWatchSweety } from "../src"

describe("watching misses when defined after useEffect #140", () => {
  interface ComponentProps {
    first: Sweety<number>
    second: Sweety<number>
    useGetFirst(first: Sweety<number>): number
    useGetSecond(second: Sweety<number>): number
  }

  const ComponentWatchBeforeEffect: React.FC<ComponentProps> = ({
    first,
    second,
    useGetFirst,
    useGetSecond,
  }) => {
    const x = useGetFirst(first)
    const y = useGetSecond(second)

    React.useEffect(() => {
      second.setState(x)
    }, [second, x])

    return (
      <button type="button" onClick={() => first.setState(x + 1)}>
        {y}
      </button>
    )
  }

  const ComponentWatchAfterEffect: React.FC<ComponentProps> = ({
    first,
    second,
    useGetFirst,
    useGetSecond,
  }) => {
    const x = useGetFirst(first)

    React.useEffect(() => {
      second.setState(x)
    }, [second, x])

    const y = useGetSecond(second)

    return (
      <button type="button" onClick={() => first.setState(x + 1)}>
        {y}
      </button>
    )
  }

  const useWatchInline = (store: Sweety<number>) => {
    return useWatchSweety(() => store.getState())
  }

  const useWatchMemoized = (store: Sweety<number>) => {
    return useWatchSweety(React.useCallback(() => store.getState(), [store]))
  }

  describe.each([
    ["before", ComponentWatchBeforeEffect],
    ["after", ComponentWatchAfterEffect],
  ])("calls depending hook %s useEffect", (_, Component) => {
    describe.each([
      ["useSweetyState", useSweetyState],
      ["inline useWatchSweety", useWatchInline],
      ["memoized useWatchSweety", useWatchMemoized],
    ])("with %s as useGetFirst", (__, useGetFirst) => {
      it.each([
        ["useSweetyState", useSweetyState],
        ["inline useWatchSweety", useWatchInline],
        ["memoized useWatchSweety", useWatchMemoized],
      ])("with %s as useGetSecond", (___, useGetSecond) => {
        const first = Sweety.of(0)
        const second = Sweety.of(5)

        render(
          <Component
            first={first}
            second={second}
            useGetFirst={useGetFirst}
            useGetSecond={useGetSecond}
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
})
