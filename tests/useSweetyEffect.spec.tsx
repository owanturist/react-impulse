import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"

import {
  Sweety,
  watch,
  useSweetyEffect,
  useSweetyLayoutEffect,
  useSweetyInsertionEffect,
} from "../src"

const identity = <T,>(value: T): T => value

describe.each([
  ["useEffect", React.useEffect, useSweetyEffect],
  ["useLayoutEffect", React.useLayoutEffect, useSweetyLayoutEffect],
  ["useInsertionEffect", React.useInsertionEffect, useSweetyInsertionEffect],
])("running %s hook", (hookName, useReactEffect, useCustomSweetyEffect) => {
  describe.each([
    ["nothing", identity],
    ["watch", watch],
  ])("using %s as hoc", (_, hoc) => {
    describe("single store", () => {
      const Component: React.FC<{
        value: Sweety<number>
        useEffect: typeof React.useEffect
        onEffect: React.Dispatch<number>
      }> = hoc(({ onEffect, value, useEffect }) => {
        const [multiplier, setMultiplier] = React.useState(2)

        useEffect(() => {
          const x = value.getState() * multiplier

          onEffect(x)
        }, [value, multiplier, onEffect])

        return (
          <button
            type="button"
            data-testid="increment"
            onClick={() => setMultiplier((x) => x + 1)}
          />
        )
      })

      it(`cannot watch inside React ${hookName}`, () => {
        const value = Sweety.of(3)
        const onEffect = vi.fn()

        render(
          <Component
            onEffect={onEffect}
            useEffect={useReactEffect}
            value={value}
          />,
        )

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(6)

        act(() => {
          value.setState(2)
        })

        expect(onEffect).toHaveBeenCalledTimes(1)
      })

      it(`can watch inside Sweety ${hookName}`, () => {
        const value = Sweety.of(3)
        const onEffect = vi.fn()

        render(
          <Component
            onEffect={onEffect}
            useEffect={useCustomSweetyEffect}
            value={value}
          />,
        )

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(6)

        act(() => {
          value.setState(2)
        })

        expect(onEffect).toHaveBeenCalledTimes(2)
        expect(onEffect).toHaveBeenLastCalledWith(4)
      })

      it("does not call useEffect factory when deps not changed", () => {
        const value = Sweety.of(1)
        const onEffect = vi.fn()
        const onRender = vi.fn()

        const { rerender } = render(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomSweetyEffect}
              onEffect={onEffect}
              value={value}
            />
          </React.Profiler>,
        )

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(2)
        expect(onRender).toHaveBeenCalledTimes(1)

        rerender(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomSweetyEffect}
              onEffect={onEffect}
              value={value}
            />
          </React.Profiler>,
        )

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onRender).toHaveBeenCalledTimes(2)

        act(() => {
          value.setState(3)
        })

        expect(onEffect).toHaveBeenCalledTimes(2)
        expect(onEffect).toHaveBeenLastCalledWith(6)
        expect(value).toHaveProperty("subscribers.size", 1)
        expect(onRender).toHaveBeenCalledTimes(3)
      })

      it("should call useEffect factory when dep Sweety instance changes", () => {
        const value_1 = Sweety.of(1)
        const value_2 = Sweety.of(3)
        const onEffect = vi.fn()
        const onRender = vi.fn()

        const { rerender } = render(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomSweetyEffect}
              onEffect={onEffect}
              value={value_1}
            />
          </React.Profiler>,
        )

        rerender(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomSweetyEffect}
              onEffect={onEffect}
              value={value_2}
            />
          </React.Profiler>,
        )

        expect(onEffect).toHaveBeenCalledTimes(2)
        expect(onEffect).toHaveBeenLastCalledWith(6)
        expect(onRender).toHaveBeenCalledTimes(2)
      })

      it("should unsubscribe Sweety from useEffect when swapped", () => {
        const value_1 = Sweety.of(1)
        const value_2 = Sweety.of(3)
        const onEffect = vi.fn()
        const onRender = vi.fn()

        const { rerender } = render(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomSweetyEffect}
              onEffect={onEffect}
              value={value_1}
            />
          </React.Profiler>,
        )

        rerender(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomSweetyEffect}
              onEffect={onEffect}
              value={value_2}
            />
          </React.Profiler>,
        )

        act(() => {
          value_1.setState(10)
        })

        expect(onEffect).toHaveBeenCalledTimes(2)
        expect(onRender).toHaveBeenCalledTimes(2)
        expect(value_1).toHaveProperty("subscribers.size", 0)

        act(() => {
          value_2.setState(5)
        })
        expect(onEffect).toHaveBeenCalledTimes(3)
        expect(onEffect).toHaveBeenLastCalledWith(10)
        expect(onRender).toHaveBeenCalledTimes(3)
        expect(value_2).toHaveProperty("subscribers.size", 1)
      })

      it("should call useEffect factory when non Sweety dep changes", () => {
        const value = Sweety.of(3)
        const onEffect = vi.fn()
        const onRender = vi.fn()

        render(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomSweetyEffect}
              onEffect={onEffect}
              value={value}
            />
          </React.Profiler>,
        )

        fireEvent.click(screen.getByTestId("increment"))

        expect(onEffect).toHaveBeenCalledTimes(2)
        expect(onEffect).toHaveBeenLastCalledWith(9)
        expect(onRender).toHaveBeenCalledTimes(2)
        expect(value).toHaveProperty("subscribers.size", 1)

        act(() => {
          value.setState(4)
        })
        expect(onEffect).toHaveBeenCalledTimes(3)
        expect(onEffect).toHaveBeenLastCalledWith(12)
        expect(onRender).toHaveBeenCalledTimes(3)
        expect(value).toHaveProperty("subscribers.size", 1)
      })
    })

    describe("multiple stores", () => {
      const Component: React.FC<{
        first: Sweety<number>
        second: Sweety<number>
        onEffect: React.Dispatch<number>
      }> = hoc(({ first, second, onEffect }) => {
        const [multiplier, setMultiplier] = React.useState(2)
        useCustomSweetyEffect(() => {
          const x = (first.getState() + second.getState()) * multiplier

          onEffect(x)
        }, [first, second, multiplier])

        return (
          <button
            type="button"
            data-testid="increment"
            onClick={() => setMultiplier((x) => x + 1)}
          />
        )
      })

      it("can watch after both stores", () => {
        const first = Sweety.of(2)
        const second = Sweety.of(3)
        const onEffect = vi.fn()

        render(<Component first={first} second={second} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(10)
        expect(first).toHaveProperty("subscribers.size", 1)
        expect(second).toHaveProperty("subscribers.size", 1)

        act(() => {
          first.setState(4)
        })

        expect(onEffect).toHaveBeenCalledTimes(2)
        expect(onEffect).toHaveBeenLastCalledWith(14)

        act(() => {
          second.setState(5)
        })

        expect(onEffect).toHaveBeenCalledTimes(3)
        expect(onEffect).toHaveBeenLastCalledWith(18)
        expect(first).toHaveProperty("subscribers.size", 1)
        expect(second).toHaveProperty("subscribers.size", 1)
      })
    })

    describe("nested stores", () => {
      const Component: React.FC<{
        list: Sweety<Array<Sweety<number>>>
        onEffect: React.Dispatch<number>
      }> = hoc(({ list, onEffect }) => {
        const [multiplier, setMultiplier] = React.useState(2)

        useCustomSweetyEffect(() => {
          const x =
            list
              .getState()
              .map((item) => item.getState())
              .reduce((acc, val) => acc + val, 0) * multiplier

          onEffect(x)
        }, [list, multiplier])

        return (
          <button
            type="button"
            data-testid="increment"
            onClick={() => setMultiplier((x) => x + 1)}
          />
        )
      })

      it("can watch after all stores", () => {
        const _0 = Sweety.of(2)
        const _1 = Sweety.of(3)
        const _2 = Sweety.of(4)
        const list = Sweety.of([_0, _1])
        const onEffect = vi.fn()

        render(<Component list={list} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(10)
        expect(list).toHaveProperty("subscribers.size", 1)
        expect(_0).toHaveProperty("subscribers.size", 1)
        expect(_1).toHaveProperty("subscribers.size", 1)
        expect(_2).toHaveProperty("subscribers.size", 0)

        act(() => {
          _0.setState(4)
        })

        expect(onEffect).toHaveBeenCalledTimes(2)
        expect(onEffect).toHaveBeenLastCalledWith(14)

        act(() => {
          _1.setState(5)
        })

        expect(onEffect).toHaveBeenCalledTimes(3)
        expect(onEffect).toHaveBeenLastCalledWith(18)

        act(() => {
          list.setState((items) => [...items, _2])
        })

        expect(onEffect).toHaveBeenCalledTimes(4)
        expect(onEffect).toHaveBeenLastCalledWith(26)

        expect(_2).toHaveProperty("subscribers.size", 1)

        act(() => {
          list.setState((items) => items.slice(1))
        })

        expect(onEffect).toHaveBeenCalledTimes(5)
        expect(onEffect).toHaveBeenLastCalledWith(18)

        expect(list).toHaveProperty("subscribers.size", 1)
        expect(_0).toHaveProperty("subscribers.size", 0)
        expect(_1).toHaveProperty("subscribers.size", 1)
        expect(_2).toHaveProperty("subscribers.size", 1)
      })
    })

    describe("void dependency array", () => {
      const Component: React.FC<{
        value: Sweety<number>
        onEffect: React.Dispatch<number>
      }> = hoc(({ value, onEffect }) => {
        const [multiplier, setMultiplier] = React.useState(2)

        useCustomSweetyEffect(() => {
          const x = value.getState() * multiplier

          onEffect(x)
        })

        return (
          <button
            type="button"
            data-testid="increment"
            onClick={() => setMultiplier((x) => x + 1)}
          />
        )
      })

      it("calls effect when rerenders", () => {
        const value = Sweety.of(3)
        const onEffect = vi.fn()

        const { rerender } = render(
          <Component value={value} onEffect={onEffect} />,
        )

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(6)

        rerender(<Component value={value} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledTimes(2)
        expect(onEffect).toHaveBeenLastCalledWith(6)
        expect(value).toHaveProperty("subscribers.size", 1)
      })

      it("calls effect when inner useState changes", () => {
        const value = Sweety.of(3)
        const onEffect = vi.fn()

        render(<Component value={value} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(6)

        fireEvent.click(screen.getByTestId("increment"))

        expect(onEffect).toHaveBeenCalledTimes(2)
        expect(onEffect).toHaveBeenLastCalledWith(9)
        expect(value).toHaveProperty("subscribers.size", 1)
      })

      it("calls effect when Sweety inside an effect changes", () => {
        const value = Sweety.of(3)
        const onEffect = vi.fn()

        render(<Component value={value} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(6)

        act(() => {
          value.setState(4)
        })

        expect(onEffect).toHaveBeenCalledTimes(2)
        expect(onEffect).toHaveBeenLastCalledWith(8)
        expect(value).toHaveProperty("subscribers.size", 1)
      })
    })
  })
})
