import type { ImpulseEmitter } from "./ImpulseEmitter"

export const EMITTER_KEY = Symbol("scope")

export interface Scope {
  readonly [EMITTER_KEY]: null | ImpulseEmitter
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
  currentInjectedScope = scope
  runtime(scope)
  currentInjectedScope = STATIC_SCOPE
}

export const extractScope = (): Scope => currentInjectedScope
