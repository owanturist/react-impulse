import type { Compare } from "./compare"

/**
 * Options for creating an Impulse.
 *
 * @category Core
 * @since 1.0.0
 */
export interface ImpulseOptions<T> {
  /**
   * The compare function determines whether or not a new Impulse's value replaces the current one.
   * In many cases specifying the function leads to better performance because it prevents unnecessary updates.
   *
   * @default Object.is
   */
  readonly compare?: null | Compare<T>
}
