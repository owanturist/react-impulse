/* c8 ignore start */

// otherwise jest leaking into vitest type definitions
// https://github.com/testing-library/jest-dom/issues/427#issuecomment-1110985202
import "@testing-library/jest-dom/extend-expect"
import { cleanup } from "@testing-library/react"

// import { Impulse } from "./src"

// forces tests to fail in case of illegal usage
const console$error = vi
  .spyOn(console, "error")
  .mockImplementation((message: string) => {
    expect.fail(message)
  })

const spy_Object$is = vi.spyOn(Object, "is")

beforeEach(() => {
  spy_Object$is.mockClear()
})

afterEach(() => {
  // should manually cleanup the react testing env since tests are running in a single thread
  cleanup()
})

afterAll(() => {
  console$error.mockRestore()
})

vi.mock("@testing-library/react", async () => {
  const actual = await vi.importActual<typeof import("@testing-library/react")>(
    "@testing-library/react",
  )

  try {
    const { renderHook } = await vi.importActual<{
      renderHook: (typeof actual)["renderHook"]
    }>("@testing-library/react-hooks")

    return { ...actual, renderHook }
  } catch {
    return actual
  }
})

/* c8 ignore stop */

const isSet = (anything: unknown): anything is Set<unknown> => {
  return anything instanceof Set
}

const getImpulseEmitters = (input: unknown): null | Set<unknown> => {
  if (input == null || typeof input !== "object") {
    return null
  }

  if ("emitters" in input && isSet(input.emitters)) {
    return input.emitters
  }

  if ("$" in input && isSet(input.$)) {
    return input.$
  }

  return null
}

expect.extend({
  toHaveEmittersSize(received: unknown, size: number) {
    const emitters = getImpulseEmitters(received)

    if (emitters == null) {
      return {
        pass: false,
        message: () =>
          `expected ${this.utils.printReceived(received)} to be an Impulse`,
      }
    }

    return {
      pass: emitters.size === size,
      message: () => {
        return [
          "expected",
          this.utils.printReceived(emitters.size),
          "to be",
          this.utils.printExpected(size),
        ].join(" ")
      },
      actual: emitters.size,
      expected: size,
    }
  },
})
