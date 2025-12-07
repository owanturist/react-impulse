import "@testing-library/jest-dom/vitest"

import { untracked } from "./src"

const spy__Object_is = vi.spyOn(Object, "is")

beforeEach((context) => {
  spy__Object_is.mockClear()

  context.scope = untracked((scope) => scope)
})

afterAll(() => {
  vi.useRealTimers()
})

function isSet<T>(anything: unknown): anything is Set<T> {
  return anything instanceof Set
}

function hasProperty<TKey extends PropertyKey>(
  input: unknown,
  key: TKey,
): input is Record<TKey, unknown> {
  return typeof input === "object" && input != null && key in input
}

function getEmitters(input: unknown): null | Set<WeakRef<WeakKey>> {
  if (hasProperty(input, "_emitters") && isSet<WeakRef<WeakKey>>(input._emitters)) {
    return input._emitters
  }

  if (hasProperty(input, "$") && isSet<WeakRef<WeakKey>>(input.$)) {
    return input.$
  }

  return null
}

expect.extend({
  toHaveEmittersSize(received: unknown, size: number) {
    const emitters = getEmitters(received)

    if (emitters == null) {
      return {
        pass: false,
        message: () => `expected ${this.utils.printReceived(received)} to be a Signal`,
      }
    }

    const activeEmitters = [...emitters].map((ref) => ref.deref()).filter((value) => value != null)

    return {
      pass: activeEmitters.length === size,
      message: () =>
        [
          "expected",
          this.utils.printReceived(activeEmitters.length),
          "to be",
          this.utils.printExpected(size),
        ].join(" "),
      actual: activeEmitters.length,
      expected: size,
    }
  },
})

export { hasProperty }
