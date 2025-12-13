import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { Signal, useComputed } from "../../src"

describe("default signal", () => {
  it("uses local default Signal when nullable", () => {
    const SearchBar: React.FC<{
      value?: Signal<string>
    }> = ({ value: valueSignal }) => {
      const [defaultValueSignal] = React.useState(Signal("search for me"))

      const signal = valueSignal ?? defaultValueSignal
      const value = useComputed(signal)

      return (
        <input type="search" value={value} onChange={(event) => signal.write(event.target.value)} />
      )
    }

    const { rerender, unmount } = render(<SearchBar />)

    const input = screen.getByRole("searchbox")

    expect(input).toHaveValue("search for me")

    fireEvent.change(input, { target: { value: "now" } })
    expect(input).toHaveValue("now")

    const val = Signal("new")

    rerender(<SearchBar value={val} />)
    expect(input).toHaveValue("new")

    fireEvent.change(input, { target: { value: "what a hell" } })
    expect(input).toHaveValue("what a hell")

    act(() => {
      val.write("no way")
    })
    expect(input).toHaveValue("no way")

    rerender(<SearchBar />)
    expect(input).toHaveValue("now")

    act(() => {
      val.write("but now")
    })
    expect(input).toHaveValue("now")

    unmount()
    render(<SearchBar value={val} />)
    expect(screen.getByRole("searchbox")).toHaveValue("but now")
  })
})
