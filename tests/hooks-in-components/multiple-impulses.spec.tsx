import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { Impulse, useImpulseValue } from "../../src"

describe("multiple impulses", () => {
  const LoginForm: React.FC<{
    email: Impulse<string>
    password: Impulse<string>
    onRender: VoidFunction
  }> = ({ email: emailImpulse, password: passwordImpulse, onRender }) => {
    const email = useImpulseValue(emailImpulse)
    const password = useImpulseValue(passwordImpulse)

    return (
      <React.Profiler id="test" onRender={onRender}>
        <input
          type="email"
          data-testid="email"
          value={email}
          onChange={(event) => emailImpulse.setValue(event.target.value)}
        />
        <input
          type="password"
          data-testid="password"
          value={password}
          onChange={(event) => passwordImpulse.setValue(event.target.value)}
        />
        <button
          type="button"
          data-testid="reset"
          onClick={() => {
            emailImpulse.setValue("")
            passwordImpulse.setValue("")
          }}
        />
      </React.Profiler>
    )
  }

  it("Performs multi impulse management", () => {
    const email = Impulse.of("")
    const password = Impulse.of("")
    const onRender = vi.fn()

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
      email.setValue("admin@gmail.com")
      password.setValue("admin")
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(container).toMatchSnapshot()

    // reset
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRender).toHaveBeenCalledTimes(5)
    expect(container).toMatchSnapshot()
  })
})
