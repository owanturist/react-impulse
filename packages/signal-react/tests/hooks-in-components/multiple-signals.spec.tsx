import { Signal } from "@owanturist/signal"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { type FC, Profiler } from "react"

import { useComputed } from "../../src"

describe("multiple signals", () => {
  const LoginForm: FC<{
    email: Signal<string>
    password: Signal<string>
    onRender: VoidFunction
  }> = ({ email: emailSignal, password: passwordSignal, onRender }) => {
    const email = useComputed((monitor) => emailSignal.read(monitor))
    const password = useComputed(passwordSignal)

    return (
      <Profiler id="test" onRender={onRender}>
        <input
          type="email"
          data-testid="email"
          value={email}
          onChange={(event) => emailSignal.write(event.target.value)}
        />
        <input
          type="password"
          data-testid="password"
          value={password}
          onChange={(event) => passwordSignal.write(event.target.value)}
        />
        <button
          type="button"
          data-testid="reset"
          onClick={() => {
            emailSignal.write("")
            passwordSignal.write("")
          }}
        />
      </Profiler>
    )
  }

  it("performs multi signal management", () => {
    const email = Signal("")
    const password = Signal("")
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
      email.write("admin@gmail.com")
      password.write("admin")
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
