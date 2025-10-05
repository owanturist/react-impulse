import type { ScopeEmitter } from "./scope-emitter"

export const EMITTER_KEY = Symbol("scope")

export interface Scope {
  /**
   * @hidden the emitter should not be accessible from outside.
   */
  readonly [EMITTER_KEY]: null | ScopeEmitter
  readonly version?: number
}

export const UNTRACKED_SCOPE: Scope = {
  [EMITTER_KEY]: null,
}

let currentScope = UNTRACKED_SCOPE

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
