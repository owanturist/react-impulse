import type { ScopeEmitter } from "./scope-emitter"

export const EMITTER_KEY = Symbol("scope")

export interface Scope {
  readonly [EMITTER_KEY]: null | ScopeEmitter
}

export const STATIC_SCOPE: Scope = {
  [EMITTER_KEY]: null,
}

let currentScope = STATIC_SCOPE

export function injectScope<TResult>(
  execute: (scope: Scope) => TResult,
  scope: Scope,
): TResult {
  const prevScope = currentScope

  currentScope = scope
  const result = execute(scope)
  currentScope = prevScope

  return result
}

export function extractScope(): Scope {
  return currentScope
}
