import "@testing-library/jest-dom/vitest"
import { untrack } from "react-impulse"

const spy_Object$is = vi.spyOn(Object, "is")

beforeEach((context) => {
  spy_Object$is.mockClear()

  context.scope = untrack((scope) => scope)
})

afterAll(() => {
  vi.useRealTimers()
})
