import { Signal, effect } from "../src"

describe("ImpulseForm.reset() does not run subscribers #969", () => {
  it("runs the effect listeners for every derived write", ({ monitor }) => {
    const spy = vi.fn()
    const source1 = Signal(1)
    const source2 = Signal<string>()
    const derived = Signal((monitor) => source2.read(monitor) ?? source1.read(monitor) > 0)

    effect((monitor) => {
      const output = derived.read(monitor)

      spy(output)

      if (output === false) {
        source2.write("error")
      }
    })

    // initial run
    expect(spy).toHaveBeenCalledExactlyOnceWith(true)
    expect(derived.read(monitor)).toBe(true)
    spy.mockClear()

    // cause the source_2 write
    source1.write(-1)
    expect(spy).toHaveBeenCalledTimes(2)
    // source_1 write causes the listener run
    expect(spy).toHaveBeenNthCalledWith(1, false)
    // the source_2 inside the listener causes the listener run again
    expect(spy).toHaveBeenNthCalledWith(2, "error")
    expect(derived.read(monitor)).toBe("error")
    spy.mockClear()

    // source_1 is not relevant to the current derived value, so it does not cause the listener run
    source1.write(1)
    expect(spy).not.toHaveBeenCalled()
    expect(derived.read(monitor)).toBe("error")

    // enable the source_1 to derive the derived value again
    source2.write(undefined)
    expect(spy).toHaveBeenCalledExactlyOnceWith(true)
    expect(derived.read(monitor)).toBe(true)
  })
})
