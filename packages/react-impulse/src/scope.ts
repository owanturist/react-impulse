import type { ScopeEmitter } from "./scope-emitter"

const EMITTER_KEY = Symbol("scope")

interface Scope {
  readonly [EMITTER_KEY]: null | ScopeEmitter
}

const STATIC_SCOPE: Scope = {
  [EMITTER_KEY]: null,
}

let currentScope = STATIC_SCOPE

export function injectScope<TResult>(
  execute: (passedScope: Scope) => TResult,
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

export { type Scope, EMITTER_KEY, STATIC_SCOPE }
