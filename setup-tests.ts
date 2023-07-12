/* c8 ignore start */

// otherwise jest leaking into vitest type definitions
// https://github.com/testing-library/jest-dom/issues/427#issuecomment-1110985202
import "@testing-library/jest-dom/extend-expect"

import { cleanup } from "@testing-library/react"

// forces tests to fail in case of illegal usage
const console$error = vi
  .spyOn(console, "error")
  .mockImplementation((message: string) => {
    expect.fail(message)
  })
afterEach(() => {
  // should manually cleanup the react testing env since tests are running in a single thread
  cleanup()
})

afterAll(() => {
  console$error.mockRestore()
})

vi.mock("@testing-library/react", async () => {
  const actual = await vi.importActual<typeof import("@testing-library/react")>(
    "@testing-library/react",
  )

  try {
    const { renderHook } = await vi.importActual<{
      renderHook: (typeof actual)["renderHook"]
    }>("@testing-library/react-hooks")

    return { ...actual, renderHook }
  } catch {
    return actual
  }
})

/* c8 ignore stop */
