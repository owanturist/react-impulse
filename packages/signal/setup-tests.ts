import { toHaveEmittersSize } from "~/tools/testing/to-have-emitters-size"

import { untracked } from "./src"

const spy__Object_is = vi.spyOn(Object, "is")

beforeEach((context) => {
  spy__Object_is.mockClear()

  context.monitor = untracked((monitor) => monitor)
})

afterAll(() => {
  vi.useRealTimers()
})

expect.extend({
  toHaveEmittersSize(received: unknown, size: number) {
    return toHaveEmittersSize(this.utils, received, size)
  },
})
