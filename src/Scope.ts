import type { WatchContext } from "./WatchContext"

export const SCOPE_KEY = Symbol("scope")

export interface Scope {
  readonly [SCOPE_KEY]: null | WatchContext
  readonly version?: number
}

export const STATIC_SCOPE: Scope = {
  [SCOPE_KEY]: null,
}

let currentInjectedScope: null | Scope = null

export const injectScope = (
  runtime: (scope: Scope) => void,
  scope: Scope,
): void => {
  currentInjectedScope = scope
  runtime(scope)
  currentInjectedScope = null
}

export const extractScope = (): null | Scope => currentInjectedScope
