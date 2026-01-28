/**
 * @version 1.0.0
 */
interface WritableSignal<T> {
  write(value: T): void
}

export type { WritableSignal }
