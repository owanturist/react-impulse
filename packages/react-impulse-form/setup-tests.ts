import "@testing-library/jest-dom/vitest"
import { tap } from "react-impulse"

const spy_Object$is = vi.spyOn(Object, "is")

beforeEach((context) => {
  spy_Object$is.mockClear()

  tap((scope) => {
    context.scope = scope
  })
})

afterAll(() => {
  vi.useRealTimers()
})
