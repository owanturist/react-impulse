import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { Sweety, useSweetyState } from "../../src"

describe("multiple stores", () => {
  const LoginForm: React.VFC<{
    email: Sweety<string>
    password: Sweety<string>
    onRender: VoidFunction
  }> = ({ email: emailStore, password: passwordStore, onRender }) => {
    const [email, setEmail] = useSweetyState(emailStore)
    const [password, setPassword] = useSweetyState(passwordStore)

    onRender()

    return (
      <>
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
      </>
    )
  }

  it("Performs multi store management", () => {
    const email = Sweety.of("")
    const password = Sweety.of("")
    const onRender = jest.fn()

    const { container } = render(
      <LoginForm email={email} password={password} onRender={onRender} />,
    )

    expect(onRender).toHaveBeenCalledTimes(1)
    expect(container).toMatchSnapshot()

    // change email
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "john-doe@gmail.com" },
    })
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(container).toMatchSnapshot()

    // change password
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "qwerty" },
    })
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(container).toMatchSnapshot()

    // changes from the outside
    act(() => {
      email.setState("admin@gmail.com")
      password.setState("admin")
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(container).toMatchSnapshot()

    // reset
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRender).toHaveBeenCalledTimes(5)
    expect(container).toMatchSnapshot()
  })
})
