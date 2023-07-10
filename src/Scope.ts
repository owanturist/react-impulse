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

let currentInjectedScope = STATIC_SCOPE

export function injectScope<TArgs extends ReadonlyArray<unknown>, TResult>(
  scope: Scope,
  execute: Func<TArgs, TResult>,
  ...args: TArgs
): TResult {
  const prevScope = currentInjectedScope

  currentInjectedScope = scope
  const result = execute(...args)
  currentInjectedScope = prevScope

  return result
}

export function extractScope(): Scope {
  return currentInjectedScope
}
