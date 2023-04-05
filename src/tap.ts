import { STATIC_SCOPE, Scope } from "./Scope"

export const tap = (execute: (scope: Scope) => void): void => {
  execute(STATIC_SCOPE)
}
