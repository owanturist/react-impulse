import type { Monitor } from "./_internal/monitor"

/**
 * @version 1.0.0
 */
interface ReadableSignal<T> {
  read(monitor: Monitor): T
}

export type { ReadableSignal }
