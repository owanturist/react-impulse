import React, { useState } from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"

import { Sweety, watch, useSweetyMemo } from "../../src"

describe("single store", () => {
  const Component: React.FC<{
    spy?: React.Dispatch<number>
    value: Sweety<number>
    useMemo: typeof React.useMemo
  }> = watch(({ spy, value, useMemo }) => {
    const [multiplier, setMultiplier] = useState(2)
    const result = useMemo(() => {
      const x = value.getState() * multiplier

      spy?.(x)

      return x
    }, [value, multiplier, spy])

    return (
      <>
        <span data-testid="value">{result}</span>
        <button
          type="button"
          data-testid="increment"
          onClick={() => setMultiplier((x) => x + 1)}
        />
      </>
    )
  })

  it("cannot watch inside React.useMemo", () => {
    const value = Sweety.of(1)

    render(<Component useMemo={React.useMemo} value={value} />)

    const node = screen.getByTestId("value")

    expect(node).toHaveTextContent("2")

    act(() => {
      value.setState(2)
    })

    expect(node).toHaveTextContent("2")
  })

  it("can watch inside useSweetyMemo", () => {
    const value = Sweety.of(1)

    render(<Component useMemo={useSweetyMemo} value={value} />)

    const node = screen.getByTestId("value")

    expect(node).toHaveTextContent("2")

    act(() => {
      value.setState(2)
    })

    expect(node).toHaveTextContent("4")
  })

  it("does not call useMemo factory when deps not changed", () => {
    const value = Sweety.of(1)
    const spy = vi.fn()

    const { rerender } = render(
      <Component useMemo={useSweetyMemo} spy={spy} value={value} />,
    )

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(2)

    rerender(<Component useMemo={useSweetyMemo} spy={spy} value={value} />)

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("should call useMemo factory when dep Sweety instance changes", () => {
    const spy = vi.fn()

    const { rerender } = render(
      <Component useMemo={useSweetyMemo} spy={spy} value={Sweety.of(1)} />,
    )

    rerender(
      <Component useMemo={useSweetyMemo} spy={spy} value={Sweety.of(3)} />,
    )

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith(6)
  })

  it("should call useMemo factory when dep non Sweety changes", () => {
    const spy = vi.fn()

    render(<Component useMemo={useSweetyMemo} spy={spy} value={Sweety.of(3)} />)

    fireEvent.click(screen.getByTestId("increment"))

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith(9)
  })
})

describe("multiple stores", () => {
  const Component: React.FC<{
    spy?: React.Dispatch<number>
    first: Sweety<number>
    second: Sweety<number>
  }> = watch(({ spy, first, second }) => {
    const [multiplier, setMultiplier] = useState(2)
    const result = useSweetyMemo(() => {
      const x = (first.getState() + second.getState()) * multiplier

      spy?.(x)

      return x
    }, [first, second, multiplier, spy])

    return (
      <>
        <span data-testid="value">{result}</span>
        <button
          type="button"
          data-testid="increment"
          onClick={() => setMultiplier((x) => x + 1)}
        />
      </>
    )
  })

  it("can watch after both stores", () => {
    const first = Sweety.of(2)
    const second = Sweety.of(3)

    render(<Component first={first} second={second} />)

    const node = screen.getByTestId("value")

    expect(node).toHaveTextContent("10")

    act(() => {
      first.setState(4)
    })
    expect(node).toHaveTextContent("14")

    act(() => {
      second.setState(5)
    })
    expect(node).toHaveTextContent("18")
  })
})

describe("nested stores", () => {
  const Component: React.FC<{
    spy?: React.Dispatch<number>
    list: Sweety<Array<Sweety<number>>>
  }> = watch(({ spy, list }) => {
    const [multiplier, setMultiplier] = useState(2)
    const result = useSweetyMemo(() => {
      const x =
        list
          .getState()
          .map((item) => item.getState())
          .reduce((acc, val) => acc + val, 0) * multiplier

      spy?.(x)

      return x
    }, [list, multiplier, spy])

    return (
      <>
        <span data-testid="value">{result}</span>
        <button
          type="button"
          data-testid="increment"
          onClick={() => setMultiplier((x) => x + 1)}
        />
      </>
    )
  })

  it("can watch after both stores", () => {
    const _0 = Sweety.of(2)
    const _1 = Sweety.of(3)
    const _2 = Sweety.of(4)
    const list = Sweety.of([_0, _1])

    render(<Component list={list} />)

    const node = screen.getByTestId("value")

    expect(node).toHaveTextContent("10")

    act(() => {
      _0.setState(4)
    })
    expect(node).toHaveTextContent("14")

    act(() => {
      _1.setState(5)
    })
    expect(node).toHaveTextContent("18")

    act(() => {
      list.setState((items) => [...items, _2])
    })
    expect(node).toHaveTextContent("26")
  })
})
