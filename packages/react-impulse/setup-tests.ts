import "@testing-library/jest-dom/vitest"

import { untrack } from "./src"

const spy_Object$is = vi.spyOn(Object, "is")

beforeEach((context) => {
  spy_Object$is.mockClear()

  context.scope = untrack((scope) => scope)
})

afterAll(() => {
  vi.useRealTimers()
})

const isSet = <T>(anything: unknown): anything is Set<T> => {
  return anything instanceof Set
}

const getImpulseEmitters = (input: unknown): null | Set<WeakRef<WeakKey>> => {
  if (input == null || typeof input !== "object") {
    return null
  }

  if ("_emitters" in input && isSet<WeakRef<WeakKey>>(input._emitters)) {
    return input._emitters
  }

  if ("$" in input && isSet<WeakRef<WeakKey>>(input.$)) {
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

    const activeEmitters = [...emitters]
      .map((ref) => ref.deref())
      .filter((value) => value != null)

    return {
      pass: activeEmitters.length === size,
      message: () => {
        return [
          "expected",
          this.utils.printReceived(activeEmitters.length),
          "to be",
          this.utils.printExpected(size),
        ].join(" ")
      },
      actual: activeEmitters.length,
      expected: size,
    }
  },
})
