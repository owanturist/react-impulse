import { DUMMY_SCOPE, Scope } from "./Scope"

export const tap = (execute: (scope: Scope) => void): void => {
  execute(DUMMY_SCOPE)
}
