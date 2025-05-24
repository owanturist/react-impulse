import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { Impulse, useScoped } from "../../src"

describe("multiple impulses", () => {
  const LoginForm: React.FC<{
    email: Impulse<string>
    password: Impulse<string>
    onRender: VoidFunction
  }> = ({ email: emailImpulse, password: passwordImpulse, onRender }) => {
    const email = useScoped((scope) => emailImpulse.getValue(scope))
    const password = useScoped(passwordImpulse)

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

  it("performs multi impulse management", () => {
    const email = Impulse("")
    const password = Impulse("")
    const onRender = vi.fn()

    const { container } = render(
      <LoginForm email={email} password={password} onRender={onRender} />,
    )

    expect(onRender).toHaveBeenCalledOnce()
    expect(container).toMatchSnapshot()
    vi.clearAllMocks()

    // change email
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "john-doe@gmail.com" },
    })
    expect(onRender).toHaveBeenCalledOnce()
    expect(container).toMatchSnapshot()
    vi.clearAllMocks()

    // change password
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "qwerty" },
    })
    expect(onRender).toHaveBeenCalledOnce()
    expect(container).toMatchSnapshot()
    vi.clearAllMocks()

    // changes from the outside
    act(() => {
      email.setValue("admin@gmail.com")
      password.setValue("admin")
    })
    expect(onRender).toHaveBeenCalledOnce()
    expect(container).toMatchSnapshot()
    vi.clearAllMocks()

    // reset
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRender).toHaveBeenCalledOnce()
    expect(container).toMatchSnapshot()
  })
})
