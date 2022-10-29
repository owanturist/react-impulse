import React, { useState } from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"

import { Sweety, watch, useSweetyMemo } from "../../src"

const identity = <T,>(value: T): T => value

describe.each([
  ["nothing", identity],
  ["watch", watch],
])("using %s as hoc", (_, hoc) => {
  describe("single store", () => {
    const Component: React.FC<{
      onMemo?: React.Dispatch<number>
      value: Sweety<number>
      useMemo: typeof React.useMemo
    }> = hoc(({ onMemo, value, useMemo }) => {
      const [multiplier, setMultiplier] = useState(2)
      const result = useMemo(() => {
        const x = value.getState() * multiplier

        onMemo?.(x)

        return x
      }, [value, multiplier, onMemo])

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
      const onMemo = vi.fn()
      const onRender = vi.fn()

      render(
        <React.Profiler id="test" onRender={onRender}>
          <Component onMemo={onMemo} useMemo={useSweetyMemo} value={value} />
        </React.Profiler>,
      )

      const node = screen.getByTestId("value")

      expect(node).toHaveTextContent("2")
      expect(onMemo).toHaveBeenCalledTimes(1)
      expect(onRender).toHaveBeenCalledTimes(1)
      expect(value).toHaveProperty("subscribers.size", 1)

      act(() => {
        value.setState(2)
      })

      expect(node).toHaveTextContent("4")
      expect(onMemo).toHaveBeenCalledTimes(2)
      expect(onRender).toHaveBeenCalledTimes(2)
      expect(value).toHaveProperty("subscribers.size", 1)
    })

    it("does not call useMemo factory when deps not changed", () => {
      const value = Sweety.of(1)
      const onMemo = vi.fn()
      const onRender = vi.fn()

      const { rerender } = render(
        <React.Profiler id="test" onRender={onRender}>
          <Component useMemo={useSweetyMemo} onMemo={onMemo} value={value} />
        </React.Profiler>,
      )

      expect(onMemo).toHaveBeenCalledTimes(1)
      expect(onMemo).toHaveBeenLastCalledWith(2)
      expect(onRender).toHaveBeenCalledTimes(1)

      rerender(
        <React.Profiler id="test" onRender={onRender}>
          <Component useMemo={useSweetyMemo} onMemo={onMemo} value={value} />
        </React.Profiler>,
      )

      expect(onMemo).toHaveBeenCalledTimes(1)
      expect(onRender).toHaveBeenCalledTimes(2)

      act(() => {
        value.setState(3)
      })

      expect(onMemo).toHaveBeenCalledTimes(2)
      expect(onMemo).toHaveBeenLastCalledWith(6)
      expect(value).toHaveProperty("subscribers.size", 1)
      expect(onRender).toHaveBeenCalledTimes(3)
    })

    it("should call useMemo factory when dep Sweety instance changes", () => {
      const onMemo = vi.fn()
      const onRender = vi.fn()

      const { rerender } = render(
        <React.Profiler id="test" onRender={onRender}>
          <Component
            useMemo={useSweetyMemo}
            onMemo={onMemo}
            value={Sweety.of(1)}
          />
        </React.Profiler>,
      )

      rerender(
        <React.Profiler id="test" onRender={onRender}>
          <Component
            useMemo={useSweetyMemo}
            onMemo={onMemo}
            value={Sweety.of(3)}
          />
        </React.Profiler>,
      )

      expect(onMemo).toHaveBeenCalledTimes(2)
      expect(onMemo).toHaveBeenLastCalledWith(6)
      expect(onRender).toHaveBeenCalledTimes(2)
    })

    it("should unsubscribe Sweety from useMemo when swapped", () => {
      const value = Sweety.of(1)
      const onMemo = vi.fn()
      const onRender = vi.fn()

      const { rerender } = render(
        <React.Profiler id="test" onRender={onRender}>
          <Component useMemo={useSweetyMemo} onMemo={onMemo} value={value} />
        </React.Profiler>,
      )

      rerender(
        <React.Profiler id="test" onRender={onRender}>
          <Component
            useMemo={useSweetyMemo}
            onMemo={onMemo}
            value={Sweety.of(3)}
          />
        </React.Profiler>,
      )

      act(() => {
        value.setState(10)
      })

      expect(onMemo).toHaveBeenCalledTimes(2)
      expect(onMemo).toHaveBeenLastCalledWith(6)
      expect(onRender).toHaveBeenCalledTimes(2)
      expect(value).toHaveProperty("subscribers.size", 0)
    })

    it("should call useMemo factory when non Sweety dep changes", () => {
      const onMemo = vi.fn()
      const onRender = vi.fn()

      render(
        <React.Profiler id="test" onRender={onRender}>
          <Component
            useMemo={useSweetyMemo}
            onMemo={onMemo}
            value={Sweety.of(3)}
          />
        </React.Profiler>,
      )

      fireEvent.click(screen.getByTestId("increment"))

      expect(onMemo).toHaveBeenCalledTimes(2)
      expect(onMemo).toHaveBeenLastCalledWith(9)
      expect(onRender).toHaveBeenCalledTimes(2)
    })
  })

  describe("multiple stores", () => {
    const Component: React.FC<{
      spy?: React.Dispatch<number>
      first: Sweety<number>
      second: Sweety<number>
    }> = hoc(({ spy, first, second }) => {
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
    }> = hoc(({ spy, list }) => {
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
})
