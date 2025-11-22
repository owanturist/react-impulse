import type { Scope } from "./_internal/scope"

interface ReadableImpulse<T> {
  getValue(scope: Scope): T
}

export type { ReadableImpulse }
