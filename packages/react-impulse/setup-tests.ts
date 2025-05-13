import "@testing-library/jest-dom/vitest"

import { untrack } from "./src"

const spy_Object$is = vi.spyOn(Object, "is")

if (process.env.TEST_TARGET === "dist/index.js") {
  vi.mock("./src", () => import("./dist/index.js"))
  // eslint-disable-next-line no-console
  console.debug("⚠️ Mocking src/index.js by dist/index.js")
} else if (process.env.TEST_TARGET === "dist/index.cjs") {
  vi.mock("./src", () => import("./dist/index.cjs"))
  // eslint-disable-next-line no-console
  console.debug("⚠️ Mocking src/index.js by dist/index.cjs")
} else if (process.env.TEST_TARGET != null) {
  throw new Error(
    `Invalid TEST_TARGET: ${process.env.TEST_TARGET}. Must be "dist/index.js" or "dist/index.cjs".`,
  )
}

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
    isSet<WeakRef<WeakKey>>(input._emitters)
  ) {
    return input._emitters
  }

  if (hasProperty(input, "$") && isSet<WeakRef<WeakKey>>(input.$)) {
    // return input.$
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
