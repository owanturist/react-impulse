export { type Scope, EMITTER_KEY, STATIC_SCOPE, injectScope, extractScope }

import type { ScopeEmitter } from "./ScopeEmitter"
import type { Func } from "./utils"

const EMITTER_KEY = Symbol("scope")

interface Scope {
  readonly [EMITTER_KEY]: null | ScopeEmitter
  readonly version?: number
}

const STATIC_SCOPE: Scope = {
  [EMITTER_KEY]: null,
}

let currentScope = STATIC_SCOPE

function injectScope<TArgs extends ReadonlyArray<unknown>, TResult>(
  scope: Scope,
  execute: Func<TArgs, TResult>,
  ...args: TArgs
): TResult {
  const prevScope = currentScope

  currentScope = scope
  const result = execute(...args)
  currentScope = prevScope

  return result
}

function extractScope(): Scope {
  return currentScope
}
