import React from "react"
import { act, render, screen, within, fireEvent } from "@testing-library/react"

import {
  InnerStore,
  useGetInnerState,
  useSetInnerState,
  useInnerState,
  useInnerReducer,
} from "../src"

import { Counter } from "./helpers"

const useThrowAfterChanges = (
  throwAfterCount: number,
  deps: ReadonlyArray<unknown>,
): void => {
  const count = React.useRef(0)

  React.useEffect(() => {
    count.current++

    if (count.current > throwAfterCount) {
      throw new Error(
        `Changed ${count.current} times, when ${throwAfterCount} expected`,
      )
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

const getByTestIdAt = (id: string, position: number): HTMLElement => {
  return screen.getAllByTestId(id)[position]!
}

describe("Single store", () => {
  const GetterComponent: React.VFC<{
    name: string
    store: InnerStore<Counter>
    onRender: React.Dispatch<Counter>
  }> = ({ name, store, onRender }) => {
    const state = useGetInnerState(store)

    onRender(state)

    return <div data-testid={name}>{state.count}</div>
  }

  const SetterComponent: React.VFC<{
    name: string
    store: InnerStore<Counter>
    onRender: VoidFunction
  }> = ({ name, store, onRender }) => {
    const setState = useSetInnerState(store, Counter.compare)

    useThrowAfterChanges(1, [setState])
    onRender()

    return (
      <div data-testid={name}>
        <button
          type="button"
          data-testid="increment"
          onClick={() => setState(Counter.inc)}
        />

        <button
          type="button"
          data-testid="reset"
          onClick={() => setState({ count: 0 })}
        />
      </div>
    )
  }

  const SingleSetterSingleGetter: React.VFC<{
    store: InnerStore<Counter>
    onRootRender: VoidFunction
    onGetterRender: React.Dispatch<Counter>
    onSetterRender: VoidFunction
  }> = ({ store, onRootRender, onGetterRender, onSetterRender }) => {
    onRootRender()

    return (
      <div>
        <GetterComponent name="count" store={store} onRender={onGetterRender} />
        <SetterComponent
          name="controls"
          store={store}
          onRender={onSetterRender}
        />
      </div>
    )
  }

  it("Single Setter / Getter", () => {
    const store = InnerStore.of({ count: 0 })
    const onRootRender = jest.fn()
    const onGetterRender = jest.fn()
    const onSetterRender = jest.fn()

    render(
      <SingleSetterSingleGetter
        store={store}
        onRootRender={onRootRender}
        onGetterRender={onGetterRender}
        onSetterRender={onSetterRender}
      />,
    )

    // check initial state
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenNthCalledWith(1, { count: 0 })

    // increment by from the component
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(2)
    expect(onGetterRender).toHaveBeenNthCalledWith(2, { count: 1 })

    // increment from the outside
    act(() => store.setState(Counter.inc))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(3)
    expect(onGetterRender).toHaveBeenNthCalledWith(3, { count: 2 })

    // reset from the component
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(4)
    expect(onGetterRender).toHaveBeenNthCalledWith(4, { count: 0 })

    // reset second time in a row
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(4)
    expect(onGetterRender).toHaveBeenNthCalledWith(4, { count: 0 })
  })

  const MultipleSetterMultipleGetter: React.VFC<{
    store: InnerStore<Counter>
    onRootRender: VoidFunction
    onFirstGetterRender: React.Dispatch<Counter>
    onSecondGetterRender: React.Dispatch<Counter>
    onFirstSetterRender: VoidFunction
    onSecondSetterRender: VoidFunction
  }> = ({
    store,
    onRootRender,
    onFirstGetterRender,
    onSecondGetterRender,
    onFirstSetterRender,
    onSecondSetterRender,
  }) => {
    React.useEffect(() => {
      onRootRender()
    }, [onRootRender])

    return (
      <div>
        <GetterComponent
          name="count-1"
          store={store}
          onRender={onFirstGetterRender}
        />
        <GetterComponent
          name="count-2"
          store={store}
          onRender={onSecondGetterRender}
        />
        <SetterComponent
          name="controls-1"
          store={store}
          onRender={onFirstSetterRender}
        />
        <SetterComponent
          name="controls-2"
          store={store}
          onRender={onSecondSetterRender}
        />
      </div>
    )
  }

  it("Multiple Setters / Getters", () => {
    const store = InnerStore.of({ count: 0 })
    const onRootRender = jest.fn()
    const onFirstGetterRender = jest.fn()
    const onSecondGetterRender = jest.fn()
    const onFirstSetterRender = jest.fn()
    const onSecondSetterRender = jest.fn()

    render(
      <MultipleSetterMultipleGetter
        store={store}
        onRootRender={onRootRender}
        onFirstGetterRender={onFirstGetterRender}
        onSecondGetterRender={onSecondGetterRender}
        onFirstSetterRender={onFirstSetterRender}
        onSecondSetterRender={onSecondSetterRender}
      />,
    )

    // check initial state
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenNthCalledWith(1, { count: 0 })
    expect(onSecondGetterRender).toHaveBeenNthCalledWith(1, { count: 0 })

    // increment from the first component
    fireEvent.click(
      within(screen.getByTestId("controls-1")).getByTestId("increment"),
    )
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(2)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(2)
    expect(onFirstGetterRender).toHaveBeenNthCalledWith(2, { count: 1 })
    expect(onSecondGetterRender).toHaveBeenNthCalledWith(2, { count: 1 })

    // increment from the second component
    fireEvent.click(
      within(screen.getByTestId("controls-2")).getByTestId("increment"),
    )
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(3)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(3)
    expect(onFirstGetterRender).toHaveBeenNthCalledWith(3, { count: 2 })
    expect(onSecondGetterRender).toHaveBeenNthCalledWith(3, { count: 2 })

    // increment from the outside
    act(() => store.setState(Counter.inc))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(4)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(4)
    expect(onFirstGetterRender).toHaveBeenNthCalledWith(4, { count: 3 })
    expect(onSecondGetterRender).toHaveBeenNthCalledWith(4, { count: 3 })
  })
})

describe("Multiple stores", () => {
  const LoginForm: React.VFC<{
    email: InnerStore<string>
    password: InnerStore<string>
    onRender: React.Dispatch<{
      email: string
      password: string
    }>
  }> = ({ email: emailStore, password: passwordStore, onRender }) => {
    const [email, setEmail] = useInnerState(emailStore)
    const [password, setPassword] = useInnerState(passwordStore)

    useThrowAfterChanges(1, [setEmail, setPassword])
    onRender({ email, password })

    return (
      <div>
        <input
          type="email"
          data-testid="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="password"
          data-testid="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          type="button"
          data-testid="reset"
          onClick={() => {
            setEmail("")
            setPassword("")
          }}
        />
      </div>
    )
  }

  it("Performs multi store management", () => {
    const email = InnerStore.of("")
    const password = InnerStore.of("")
    const onRender = jest.fn()

    render(<LoginForm email={email} password={password} onRender={onRender} />)

    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onRender).toHaveBeenNthCalledWith(1, {
      email: "",
      password: "",
    })

    // change email
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "john-doe@gmail.com" },
    })
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(onRender).toHaveBeenNthCalledWith(2, {
      email: "john-doe@gmail.com",
      password: "",
    })

    // change password
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "qwerty" },
    })
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(onRender).toHaveBeenNthCalledWith(3, {
      email: "john-doe@gmail.com",
      password: "qwerty",
    })

    // changes from the outside
    act(() => {
      email.setState("admin@gmail.com")
      password.setState("admin")
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onRender).toHaveBeenNthCalledWith(4, {
      email: "admin@gmail.com",
      password: "admin",
    })

    // reset
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRender).toHaveBeenCalledTimes(5)
    expect(onRender).toHaveBeenNthCalledWith(5, {
      email: "",
      password: "",
    })
  })
})

