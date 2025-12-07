import type { Monitor } from "./_internal/monitor"

interface ReadableSignal<T> {
  read(monitor: Monitor): T
}

export type { ReadableSignal }
