import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { renderHook } from "@testing-library/react-hooks"

import { Sweety, watch, useSweetyEffect, useSweetyLayoutEffect } from "../src"

const identity = <T,>(value: T): T => value

describe.each([
  ["useEffect", React.useEffect, useSweetyEffect],
  ["useLayoutEffect", React.useLayoutEffect, useSweetyLayoutEffect],
])("running %s hook", (hookName, useReactEffect, useCustomSweetyEffect) => {
  describe.each([
    ["nothing", identity as typeof watch],
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
        vi.clearAllMocks()

        act(() => {
          value.setState(2)
        })

        expect(onEffect).not.toHaveBeenCalled()
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
        vi.clearAllMocks()

        act(() => {
          value.setState(2)
        })

        expect(onEffect).toHaveBeenCalledTimes(1)
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
        vi.clearAllMocks()

        rerender(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomSweetyEffect}
              onEffect={onEffect}
              value={value}
            />
          </React.Profiler>,
        )

        expect(onEffect).not.toHaveBeenCalled()
        expect(onRender).toHaveBeenCalledTimes(1)
        vi.clearAllMocks()

        act(() => {
          value.setState(3)
        })

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(6)
        expect(value).toHaveProperty("subscribers.size", 1)
        expect(onRender).toHaveBeenCalledTimes(1)
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
        vi.clearAllMocks()

        rerender(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomSweetyEffect}
              onEffect={onEffect}
              value={value_2}
            />
          </React.Profiler>,
        )

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(6)
        expect(onRender).toHaveBeenCalledTimes(1)
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

        vi.clearAllMocks()

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

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onRender).toHaveBeenCalledTimes(1)
        expect(value_1).toHaveProperty("subscribers.size", 0)
        vi.clearAllMocks()

        act(() => {
          value_2.setState(5)
        })
        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(10)
        expect(onRender).toHaveBeenCalledTimes(1)
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
        vi.clearAllMocks()

        fireEvent.click(screen.getByTestId("increment"))

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(9)
        expect(onRender).toHaveBeenCalledTimes(1)
        expect(value).toHaveProperty("subscribers.size", 1)
        vi.clearAllMocks()

        act(() => {
          value.setState(4)
        })
        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(12)
        expect(onRender).toHaveBeenCalledTimes(1)
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
        vi.clearAllMocks()

        act(() => {
          first.setState(4)
        })

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(14)
        vi.clearAllMocks()

        act(() => {
          second.setState(5)
        })

        expect(onEffect).toHaveBeenCalledTimes(1)
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
        vi.clearAllMocks()

        act(() => {
          _0.setState(4)
        })

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(14)
        vi.clearAllMocks()

        act(() => {
          _1.setState(5)
        })

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(18)
        vi.clearAllMocks()

        act(() => {
          list.setState((items) => [...items, _2])
        })

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(26)
        expect(_2).toHaveProperty("subscribers.size", 1)
        vi.clearAllMocks()

        act(() => {
          list.setState((items) => items.slice(1))
        })

        expect(onEffect).toHaveBeenCalledTimes(1)
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
        vi.clearAllMocks()

        rerender(<Component value={value} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(6)
        expect(value).toHaveProperty("subscribers.size", 1)
      })

      it("calls effect when inner useState changes", () => {
        const value = Sweety.of(3)
        const onEffect = vi.fn()

        render(<Component value={value} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(6)
        vi.clearAllMocks()

        fireEvent.click(screen.getByTestId("increment"))

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(9)
        expect(value).toHaveProperty("subscribers.size", 1)
      })

      it("calls effect when Sweety inside an effect changes", () => {
        const value = Sweety.of(3)
        const onEffect = vi.fn()

        render(<Component value={value} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(6)
        vi.clearAllMocks()

        act(() => {
          value.setState(4)
        })

        expect(onEffect).toHaveBeenCalledTimes(1)
        expect(onEffect).toHaveBeenLastCalledWith(8)
        expect(value).toHaveProperty("subscribers.size", 1)
      })
    })
  })

  it("should not trigger effect when unsubscribes", () => {
    const Counter: React.FC<{
      count: Sweety<number>
    }> = watch(({ count }) => (
      <button
        type="button"
        data-testid="count"
        onClick={() => count.setState((x) => x + 1)}
      >
        {count.getState()}
      </button>
    ))

    const Host: React.FC<{
      count: Sweety<number>
      onEffect: React.Dispatch<number>
    }> = ({ count, onEffect }) => {
      const [isVisible, setIsVisible] = React.useState(true)

      useCustomSweetyEffect(() => {
        onEffect(count.getState())
      }, [onEffect, count])

      return (
        <>
          <button
            type="button"
            data-testid="visibility"
            onClick={() => setIsVisible((x) => !x)}
          />
          {isVisible && <Counter count={count} />}
        </>
      )
    }

    const value = Sweety.of(3)
    const onEffect = vi.fn()

    render(<Host count={value} onEffect={onEffect} />)

    const count = screen.getByTestId("count")
    const visibility = screen.getByTestId("visibility")

    expect(count).toHaveTextContent("3")
    expect(onEffect).toHaveBeenCalledTimes(1)
    expect(onEffect).toHaveBeenLastCalledWith(3)
    vi.clearAllMocks()

    fireEvent.click(count)
    expect(count).toHaveTextContent("4")
    expect(onEffect).toHaveBeenCalledTimes(1)
    expect(onEffect).toHaveBeenLastCalledWith(4)
    vi.clearAllMocks()

    fireEvent.click(visibility)
    expect(count).not.toBeInTheDocument()
    expect(onEffect).not.toHaveBeenCalled()
    vi.clearAllMocks()

    fireEvent.click(visibility)
    expect(screen.getByTestId("count")).toHaveTextContent("4")
    expect(onEffect).not.toHaveBeenCalled()
  })
})

it.concurrent(
  "triggers the effect when either regular or additional dependencies change",
  () => {
    const spy = vi.fn()
    const store = Sweety.of(2)
    const { rerender } = renderHook(
      ({ left, right }) => {
        useSweetyEffect(() => {
          spy(left + right.getState())
        }, [left, right])
      },
      {
        initialProps: { left: 1, right: store },
      },
    )

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(3)
    vi.clearAllMocks()

    rerender({ left: 2, right: store })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(4)
    vi.clearAllMocks()

    rerender({ left: 2, right: store })
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      store.setState(3)
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(5)
    vi.clearAllMocks()

    act(() => {
      store.setState(3)
    })
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    rerender({ left: 2, right: Sweety.of(4) })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(6)
    vi.clearAllMocks()
  },
)

it.concurrent(
  "triggers the effect when Sweety instances are not listened in dependencies",
  () => {
    const spy = vi.fn()
    const left = Sweety.of(1)
    const right = Sweety.of(2)
    const { rerender } = renderHook(
      ({ state }) => {
        useSweetyEffect(() => {
          spy(state.left.getState() + state.right.getState())
        }, [state])
      },
      {
        initialProps: { state: { left, right } },
      },
    )

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(3)
    vi.clearAllMocks()

    rerender({ state: { left, right } })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(3)
    vi.clearAllMocks()

    act(() => {
      left.setState(2)
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(4)
    vi.clearAllMocks()

    act(() => {
      right.setState(3)
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith(5)
    vi.clearAllMocks()
  },
)
