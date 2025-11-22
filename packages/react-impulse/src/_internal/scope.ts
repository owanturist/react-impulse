import type { ScopeEmitter } from "./scope-emitter"

const SCOPE_KEY = Symbol("scope")

interface Scope {
  readonly [SCOPE_KEY]: null | ScopeEmitter
}

const STATIC_SCOPE = {
  [SCOPE_KEY]: null,
} satisfies Scope

function createScope(emitter: ScopeEmitter): Scope {
  return {
    [SCOPE_KEY]: emitter,
  }
}

function attachToScope(scope: Scope, emitters: Set<WeakRef<ScopeEmitter>>): void {
  scope[SCOPE_KEY]?._attachTo(emitters)
}

let implicitScope: Scope = STATIC_SCOPE

function injectScope<TResult>(execute: (passedScope: Scope) => TResult, scope: Scope): TResult {
  const prevScope = implicitScope

  implicitScope = scope
  const result = execute(scope)
  implicitScope = prevScope

  return result
}

function extractScope(): Scope {
  return implicitScope
}

export type { Scope }
export { STATIC_SCOPE, createScope, attachToScope, injectScope, extractScope }
