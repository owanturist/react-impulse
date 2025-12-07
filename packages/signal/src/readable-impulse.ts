import type { Scope } from "./_internal/scope"

interface ReadableImpulse<T> {
  read(scope: Scope): T
}

export type { ReadableImpulse }
