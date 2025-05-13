import type { Scope } from "./Scope"

export interface ReadableImpulse<T> {
  getValue(scope: Scope): T
}
