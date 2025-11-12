import type { ScopeEmitter } from "./scope-emitter"

export const EMITTER_KEY = Symbol("scope")

export interface Scope {
  readonly [EMITTER_KEY]: null | ScopeEmitter
}

export const STATIC_SCOPE: Scope = {
  [EMITTER_KEY]: null,
}

let currentScope = STATIC_SCOPE

export function injectScope<
  TResult,
  TArgs extends [Scope, ...ReadonlyArray<unknown>],
>(execute: (...args: TArgs) => TResult, ...args: TArgs): TResult {
  const prevScope = currentScope

  currentScope = args[0]
  const result = execute(...args)
  currentScope = prevScope

  return result
}

export function extractScope(): Scope {
  return currentScope
}