describe("Nested stores", () => {
  const CounterComponent: React.VFC<{
    count: InnerStore<number>
    onRender: React.Dispatch<number>
  }> = React.memo(({ count: countStore, onRender }) => {
    const [count, setCount] = useInnerState(countStore)

    useThrowAfterChanges(1, [setCount])
    onRender(count)

    return (
      <div data-testid="counter">
        <button
          type="button"
          data-testid="increment"
          onClick={() => setCount(count + 1)}
        />
        <button
          type="button"
          data-testid="double"
          onClick={() => setCount((x) => 2 * x)}
        />
      </div>
    )
  })

  interface AppState {
    counts: ReadonlyArray<InnerStore<number>>
  }
  type AppAction = { type: "AddCounter" } | { type: "ResetCounters" }

  const App: React.VFC<{
    store: InnerStore<AppState>
    onRender: VoidFunction
    onCountRender: React.Dispatch<number>
  }> = ({ store, onRender, onCountRender }) => {
    const [state, dispatch] = useInnerReducer<AppState, AppAction>(
      store,
      (currentState, action) => {
        switch (action.type) {
          case "AddCounter": {
            return {
              ...currentState,
              counts: [...currentState.counts, InnerStore.of(0)],
            }
          }

          case "ResetCounters": {
            currentState.counts.forEach((count) => count.setState(0))

            return currentState
          }
        }
      },
    )

    useThrowAfterChanges(1, [dispatch])
    onRender()

    return (
      <div>
        <button
          type="button"
          data-testid="add-counter"
          onClick={() => dispatch({ type: "AddCounter" })}
        />
        <button
          type="button"
          data-testid="reset-counters"
          onClick={() => dispatch({ type: "ResetCounters" })}
        />
        {state.counts.map((count) => (
          <CounterComponent
            key={count.key}
            count={count}
            onRender={onCountRender}
          />
        ))}
      </div>
    )
  }

  it("Performs nested store management", () => {
    const store = InnerStore.of<AppState>({ counts: [] })
    const onRender = jest.fn()
    const onCountRender = jest.fn()

    render(
      <App store={store} onRender={onRender} onCountRender={onCountRender} />,
    )

    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCountRender).toHaveBeenCalledTimes(0)

    // add first counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(onCountRender).toHaveBeenCalledTimes(1)
    expect(onCountRender).toHaveBeenNthCalledWith(1, 0)

    // increment the first counter
    fireEvent.click(
      within(getByTestIdAt("counter", 0)).getByTestId("increment"),
    )
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(onCountRender).toHaveBeenCalledTimes(2)
    expect(onCountRender).toHaveBeenNthCalledWith(2, 1)

    // add second counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(onCountRender).toHaveBeenCalledTimes(3)
    expect(onCountRender).toHaveBeenNthCalledWith(3, 0)

    // increment and then double second counter
    fireEvent.click(
      within(getByTestIdAt("counter", 1)).getByTestId("increment"),
    )
    fireEvent.click(within(getByTestIdAt("counter", 1)).getByTestId("double"))
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(onCountRender).toHaveBeenCalledTimes(5)
    expect(onCountRender).toHaveBeenNthCalledWith(4, 1)
    expect(onCountRender).toHaveBeenNthCalledWith(5, 2)

    // add third counter from the outside
    act(() => {
      store.setState((state) => ({
        ...state,
        counts: [...state.counts, InnerStore.of(3)],
      }))
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onCountRender).toHaveBeenCalledTimes(6)
    expect(onCountRender).toHaveBeenNthCalledWith(6, 3)

    // double the third counter from the outside
    act(() => {
      store.getState().counts[2]!.setState((x) => 2 * x)
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onCountRender).toHaveBeenCalledTimes(7)
    expect(onCountRender).toHaveBeenNthCalledWith(7, 6)

    // reset
    fireEvent.click(screen.getByTestId("reset-counters"))
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onCountRender).toHaveBeenCalledTimes(10)
    expect(onCountRender).toHaveBeenNthCalledWith(8, 0)
    expect(onCountRender).toHaveBeenNthCalledWith(9, 0)
    expect(onCountRender).toHaveBeenNthCalledWith(10, 0)

    // increment all from the outside
    act(() => {
      store.getState().counts.forEach((count) => count.setState((x) => x + 1))
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onCountRender).toHaveBeenCalledTimes(13)
    expect(onCountRender).toHaveBeenNthCalledWith(11, 1)
    expect(onCountRender).toHaveBeenNthCalledWith(12, 1)
    expect(onCountRender).toHaveBeenNthCalledWith(13, 1)
  })
})
