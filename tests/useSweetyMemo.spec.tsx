import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"

import { Sweety, watch, useSweetyMemo } from "../src"

const identity = <T,>(value: T): T => value

describe.each([
  ["nothing", identity as typeof watch],
  ["watch", watch],
])("using %s as hoc", (_, hoc) => {
  describe("single store", () => {
    const Component: React.FC<{
      onMemo?: React.Dispatch<number>
      value: Sweety<number>
      useMemo: typeof React.useMemo
    }> = hoc(({ onMemo, value, useMemo }) => {
      const [multiplier, setMultiplier] = React.useState(2)
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
      vi.clearAllMocks()

      act(() => {
        value.setState(2)
      })

      expect(node).toHaveTextContent("4")
      expect(onMemo).toHaveBeenCalledTimes(1)
      expect(onRender).toHaveBeenCalledTimes(1)
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
      vi.clearAllMocks()

      rerender(
        <React.Profiler id="test" onRender={onRender}>
          <Component useMemo={useSweetyMemo} onMemo={onMemo} value={value} />
        </React.Profiler>,
      )

      expect(onMemo).not.toHaveBeenCalled()
      expect(onRender).toHaveBeenCalledTimes(1)
      vi.clearAllMocks()

      act(() => {
        value.setState(3)
      })

      expect(onMemo).toHaveBeenCalledTimes(1)
      expect(onMemo).toHaveBeenLastCalledWith(6)
      expect(value).toHaveProperty("subscribers.size", 1)
      expect(onRender).toHaveBeenCalledTimes(1)
    })

    it("should call useMemo factory when dep Sweety instance changes", () => {
      const value_1 = Sweety.of(1)
      const value_2 = Sweety.of(3)
      const onMemo = vi.fn()
      const onRender = vi.fn()

      const { rerender } = render(
        <React.Profiler id="test" onRender={onRender}>
          <Component useMemo={useSweetyMemo} onMemo={onMemo} value={value_1} />
        </React.Profiler>,
      )
      vi.clearAllMocks()

      rerender(
        <React.Profiler id="test" onRender={onRender}>
          <Component useMemo={useSweetyMemo} onMemo={onMemo} value={value_2} />
        </React.Profiler>,
      )

      expect(onMemo).toHaveBeenCalledTimes(1)
      expect(onMemo).toHaveBeenLastCalledWith(6)
      expect(onRender).toHaveBeenCalledTimes(1)
    })

    it("should unsubscribe Sweety from useMemo when swapped", () => {
      const value_1 = Sweety.of(1)
      const value_2 = Sweety.of(3)
      const onMemo = vi.fn()
      const onRender = vi.fn()

      const { rerender } = render(
        <React.Profiler id="test" onRender={onRender}>
          <Component useMemo={useSweetyMemo} onMemo={onMemo} value={value_1} />
        </React.Profiler>,
      )

      rerender(
        <React.Profiler id="test" onRender={onRender}>
          <Component useMemo={useSweetyMemo} onMemo={onMemo} value={value_2} />
        </React.Profiler>,
      )
      vi.clearAllMocks()

      act(() => {
        value_1.setState(10)
      })

      expect(onMemo).not.toHaveBeenCalled()
      expect(onRender).not.toHaveBeenCalled()
      expect(value_1).toHaveProperty("subscribers.size", 0)
      vi.clearAllMocks()

      act(() => {
        value_2.setState(5)
      })
      expect(onMemo).toHaveBeenCalledTimes(1)
      expect(onMemo).toHaveBeenLastCalledWith(10)
      expect(onRender).toHaveBeenCalledTimes(1)
      expect(value_2).toHaveProperty("subscribers.size", 1)
    })

    it("should call useMemo factory when none-Sweety dep changes", () => {
      const value = Sweety.of(3)
      const onMemo = vi.fn()
      const onRender = vi.fn()

      render(
        <React.Profiler id="test" onRender={onRender}>
          <Component useMemo={useSweetyMemo} onMemo={onMemo} value={value} />
        </React.Profiler>,
      )
      vi.clearAllMocks()

      fireEvent.click(screen.getByTestId("increment"))

      expect(onMemo).toHaveBeenCalledTimes(1)
      expect(onMemo).toHaveBeenLastCalledWith(9)
      expect(onRender).toHaveBeenCalledTimes(1)
      expect(value).toHaveProperty("subscribers.size", 1)
      vi.clearAllMocks()

      act(() => {
        value.setState(4)
      })
      expect(onMemo).toHaveBeenCalledTimes(1)
      expect(onMemo).toHaveBeenLastCalledWith(12)
      expect(onRender).toHaveBeenCalledTimes(1)
      expect(value).toHaveProperty("subscribers.size", 1)
    })
  })

  describe("multiple stores", () => {
    const Component: React.FC<{
      first: Sweety<number>
      second: Sweety<number>
    }> = hoc(({ first, second }) => {
      const [multiplier, setMultiplier] = React.useState(2)
      const result = useSweetyMemo(() => {
        return (first.getState() + second.getState()) * multiplier
      }, [first, second, multiplier])

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

      expect(first).toHaveProperty("subscribers.size", 1)
      expect(second).toHaveProperty("subscribers.size", 1)
      expect(node).toHaveTextContent("10")

      act(() => {
        first.setState(4)
      })
      expect(node).toHaveTextContent("14")

      act(() => {
        second.setState(5)
      })
      expect(node).toHaveTextContent("18")

      expect(first).toHaveProperty("subscribers.size", 1)
      expect(second).toHaveProperty("subscribers.size", 1)
    })
  })

  describe("nested stores", () => {
    const Component: React.FC<{
      list: Sweety<Array<Sweety<number>>>
    }> = hoc(({ list }) => {
      const [multiplier, setMultiplier] = React.useState(2)
      const result = useSweetyMemo(() => {
        const x =
          list
            .getState()
            .map((item) => item.getState())
            .reduce((acc, val) => acc + val, 0) * multiplier

        return x
      }, [list, multiplier])

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

    it("can watch after all stores", () => {
      const _0 = Sweety.of(2)
      const _1 = Sweety.of(3)
      const _2 = Sweety.of(4)
      const list = Sweety.of([_0, _1])

      render(<Component list={list} />)

      expect(list).toHaveProperty("subscribers.size", 1)
      expect(_0).toHaveProperty("subscribers.size", 1)
      expect(_1).toHaveProperty("subscribers.size", 1)
      expect(_2).toHaveProperty("subscribers.size", 0)

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

      expect(_2).toHaveProperty("subscribers.size", 1)

      act(() => {
        list.setState((items) => items.slice(1))
      })
      expect(node).toHaveTextContent("18")

      expect(list).toHaveProperty("subscribers.size", 1)
      expect(_0).toHaveProperty("subscribers.size", 0)
      expect(_1).toHaveProperty("subscribers.size", 1)
      expect(_2).toHaveProperty("subscribers.size", 1)
    })
  })
})
