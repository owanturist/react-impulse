import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { tap } from "react-impulse"

const spy_Object$is = vi.spyOn(Object, "is")

beforeEach((context) => {
  spy_Object$is.mockClear()

  tap((scope) => {
    context.scope = scope
  })
})

afterEach(() => {
  // should manually cleanup the react testing env since tests are running in a single thread
  cleanup()
})

vi.doMock("@testing-library/react", async () => {
  const actual = await vi.importActual("@testing-library/react")

  try {
    const { renderHook } = await vi.importActual("@testing-library/react-hooks")

    return { ...actual, renderHook }
  } catch {
    return actual
  }
})
