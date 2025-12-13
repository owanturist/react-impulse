import type { ReadonlySignal, Signal } from "./impulse"
import { BaseSignal } from "./_internal/base-impulse"
import { createIsSignal } from "./_internal/create-is-impulse"
import type { Monitor } from "./_internal/scope"

const isSignal = createIsSignal((input) => input instanceof BaseSignal) as {
  /**
   * A function to check whether or not the input is a {@link Signal}.
   *
   * @version 3.0.0
   */
  <T, Unknown = unknown>(input: Unknown | Signal<T>): input is Signal<T>

  /**
   * A function to check whether or not the input is a {@link Signal}.
   *
   * @version 3.0.0
   */
  <T, Unknown = unknown>(input: Unknown | ReadonlySignal<T>): input is ReadonlySignal<T>

  /**
   * A function to check whether or not a {@link Signal} value passes the {@link check}.
   *
   * @version 3.0.0
   */
  <T, Unknown = unknown>(
    monitor: Monitor,
    check: (value: unknown) => value is T,
    input: Unknown | Signal<T>,
  ): input is Signal<T>

  /**
   * A function to check whether or not a {@link Signal} value passes the {@link check}.
   *
   * @version 3.0.0
   */
  <T, Unknown = unknown>(
    monitor: Monitor,
    check: (value: unknown) => value is T,
    input: Unknown | ReadonlySignal<T>,
  ): input is ReadonlySignal<T>
}

export { isSignal }
