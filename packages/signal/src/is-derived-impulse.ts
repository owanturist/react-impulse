import type { Impulse, ReadonlyImpulse } from "./impulse"
import { createIsImpulse } from "./_internal/create-is-impulse"
import { DerivedImpulse } from "./_internal/derived-impulse"
import type { Monitor } from "./_internal/monitor"

const isDerivedImpulse = createIsImpulse((input) => input instanceof DerivedImpulse) as {
  /**
   * A function to check whether or not the input is an Impulse.
   *
   * @version 1.0.0
   */
  <T, Unknown = unknown>(input: Unknown | Impulse<T>): input is Impulse<T>

  /**
   * A function to check whether or not the input is an Impulse.
   *
   * @version 1.0.0
   */
  <T, Unknown = unknown>(input: Unknown | ReadonlyImpulse<T>): input is ReadonlyImpulse<T>

  /**
   * A function to check whether or not an Impulse value passes the `check`.
   *
   * @version 1.0.0
   */
  <T, Unknown = unknown>(
    monitor: Monitor,
    check: (value: unknown) => value is T,
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>

  /**
   * A function to check whether or not an Impulse value passes the `check`.
   *
   * @version 1.0.0
   */
  <T, Unknown = unknown>(
    monitor: Monitor,
    check: (value: unknown) => value is T,
    input: Unknown | ReadonlyImpulse<T>,
  ): input is ReadonlyImpulse<T>
}

export { isDerivedImpulse }
