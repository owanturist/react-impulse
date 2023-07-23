/* c8 ignore start */

// otherwise jest leaking into vitest type definitions
// https://github.com/testing-library/jest-dom/issues/427#issuecomment-1110985202
import "@testing-library/jest-dom/extend-expect"
import { cleanup } from "@testing-library/react"

import { Impulse } from "./src"

// forces tests to fail in case of illegal usage
const console$error = vi
  .spyOn(console, "error")
  .mockImplementation((message: string) => {
    expect.fail(message)
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

expect.extend({
  toHaveEmittersSize(received: unknown, size: number) {
    if (!(received instanceof Impulse)) {
      return {
        pass: false,
        message: () =>
          `expected ${this.utils.printReceived(received)} to be an Impulse`,
      }
    }

    // @ts-expect-error emitters field is mangled to "$" during build, see ./tsup.config
    const emitters = received["emitters"] ?? received["$"] // eslint-disable-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/dot-notation

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
