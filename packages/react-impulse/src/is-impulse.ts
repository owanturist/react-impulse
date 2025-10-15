import { BaseImpulse } from "./base-impulse"
import type { Impulse } from "./impulse"
import { isImpulseFactory } from "./is-impulse-factory"
import type { ReadonlyImpulse } from "./readonly-impulse"
import type { Scope } from "./scope"

export const isImpulse = isImpulseFactory(
  (input) => input instanceof BaseImpulse,
) as {
  /**
   * A function to check whether or not the input is an Impulse.
   *
   * @since 3.0.0
   */
  <T, Unknown = unknown>(input: Unknown | Impulse<T>): input is Impulse<T>

  /**
   * A function to check whether or not the input is an Impulse.
   *
   * @since 3.0.0
   */
  <T, Unknown = unknown>(
    input: Unknown | ReadonlyImpulse<T>,
  ): input is ReadonlyImpulse<T>

  /**
   * A function to check whether or not an Impulse value passes the `check`.
   *
   * @since 3.0.0
   */
  <T, Unknown = unknown>(
    scope: Scope,
    check: (value: unknown) => value is T,
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>

  /**
   * A function to check whether or not an Impulse value passes the `check`.
   *
   * @since 3.0.0
   */
  <T, Unknown = unknown>(
    scope: Scope,
    check: (value: unknown) => value is T,
    input: Unknown | ReadonlyImpulse<T>,
  ): input is ReadonlyImpulse<T>
}
