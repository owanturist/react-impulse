import type { Scope } from "./scope"

export interface ReadableImpulse<T> {
  getValue(scope: Scope): T
}
