import type { Scope } from "./_Scope"

export interface ReadableImpulse<T> {
  getValue(scope: Scope): T
}
