/* c8 ignore start */

// otherwise jest leaking into vitest type definitions
// https://github.com/testing-library/jest-dom/issues/427#issuecomment-1110985202
import "@testing-library/jest-dom/extend-expect"

import { DUMMY_SCOPE } from "./src/Scope"

// forces tests to fail in case of illegal usage
const console$error = vi
  .spyOn(console, "error")
  .mockImplementation((message: string) => {
    expect.fail(message)
  })

afterAll(() => {
  console$error.mockRestore()
})

beforeEach((context) => {
  context.scope = DUMMY_SCOPE
})

/* c8 ignore stop */
