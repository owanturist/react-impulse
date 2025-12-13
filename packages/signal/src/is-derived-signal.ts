import type { ReadonlySignal, Signal } from "./signal"
import { createIsSignal } from "./_internal/create-is-signal"
import { DerivedSignal } from "./_internal/derived-signal"
import type { Monitor } from "./_internal/monitor"

const isDerivedSignal = createIsSignal((input) => input instanceof DerivedSignal) as {
  /**
   * A function to check whether or not the input is a Derived {@link Signal}.
   *
   * @version 1.0.0
   */
  <T, Unknown = unknown>(input: Unknown | Signal<T>): input is Signal<T>

  /**
   * A function to check whether or not the input is a Derived {@link Signal}.
   *
   * @version 1.0.0
   */
  <T, Unknown = unknown>(input: Unknown | ReadonlySignal<T>): input is ReadonlySignal<T>

  /**
   * A function to check whether or not a Derived {@link Signal} value passes the {@link check}.
   *
   * @version 1.0.0
   */
  <T, Unknown = unknown>(
    monitor: Monitor,
    check: (value: unknown) => value is T,
    input: Unknown | Signal<T>,
  ): input is Signal<T>

  /**
   * A function to check whether or not a Derived {@link Signal} value passes the {@link check}.
   *
   * @version 1.0.0
   */
  <T, Unknown = unknown>(
    monitor: Monitor,
    check: (value: unknown) => value is T,
    input: Unknown | ReadonlySignal<T>,
  ): input is ReadonlySignal<T>
}

export { isDerivedSignal }
