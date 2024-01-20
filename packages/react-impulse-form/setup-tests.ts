import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { tap } from "react-impulse"

beforeEach((context) => {
  tap((scope) => {
    context.scope = scope
  })
})

afterEach(() => {
  // should manually cleanup the react testing env since tests are running in a single thread
  cleanup()
})
