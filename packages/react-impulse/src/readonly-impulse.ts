import type { Impulse } from "./impulse"
import type { ImpulseOptions } from "./impulse-options"
import type { ReadableImpulse } from "./readable-impulse"
import type { Scope } from "./scope"

export interface ReadonlyImpulse<T> extends ReadableImpulse<T> {
  /**
   * Creates a new Impulse instance out of the current one with the same value.
   *
   * @since 2.0.0
   */
  clone(options?: ImpulseOptions<T>): Impulse<T>

  /**
   * Creates a new Impulse instance out of the current one with the transformed value. Transforming might be handy when cloning mutable values (such as an Impulse).
   *
   * @param transform an optional function that applies to the current value before cloning. It might be handy when cloning mutable values.
   *
   * @since 1.0.0
   */
  clone(
    transform: (value: T, scope: Scope) => T,
    options?: ImpulseOptions<T>,
  ): Impulse<T>
}
