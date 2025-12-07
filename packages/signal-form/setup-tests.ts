import "@testing-library/jest-dom/vitest"
import { untracked } from "@owanturist/signal"

const spy__object_is = vi.spyOn(Object, "is")

beforeEach((context) => {
  spy__object_is.mockClear()

  context.monitor = untracked((monitor) => monitor)
})

afterAll(() => {
  vi.useRealTimers()
})
