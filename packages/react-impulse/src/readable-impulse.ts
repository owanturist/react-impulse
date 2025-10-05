import type { Scope } from "./scope"

/**
 * @category Core
 */
export interface ReadableImpulse<T> {
  /**
   * Returns the impulse value.
   *
   * @param scope the Scope that tracks the Impulse value changes.
   *
   * @since 1.0.0
   */
  getValue(scope: Scope): T
}
