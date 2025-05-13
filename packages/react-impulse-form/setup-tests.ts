import "@testing-library/jest-dom/vitest"
import { untrack } from "react-impulse"

const spy_Object$is = vi.spyOn(Object, "is")

if (process.env.TEST_TARGET === "dist/index.js") {
  vi.mock("./src", () => import("./dist/index.js"))
} else if (process.env.TEST_TARGET === "dist/index.cjs") {
  vi.mock("./src", () => import("./dist/index.cjs"))
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
