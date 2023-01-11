import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { renderHook } from "@testing-library/react-hooks"

import {
  Impulse,
  watch,
  useImpulseEffect,
  useImpulseLayoutEffect,
} from "../src"

const identity = <T,>(value: T): T => value

describe.each([
  ["useEffect", React.useEffect, useImpulseEffect],
  ["useLayoutEffect", React.useLayoutEffect, useImpulseLayoutEffect],
])("running %s hook", (hookName, useReactEffect, useCustomImpulseEffect) => {
  describe.each([
    ["nothing", identity as typeof watch],
    ["watch", watch],
  ])("using %s as hoc", (_, hoc) => {
    describe("single impulse", () => {
      const Component: React.FC<{
        value: Impulse<number>
        useEffect: typeof React.useEffect
        onEffect: React.Dispatch<number>
      }> = hoc(({ onEffect, value, useEffect }) => {
        const [multiplier, setMultiplier] = React.useState(2)

        useEffect(() => {
          const x = value.getValue() * multiplier

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
        const value = Impulse.of(3)
        const onEffect = vi.fn()

        render(
          <Component
            onEffect={onEffect}
            useEffect={useReactEffect}
            value={value}
          />,
        )

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(6)
        vi.clearAllMocks()

        act(() => {
          value.setValue(2)
        })

        expect(onEffect).not.toHaveBeenCalled()
      })

      it(`can watch inside Impulse ${hookName}`, () => {
        const value = Impulse.of(3)
        const onEffect = vi.fn()

        render(
          <Component
            onEffect={onEffect}
            useEffect={useCustomImpulseEffect}
            value={value}
          />,
        )

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(6)
        vi.clearAllMocks()

        act(() => {
          value.setValue(2)
        })

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(4)
      })

      it("does not call useEffect factory when deps not changed", () => {
        const value = Impulse.of(1)
        const onEffect = vi.fn()
        const onRender = vi.fn()

        const { rerender } = render(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomImpulseEffect}
              onEffect={onEffect}
              value={value}
            />
          </React.Profiler>,
        )

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(2)
        expect(onRender).toHaveBeenCalledOnce()
        vi.clearAllMocks()

        rerender(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomImpulseEffect}
              onEffect={onEffect}
              value={value}
            />
          </React.Profiler>,
        )

        expect(onEffect).not.toHaveBeenCalled()
        expect(onRender).toHaveBeenCalledOnce()
        vi.clearAllMocks()

        act(() => {
          value.setValue(3)
        })

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(6)
        expect(value).toHaveProperty("subscribers.size", 1)
        expect(onRender).toHaveBeenCalledOnce()
      })

      it("should call useEffect factory when dep Impulse changes", () => {
        const value_1 = Impulse.of(1)
        const value_2 = Impulse.of(3)
        const onEffect = vi.fn()
        const onRender = vi.fn()

        const { rerender } = render(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomImpulseEffect}
              onEffect={onEffect}
              value={value_1}
            />
          </React.Profiler>,
        )
        vi.clearAllMocks()

        rerender(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomImpulseEffect}
              onEffect={onEffect}
              value={value_2}
            />
          </React.Profiler>,
        )

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(6)
        expect(onRender).toHaveBeenCalledOnce()
      })

      it("should unsubscribe Impulse from useEffect when swapped", () => {
        const value_1 = Impulse.of(1)
        const value_2 = Impulse.of(3)
        const onEffect = vi.fn()
        const onRender = vi.fn()

        const { rerender } = render(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomImpulseEffect}
              onEffect={onEffect}
              value={value_1}
            />
          </React.Profiler>,
        )

        vi.clearAllMocks()

        rerender(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomImpulseEffect}
              onEffect={onEffect}
              value={value_2}
            />
          </React.Profiler>,
        )

        act(() => {
          value_1.setValue(10)
        })

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onRender).toHaveBeenCalledOnce()
        expect(value_1).toHaveProperty("subscribers.size", 0)
        vi.clearAllMocks()

        act(() => {
          value_2.setValue(5)
        })
        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(10)
        expect(onRender).toHaveBeenCalledOnce()
        expect(value_2).toHaveProperty("subscribers.size", 1)
      })

      it("should call useEffect factory when non Impulse dep changes", () => {
        const value = Impulse.of(3)
        const onEffect = vi.fn()
        const onRender = vi.fn()

        render(
          <React.Profiler id="test" onRender={onRender}>
            <Component
              useEffect={useCustomImpulseEffect}
              onEffect={onEffect}
              value={value}
            />
          </React.Profiler>,
        )
        vi.clearAllMocks()

        fireEvent.click(screen.getByTestId("increment"))

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(9)
        expect(onRender).toHaveBeenCalledOnce()
        expect(value).toHaveProperty("subscribers.size", 1)
        vi.clearAllMocks()

        act(() => {
          value.setValue(4)
        })
        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(12)
        expect(onRender).toHaveBeenCalledOnce()
        expect(value).toHaveProperty("subscribers.size", 1)
      })
    })

    describe("multiple impulses", () => {
      const Component: React.FC<{
        first: Impulse<number>
        second: Impulse<number>
        onEffect: React.Dispatch<number>
      }> = hoc(({ first, second, onEffect }) => {
        const [multiplier, setMultiplier] = React.useState(2)
        useCustomImpulseEffect(() => {
          const x = (first.getValue() + second.getValue()) * multiplier

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

      it("can watch after both impulses", () => {
        const first = Impulse.of(2)
        const second = Impulse.of(3)
        const onEffect = vi.fn()

        render(<Component first={first} second={second} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(10)
        expect(first).toHaveProperty("subscribers.size", 1)
        expect(second).toHaveProperty("subscribers.size", 1)
        vi.clearAllMocks()

        act(() => {
          first.setValue(4)
        })

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(14)
        vi.clearAllMocks()

        act(() => {
          second.setValue(5)
        })

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(18)
        expect(first).toHaveProperty("subscribers.size", 1)
        expect(second).toHaveProperty("subscribers.size", 1)
      })
    })

    describe("nested impulses", () => {
      const Component: React.FC<{
        list: Impulse<Array<Impulse<number>>>
        onEffect: React.Dispatch<number>
      }> = hoc(({ list, onEffect }) => {
        const [multiplier, setMultiplier] = React.useState(2)

        useCustomImpulseEffect(() => {
          const x =
            list
              .getValue()
              .map((item) => item.getValue())
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

      it("can watch after all impulses", () => {
        const _0 = Impulse.of(2)
        const _1 = Impulse.of(3)
        const _2 = Impulse.of(4)
        const list = Impulse.of([_0, _1])
        const onEffect = vi.fn()

        render(<Component list={list} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(10)
        expect(list).toHaveProperty("subscribers.size", 1)
        expect(_0).toHaveProperty("subscribers.size", 1)
        expect(_1).toHaveProperty("subscribers.size", 1)
        expect(_2).toHaveProperty("subscribers.size", 0)
        vi.clearAllMocks()

        act(() => {
          _0.setValue(4)
        })

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(14)
        vi.clearAllMocks()

        act(() => {
          _1.setValue(5)
        })

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(18)
        vi.clearAllMocks()

        act(() => {
          list.setValue((items) => [...items, _2])
        })

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(26)
        expect(_2).toHaveProperty("subscribers.size", 1)
        vi.clearAllMocks()

        act(() => {
          list.setValue((items) => items.slice(1))
        })

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(18)
        expect(list).toHaveProperty("subscribers.size", 1)
        expect(_0).toHaveProperty("subscribers.size", 0)
        expect(_1).toHaveProperty("subscribers.size", 1)
        expect(_2).toHaveProperty("subscribers.size", 1)
      })
    })

    describe("void dependency array", () => {
      const Component: React.FC<{
        value: Impulse<number>
        onEffect: React.Dispatch<number>
      }> = hoc(({ value, onEffect }) => {
        const [multiplier, setMultiplier] = React.useState(2)

        useCustomImpulseEffect(() => {
          const x = value.getValue() * multiplier

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
        const value = Impulse.of(3)
        const onEffect = vi.fn()

        const { rerender } = render(
          <Component value={value} onEffect={onEffect} />,
        )

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(6)
        vi.clearAllMocks()

        rerender(<Component value={value} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(6)
        expect(value).toHaveProperty("subscribers.size", 1)
      })

      it("calls effect when inner useState changes", () => {
        const value = Impulse.of(3)
        const onEffect = vi.fn()

        render(<Component value={value} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(6)
        vi.clearAllMocks()

        fireEvent.click(screen.getByTestId("increment"))

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(9)
        expect(value).toHaveProperty("subscribers.size", 1)
      })

      it("calls effect when Impulse inside an effect changes", () => {
        const value = Impulse.of(3)
        const onEffect = vi.fn()

        render(<Component value={value} onEffect={onEffect} />)

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(6)
        vi.clearAllMocks()

        act(() => {
          value.setValue(4)
        })

        expect(onEffect).toHaveBeenCalledOnce()
        expect(onEffect).toHaveBeenLastCalledWith(8)
        expect(value).toHaveProperty("subscribers.size", 1)
      })
    })
  })

  it("should not trigger effect when unsubscribes", () => {
    const Counter: React.FC<{
      count: Impulse<number>
    }> = watch(({ count }) => (
      <button
        type="button"
        data-testid="count"
        onClick={() => count.setValue((x) => x + 1)}
      >
        {count.getValue()}
      </button>
    ))

    const Host: React.FC<{
      count: Impulse<number>
      onEffect: React.Dispatch<number>
    }> = ({ count, onEffect }) => {
      const [isVisible, setIsVisible] = React.useState(true)

      useCustomImpulseEffect(() => {
        onEffect(count.getValue())
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

    const value = Impulse.of(3)
    const onEffect = vi.fn()

    render(<Host count={value} onEffect={onEffect} />)

    const count = screen.getByTestId("count")
    const visibility = screen.getByTestId("visibility")

    expect(count).toHaveTextContent("3")
    expect(onEffect).toHaveBeenCalledOnce()
    expect(onEffect).toHaveBeenLastCalledWith(3)
    vi.clearAllMocks()

    fireEvent.click(count)
    expect(count).toHaveTextContent("4")
    expect(onEffect).toHaveBeenCalledOnce()
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
    const impulse = Impulse.of(2)
    const { rerender } = renderHook(
      ({ left, right }) => {
        useImpulseEffect(() => {
          spy(left + right.getValue())
        }, [left, right])
      },
      {
        initialProps: { left: 1, right: impulse },
      },
    )

    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(3)
    vi.clearAllMocks()

    rerender({ left: 2, right: impulse })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(4)
    vi.clearAllMocks()

    rerender({ left: 2, right: impulse })
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      impulse.setValue(3)
    })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(5)
    vi.clearAllMocks()

    act(() => {
      impulse.setValue(3)
    })
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    rerender({ left: 2, right: Impulse.of(4) })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(6)
    vi.clearAllMocks()
  },
)

it.concurrent(
  "triggers the effect when Impulses are not listened in dependencies",
  () => {
    const spy = vi.fn()
    const left = Impulse.of(1)
    const right = Impulse.of(2)
    const { rerender } = renderHook(
      ({ state }) => {
        useImpulseEffect(() => {
          spy(state.left.getValue() + state.right.getValue())
        }, [state])
      },
      {
        initialProps: { state: { left, right } },
      },
    )

    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(3)
    vi.clearAllMocks()

    rerender({ state: { left, right } })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(3)
    vi.clearAllMocks()

    act(() => {
      left.setValue(2)
    })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(4)
    vi.clearAllMocks()

    act(() => {
      right.setValue(3)
    })
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenLastCalledWith(5)
    vi.clearAllMocks()
  },
)
