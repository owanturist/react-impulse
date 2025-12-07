import { act, fireEvent, render, renderHook, screen } from "@testing-library/react"
import React from "react"

import { Impulse, effect, useScope } from "../src"

describe.each([
  ["React.useEffect", React.useEffect],
  ["React.useLayoutEffect", React.useLayoutEffect],
])("running %s hook", (_, useEffect) => {
  describe("single impulse", () => {
    const Component: React.FC<{
      value: Impulse<number>
      useEffect: typeof React.useEffect
      onEffect: React.Dispatch<number>
    }> = ({ onEffect, value, useEffect }) => {
      const [multiplier, setMultiplier] = React.useState(2)

      useEffect(
        () =>
          effect((scope) => {
            const x = value.read(scope) * multiplier

            onEffect(x)
          }),
        [value, multiplier, onEffect],
      )

      return (
        <button type="button" data-testid="increment" onClick={() => setMultiplier((x) => x + 1)} />
      )
    }

    it("runs an effect when Impulse-dependency updates", () => {
      const value = Impulse(3)
      const onEffect = vi.fn()

      render(<Component onEffect={onEffect} useEffect={useEffect} value={value} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      vi.clearAllMocks()

      act(() => {
        value.update(2)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(4)
    })

    it("does not call useEffect factory when deps not changed", () => {
      const value = Impulse(1)
      const onEffect = vi.fn()
      const onRender = vi.fn()

      const { rerender } = render(
        <React.Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value} />
        </React.Profiler>,
      )

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(2)
      expect(onRender).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      rerender(
        <React.Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value} />
        </React.Profiler>,
      )

      expect(onEffect).not.toHaveBeenCalled()
      expect(onRender).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      act(() => {
        value.update(3)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      expect(value).toHaveEmittersSize(1)
      expect(onRender).not.toHaveBeenCalled()
    })

    it("should call useEffect factory when dep Impulse changes", () => {
      const value1 = Impulse(1)
      const value2 = Impulse(3)
      const onEffect = vi.fn()
      const onRender = vi.fn()

      const { rerender } = render(
        <React.Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value1} />
        </React.Profiler>,
      )
      vi.clearAllMocks()

      rerender(
        <React.Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value2} />
        </React.Profiler>,
      )

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      expect(onRender).toHaveBeenCalledOnce()
    })

    it("should unsubscribe Impulse from useEffect when swapped", () => {
      const value1 = Impulse(1)
      const value2 = Impulse(3)
      const onEffect = vi.fn()
      const onRender = vi.fn()

      const { rerender } = render(
        <React.Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value1} />
        </React.Profiler>,
      )
      expect(value1).toHaveEmittersSize(1)
      expect(value2).toHaveEmittersSize(0)

      vi.clearAllMocks()

      rerender(
        <React.Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value2} />
        </React.Profiler>,
      )
      expect(value1).toHaveEmittersSize(0)
      expect(value2).toHaveEmittersSize(1)

      expect(onEffect).toHaveBeenCalledOnce()
      expect(onRender).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      act(() => {
        value1.update(10)
      })

      expect(onEffect).not.toHaveBeenCalled()
      expect(onRender).not.toHaveBeenCalled()
      vi.clearAllMocks()

      act(() => {
        value2.update(5)
      })
      expect(onEffect).toHaveBeenCalledExactlyOnceWith(10)
      expect(onRender).not.toHaveBeenCalled()
      expect(value1).toHaveEmittersSize(0)
      expect(value2).toHaveEmittersSize(1)
    })

    it("should call useEffect factory when non Impulse dep changes", () => {
      const value = Impulse(3)
      const onEffect = vi.fn()
      const onRender = vi.fn()

      render(
        <React.Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value} />
        </React.Profiler>,
      )
      vi.clearAllMocks()

      fireEvent.click(screen.getByTestId("increment"))

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(9)
      expect(onRender).toHaveBeenCalledOnce()
      expect(value).toHaveEmittersSize(1)
      vi.clearAllMocks()

      act(() => {
        value.update(4)
      })
      expect(onEffect).toHaveBeenCalledExactlyOnceWith(12)
      expect(onRender).not.toHaveBeenCalled()
      expect(value).toHaveEmittersSize(1)
    })
  })

  describe("multiple impulses", () => {
    const Component: React.FC<{
      first: Impulse<number>
      second: Impulse<number>
      onEffect: React.Dispatch<number>
    }> = ({ first, second, onEffect }) => {
      const [multiplier, setMultiplier] = React.useState(2)

      useEffect(
        () =>
          effect((scope) => {
            const x = (first.read(scope) + second.read(scope)) * multiplier

            onEffect(x)
          }),
        [first, second, multiplier, onEffect],
      )

      return (
        <button type="button" data-testid="increment" onClick={() => setMultiplier((x) => x + 1)} />
      )
    }

    it("can watch after both impulses", () => {
      const first = Impulse(2)
      const second = Impulse(3)
      const onEffect = vi.fn()

      render(<Component first={first} second={second} onEffect={onEffect} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(10)
      expect(first).toHaveEmittersSize(1)
      expect(second).toHaveEmittersSize(1)
      vi.clearAllMocks()

      act(() => {
        first.update(4)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(14)
      vi.clearAllMocks()

      act(() => {
        second.update(5)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(18)
      expect(first).toHaveEmittersSize(1)
      expect(second).toHaveEmittersSize(1)
    })
  })

  describe("nested impulses", () => {
    const Component: React.FC<{
      list: Impulse<Array<Impulse<number>>>
      onEffect: React.Dispatch<number>
    }> = ({ list, onEffect }) => {
      const [multiplier, setMultiplier] = React.useState(2)

      useEffect(
        () =>
          effect((scope) => {
            const x =
              list
                .read(scope)
                .map((item) => item.read(scope))
                .reduce((acc, val) => acc + val, 0) * multiplier

            onEffect(x)
          }),
        [list, multiplier, onEffect],
      )

      return (
        <button type="button" data-testid="increment" onClick={() => setMultiplier((x) => x + 1)} />
      )
    }

    it("can watch after all impulses", () => {
      const _0 = Impulse(2)
      const _1 = Impulse(3)
      const _2 = Impulse(4)
      const list = Impulse([_0, _1])
      const onEffect = vi.fn()

      render(<Component list={list} onEffect={onEffect} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(10)
      expect(list).toHaveEmittersSize(1)
      expect(_0).toHaveEmittersSize(1)
      expect(_1).toHaveEmittersSize(1)
      expect(_2).toHaveEmittersSize(0)
      vi.clearAllMocks()

      act(() => {
        _0.update(4)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(14)
      vi.clearAllMocks()

      act(() => {
        _1.update(5)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(18)
      vi.clearAllMocks()

      act(() => {
        list.update((items) => [...items, _2])
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(26)
      expect(_2).toHaveEmittersSize(1)
      vi.clearAllMocks()

      act(() => {
        list.update((items) => items.slice(1))
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(18)
      expect(list).toHaveEmittersSize(1)
      expect(_0).toHaveEmittersSize(0)
      expect(_1).toHaveEmittersSize(1)
      expect(_2).toHaveEmittersSize(1)
    })
  })

  describe("void dependency array", () => {
    const Component: React.FC<{
      value: Impulse<number>
      onEffect: React.Dispatch<number>
    }> = ({ value, onEffect }) => {
      const [multiplier, setMultiplier] = React.useState(2)

      useEffect(() =>
        effect((scope) => {
          const x = value.read(scope) * multiplier

          onEffect(x)
        }),
      )

      return (
        <button type="button" data-testid="increment" onClick={() => setMultiplier((x) => x + 1)} />
      )
    }

    it("calls effect when rerenders", () => {
      const value = Impulse(3)
      const onEffect = vi.fn()

      const { rerender } = render(<Component value={value} onEffect={onEffect} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      vi.clearAllMocks()

      rerender(<Component value={value} onEffect={onEffect} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      expect(value).toHaveEmittersSize(1)
    })

    it("calls effect when inner useState changes", () => {
      const value = Impulse(3)
      const onEffect = vi.fn()

      render(<Component value={value} onEffect={onEffect} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      vi.clearAllMocks()

      fireEvent.click(screen.getByTestId("increment"))

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(9)
      expect(value).toHaveEmittersSize(1)
    })

    it("calls effect when Impulse inside an effect changes", () => {
      const value = Impulse(3)
      const onEffect = vi.fn()

      render(<Component value={value} onEffect={onEffect} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      vi.clearAllMocks()

      act(() => {
        value.update(4)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(8)
      expect(value).toHaveEmittersSize(1)
    })
  })

  it("should not trigger effect when unsubscribes", () => {
    const Counter: React.FC<{
      count: Impulse<number>
    }> = ({ count }) => {
      const scope = useScope()

      return (
        <button type="button" data-testid="count" onClick={() => count.update((x) => x + 1)}>
          {count.read(scope)}
        </button>
      )
    }

    const Host: React.FC<{
      count: Impulse<number>
      onEffect: React.Dispatch<number>
    }> = ({ count, onEffect }) => {
      const [isVisible, setIsVisible] = React.useState(true)

      useEffect(
        () =>
          effect((scope) => {
            onEffect(count.read(scope))
          }),
        [onEffect, count],
      )

      return (
        <>
          <button type="button" data-testid="visibility" onClick={() => setIsVisible((x) => !x)} />
          {isVisible && <Counter count={count} />}
        </>
      )
    }

    const value = Impulse(3)
    const onEffect = vi.fn()

    render(<Host count={value} onEffect={onEffect} />)

    const count = screen.getByTestId("count")
    const visibility = screen.getByTestId("visibility")

    expect(count).toHaveTextContent("3")
    expect(onEffect).toHaveBeenCalledExactlyOnceWith(3)
    vi.clearAllMocks()

    fireEvent.click(count)
    expect(count).toHaveTextContent("4")
    expect(onEffect).toHaveBeenCalledExactlyOnceWith(4)
    vi.clearAllMocks()

    fireEvent.click(visibility)
    expect(count).not.toBeInTheDocument()
    expect(onEffect).not.toHaveBeenCalled()
    vi.clearAllMocks()

    fireEvent.click(visibility)
    expect(screen.getByTestId("count")).toHaveTextContent("4")
    expect(onEffect).not.toHaveBeenCalled()
  })

  it("triggers the effect when either regular or additional dependencies change", () => {
    const spy = vi.fn()
    const impulse = Impulse(2)
    const { rerender } = renderHook(
      ({ left, right }) => {
        useEffect(
          () =>
            effect((scope) => {
              spy(left + right.read(scope))
            }),
          [left, right],
        )
      },
      {
        initialProps: { left: 1, right: impulse },
      },
    )

    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
    vi.clearAllMocks()

    rerender({ left: 2, right: impulse })
    expect(spy).toHaveBeenCalledExactlyOnceWith(4)
    vi.clearAllMocks()

    rerender({ left: 2, right: impulse })
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      impulse.update(3)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)
    vi.clearAllMocks()

    act(() => {
      impulse.update(3)
    })
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    rerender({ left: 2, right: Impulse(4) })
    expect(spy).toHaveBeenCalledExactlyOnceWith(6)
    vi.clearAllMocks()
  })

  it("triggers the effect when Impulses are not listened in dependencies", () => {
    const spy = vi.fn()
    const left = Impulse(1)
    const right = Impulse(2)
    const { rerender } = renderHook(
      ({ state }) => {
        useEffect(
          () =>
            effect((scope) => {
              spy(state.left.read(scope) + state.right.read(scope))
            }),
          [state],
        )
      },
      {
        initialProps: { state: { left, right } },
      },
    )

    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
    vi.clearAllMocks()

    rerender({ state: { left, right } })
    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
    vi.clearAllMocks()

    act(() => {
      left.update(2)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(4)
    vi.clearAllMocks()

    act(() => {
      right.update(3)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)
    vi.clearAllMocks()
  })

  it("calls effect cleanup function", () => {
    const cleanup = vi.fn()
    const counter = Impulse({ count: 2 })
    const { rerender, unmount } = renderHook(
      (props) => {
        useEffect(
          () =>
            effect((scope) => {
              const { count } = props.counter.read(scope)

              return () => {
                cleanup(count * props.multiplier)
              }
            }),
          [props.counter, props.multiplier],
        )
      },
      {
        initialProps: {
          counter,
          multiplier: 2,
        },
      },
    )

    expect(cleanup).not.toHaveBeenCalled()

    counter.update({ count: 3 })
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(4)
    vi.clearAllMocks()

    rerender({
      counter,
      multiplier: 3,
    })
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(6)
    vi.clearAllMocks()

    unmount()
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(9)
    vi.clearAllMocks()

    counter.update({ count: 4 })
    expect(cleanup).not.toHaveBeenCalled()
  })

  describe("when scope coming as a dependency", () => {
    it("reruns effect only for effect's consumers", () => {
      const spyRender = vi.fn()
      const spyEffect = vi.fn()
      const impulse1 = Impulse(2)
      const impulse2 = Impulse(3)

      const { rerender } = renderHook(
        ({ left, right }) => {
          const scope = useScope()
          const scopeForEffect = useScope()

          useEffect(() => {
            spyEffect(left * right.read(scopeForEffect))
          }, [scopeForEffect, left, right])

          spyRender(impulse2.read(scope))
        },
        {
          initialProps: { left: 1, right: impulse1 },
        },
      )

      expect(spyRender).toHaveBeenCalledExactlyOnceWith(3)
      expect(spyEffect).toHaveBeenCalledExactlyOnceWith(2)
      vi.clearAllMocks()

      rerender({ left: 1, right: impulse1 })
      expect(spyRender).toHaveBeenCalledExactlyOnceWith(3)
      expect(spyEffect).not.toHaveBeenCalled()
      vi.clearAllMocks()

      act(() => {
        impulse1.update(4)
      })
      expect(spyRender).toHaveBeenCalledExactlyOnceWith(3)
      expect(spyEffect).toHaveBeenCalledExactlyOnceWith(4)
      vi.clearAllMocks()

      act(() => {
        impulse2.update(5)
      })
      expect(spyRender).toHaveBeenCalledExactlyOnceWith(5)
      expect(spyEffect).not.toHaveBeenCalled()
      vi.clearAllMocks()

      rerender({ left: 2, right: impulse1 })
      expect(spyRender).toHaveBeenCalledExactlyOnceWith(5)
      expect(spyEffect).toHaveBeenCalledExactlyOnceWith(8)
    })
  })
})
