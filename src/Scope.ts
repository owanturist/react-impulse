import type { ScopeEmitter } from "./ScopeEmitter"
import type { Func } from "./utils"

export const EMITTER_KEY = Symbol("scope")

export interface Scope {
  readonly [EMITTER_KEY]: null | ScopeEmitter
  readonly version?: number
}

export const STATIC_SCOPE: Scope = {
  [EMITTER_KEY]: null,
}

let currentScope = STATIC_SCOPE

export function injectScope(execute: Func<[Scope]>, scope: Scope): void {
  const prevScope = currentScope

  currentScope = scope
  execute(scope)
  currentScope = prevScope
}

export function extractScope(): Scope {
  return currentScope
}
