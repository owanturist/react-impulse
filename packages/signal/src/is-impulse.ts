import type { Impulse, ReadonlyImpulse } from "./impulse"
import { BaseImpulse } from "./_internal/base-impulse"
import { createIsImpulse } from "./_internal/create-is-impulse"
import type { Monitor } from "./_internal/monitor"

const isImpulse = createIsImpulse((input) => input instanceof BaseImpulse) as {
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
  <T, Unknown = unknown>(input: Unknown | ReadonlyImpulse<T>): input is ReadonlyImpulse<T>

  /**
   * A function to check whether or not an Impulse value passes the `check`.
   *
   * @version 3.0.0
   */
  <T, Unknown = unknown>(
    monitor: Monitor,
    check: (value: unknown) => value is T,
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>

  /**
   * A function to check whether or not an Impulse value passes the `check`.
   *
   * @version 3.0.0
   */
  <T, Unknown = unknown>(
    monitor: Monitor,
    check: (value: unknown) => value is T,
    input: Unknown | ReadonlyImpulse<T>,
  ): input is ReadonlyImpulse<T>
}

export { isImpulse }
