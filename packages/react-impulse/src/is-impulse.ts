import { BaseImpulse } from "./base-impulse"
import type { Impulse, ReadonlyImpulse } from "./_Impulse"
import { isImpulseFactory } from "./is-impulse-factory"
import type { Scope } from "./_Scope"

export const isImpulse = isImpulseFactory(
  (input) => input instanceof BaseImpulse,
) as {
  /**
   * A function to check whether or not the input is an Impulse.
   *
   * @version 3.0.0
   */
  <T, Unknown = unknown>(input: Unknown | Impulse<T>): input is Impulse<T>

  /**
   * A function to check whether or not the input is an Impulse.
   *
   * @version 3.0.0
   */
  <T, Unknown = unknown>(
    input: Unknown | ReadonlyImpulse<T>,
  ): input is ReadonlyImpulse<T>

  /**
   * A function to check whether or not an Impulse value passes the `check`.
   *
   * @version 3.0.0
   */
  <T, Unknown = unknown>(
    scope: Scope,
    check: (value: unknown) => value is T,
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>

  /**
   * A function to check whether or not an Impulse value passes the `check`.
   *
   * @version 3.0.0
   */
  <T, Unknown = unknown>(
    scope: Scope,
    check: (value: unknown) => value is T,
    input: Unknown | ReadonlyImpulse<T>,
  ): input is ReadonlyImpulse<T>
}
