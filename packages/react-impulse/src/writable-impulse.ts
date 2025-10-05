/**
 * @category Core
 */
export interface WritableImpulse<T> {
  /**
   * Updates the value.
   *
   * @param value a new value.
   *
   * @returns `void` to emphasize that Impulses are mutable.
   *
   * @since 1.0.0
   */
  setValue(value: T): void
}
