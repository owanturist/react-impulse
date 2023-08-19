/* c8 ignore start */

import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"

// forces tests to fail in case of illegal usage
const spy_console$error = vi
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
  spy_console$error.mockRestore()
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

  if ("_emitters" in input && isSet(input._emitters)) {
    return input._emitters
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
