import "@testing-library/jest-dom/vitest"
import { untrack } from "react-impulse"

const spy__object_is = vi.spyOn(Object, "is")

beforeEach((context) => {
  spy__object_is.mockClear()

  context.scope = untrack((scope) => scope)
})

afterAll(() => {
  vi.useRealTimers()
})
