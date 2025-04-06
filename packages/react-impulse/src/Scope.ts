import { ScopeEmitter } from "./ScopeEmitter"
import type { Func } from "./utils"

export const EMITTER_KEY = Symbol("scope")

export interface Scope {
  readonly [EMITTER_KEY]: ScopeEmitter
  readonly version?: number
}

export function bar(): Scope {
  return {
    [EMITTER_KEY]: ScopeEmitter._init(),
  }
}

export function foo<TResult>(execute: Func<[Scope], TResult>): TResult {
  const scope = bar()

  const result = ScopeEmitter._schedule(() => execute(scope))

  scope[EMITTER_KEY]._flush()

  return result
}

let currentScope: null | Scope = null

export function injectScope<TResult>(
  execute: Func<[Scope], TResult>,
  scope: Scope,
): TResult {
  const prevScope = currentScope

  currentScope = scope
  const result = execute(scope)
  currentScope = prevScope

  return result
}

export function extractScope<TResult>(
  execute: Func<[Scope], TResult>,
): TResult {
  if (currentScope) {
    return execute(currentScope)
  }

  return foo(execute)
}
