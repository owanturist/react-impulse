import type { WatchContext } from "./WatchContext"

export const SCOPE_KEY = Symbol("scope")

export interface Scope {
  // TODO now needs only subscribe method
  readonly [SCOPE_KEY]: null | WatchContext
  readonly version?: number
}

export const STATIC_SCOPE: Scope = {
  [SCOPE_KEY]: null,
}
