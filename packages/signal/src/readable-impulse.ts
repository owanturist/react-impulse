import type { Monitor } from "./_internal/monitor"

interface ReadableImpulse<T> {
  read(monitor: Monitor): T
}

export type { ReadableImpulse }
