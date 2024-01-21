import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"

import { tap } from "./src"

const spy_Object$is = vi.spyOn(Object, "is")

beforeEach((context) => {
  spy_Object$is.mockClear()

  tap((scope) => {
    context.scope = scope
  })
})

afterEach(() => {
  // should manually cleanup the react testing env since tests are running in a single thread
  cleanup()
})

vi.doMock("@testing-library/react", async () => {
  const actual = await vi.importActual("@testing-library/react")

  try {
    const { renderHook } = await vi.importActual<{
      renderHook: (typeof actual)["renderHook"]
    }>("@testing-library/react-hooks")

    return { ...actual, renderHook }
  } catch {
    return actual
  }
})

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
