import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { Impulse, useImpulse, useSweetyState } from "../../src"

describe("default stores", () => {
  it("Uses local default Sweety when nullable", () => {
    const SearchBar: React.FC<{
      value?: Impulse<string>
    }> = ({ value: valueStore }) => {
      const defaultValueStore = useImpulse("search for me")

      const store = valueStore ?? defaultValueStore
      const value = useSweetyState(store)

      return (
        <input
          role="search"
          value={value}
          onChange={(event) => store.setState(event.target.value)}
        />
      )
    }

    const { rerender, unmount } = render(<SearchBar />)

    const input = screen.getByRole("search")

    expect(input).toHaveValue("search for me")

    fireEvent.change(input, { target: { value: "now" } })
    expect(input).toHaveValue("now")

    const val = Impulse.of("new")

    rerender(<SearchBar value={val} />)
    expect(input).toHaveValue("new")

    fireEvent.change(input, { target: { value: "what a hell" } })
    expect(input).toHaveValue("what a hell")

    act(() => {
      val.setState("no way")
    })
    expect(input).toHaveValue("no way")

    rerender(<SearchBar />)
    expect(input).toHaveValue("now")

    act(() => {
      val.setState("but now")
    })
    expect(input).toHaveValue("now")

    unmount()
    render(<SearchBar value={val} />)
    expect(screen.getByRole("search")).toHaveValue("but now")
  })
})
