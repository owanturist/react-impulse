import type { Equal } from "./compare"
import type { Signal } from "./impulse"

/**
 * The options for creating and cloning a {@link Signal}.
 *
 * @template T the type of the {@link Signal} value.
 *
 * @version 1.0.0
 */
interface SignalOptions<T> {
  /**
   * The equality function determines whether or not a new {@link Signal}'s value replaces the current one.
   * In some cases specifying the function leads to better performance because it prevents unnecessary updates.
   */
  readonly equals?: null | Equal<T>
}

export type { SignalOptions }
