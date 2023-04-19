import type { ScopeEmitter } from "./ScopeEmitter"

export const EMITTER_KEY = Symbol("scope")

export interface Scope {
  readonly [EMITTER_KEY]: null | ScopeEmitter
  readonly version?: number
}

export const STATIC_SCOPE: Scope = {
  [EMITTER_KEY]: null,
}

let currentInjectedScope = STATIC_SCOPE

export const injectScope = (
  runtime: (scope: Scope) => void,
  scope: Scope,
): void => {
  const prevScope = currentInjectedScope

  currentInjectedScope = scope
  runtime(scope)
  currentInjectedScope = prevScope
}

export const extractScope = (): Scope => currentInjectedScope
