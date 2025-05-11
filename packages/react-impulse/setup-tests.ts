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

function isSet<T>(anything: unknown): anything is Set<T> {
  return anything instanceof Set
}

export function hasProperty<TKey extends PropertyKey>(
  input: unknown,
  key: TKey,
): input is Record<TKey, unknown> {
  return typeof input === "object" && input != null && key in input
}

function getImpulseEmitters(input: unknown): null | Set<WeakRef<WeakKey>> {
  if (
    hasProperty(input, "_emitters") &&
    hasProperty(input._emitters, "_refs") &&
    isSet<WeakRef<WeakKey>>(input._emitters._refs)
  ) {
    return input._emitters._refs
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
