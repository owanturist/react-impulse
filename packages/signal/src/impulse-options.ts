import type { Equal } from "./equal"

/**
 * The options for creating and cloning an Impulse.
 *
 * @template T the type of the Impulse value.
 *
 * @version 1.0.0
 */
interface ImpulseOptions<T> {
  /**
   * The equality function determines whether or not a new Impulse's value replaces the current one.
   * In some cases specifying the function leads to better performance because it prevents unnecessary updates.
   */
  readonly equals?: null | Equal<T>
}

export type { ImpulseOptions }
