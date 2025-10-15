import type { Impulse } from "./impulse"
import type { ImpulseOptions } from "./impulse-options"
import type { ReadableImpulse } from "./readable-impulse"
import type { ReadonlyImpulse } from "./readonly-impulse"
import type { Scope } from "./scope"
import type { WritableImpulse } from "./writable-impulse"

export interface ImpulseFactory {
  /**
   * Creates a new Impulse without an initial value.
   *
   * @since 3.0.0
   *
   * @example
   * const impulse = Impulse<string>()
   * const initiallyUndefined = impulse.getValue(scope) === undefined
   */
  <T = undefined>(): Impulse<undefined | T>

  /**
   * Creates a new derived ReadonlyImpulse.
   * A derived Impulse is an Impulse that keeps the derived value in memory and updates it whenever the source value changes.
   *
   * @param getter either anything that implements the `ReadableImpulse` interface or a function to read the derived value from the source.
   *
   * @since 3.0.0
   */
  <T>(
    getter: ReadableImpulse<T> | ((scope: Scope) => T),
    options?: ImpulseOptions<T>,
  ): ReadonlyImpulse<T>

  /**
   * Creates a new derived Impulse.
   * A derived Impulse is an Impulse that keeps the derived value in memory and updates it whenever the source value changes.
   *
   * @param getter either anything that implements the `ReadableImpulse` interface or a function to read the derived value from the source.
   * @param setter either anything that implements the `WritableImpulse` interface or a function to write the derived value back to the source.
   *
   * @since 3.0.0
   */
  <T>(
    getter: ReadableImpulse<T> | ((scope: Scope) => T),
    setter: WritableImpulse<T> | ((value: T, scope: Scope) => void),
    options?: ImpulseOptions<T>,
  ): Impulse<T>

  /**
   * Creates a new Impulse.
   *
   * @param initialValue the initial value.
   *
   * @since 3.0.0
   */
  <T>(initialValue: T, options?: ImpulseOptions<T>): Impulse<T>
}
