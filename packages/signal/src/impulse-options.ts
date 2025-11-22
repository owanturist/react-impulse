import type { Compare } from "./compare"

interface ImpulseOptions<T> {
  /**
   * The compare function determines whether or not a new Impulse's value replaces the current one.
   * In many cases specifying the function leads to better performance because it prevents unnecessary updates.
   */
  readonly compare?: null | Compare<T>
}

export type { ImpulseOptions }
