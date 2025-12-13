import type { Monitor } from "./_internal/scope"

interface ReadableSignal<T> {
  read(monitor: Monitor): T
}

export type { ReadableSignal }
