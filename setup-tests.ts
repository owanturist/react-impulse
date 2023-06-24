/* c8 ignore start */

// otherwise jest leaking into vitest type definitions
// https://github.com/testing-library/jest-dom/issues/427#issuecomment-1110985202
import "@testing-library/jest-dom/extend-expect"

// forces tests to fail in case of illegal usage
const console$error = vi
  .spyOn(console, "error")
  .mockImplementation((message: string) => {
    expect.fail(message)
  })

afterAll(() => {
  console$error.mockRestore()
})

/* c8 ignore stop */

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
