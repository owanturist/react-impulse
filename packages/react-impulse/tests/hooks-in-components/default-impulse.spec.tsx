import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { Impulse, useScoped } from "../../src"

describe("default impulse", () => {
  it("uses local default Impulse when nullable", () => {
    const SearchBar: React.FC<{
      value?: Impulse<string>
    }> = ({ value: valueImpulse }) => {
      const [defaultValueImpulse] = React.useState(Impulse("search for me"))

      const impulse = valueImpulse ?? defaultValueImpulse
      const value = useScoped(impulse)

      return (
        <input
          role="search"
          value={value}
          onChange={(event) => impulse.setValue(event.target.value)}
        />
      )
    }

    const { rerender, unmount } = render(<SearchBar />)

    const input = screen.getByRole("search")

    expect(input).toHaveValue("search for me")

    fireEvent.change(input, { target: { value: "now" } })
    expect(input).toHaveValue("now")

    const val = Impulse("new")

    rerender(<SearchBar value={val} />)
    expect(input).toHaveValue("new")

    fireEvent.change(input, { target: { value: "what a hell" } })
    expect(input).toHaveValue("what a hell")

    act(() => {
      val.setValue("no way")
    })
    expect(input).toHaveValue("no way")

    rerender(<SearchBar />)
    expect(input).toHaveValue("now")

    act(() => {
      val.setValue("but now")
    })
    expect(input).toHaveValue("now")

    unmount()
    render(<SearchBar value={val} />)
    expect(screen.getByRole("search")).toHaveValue("but now")
  })
})
