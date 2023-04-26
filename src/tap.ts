import { STATIC_SCOPE, Scope } from "./Scope"

export function tap(execute: (scope: Scope) => void): void {
  execute(STATIC_SCOPE)
}
