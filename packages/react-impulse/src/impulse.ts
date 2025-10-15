import { hasProperty } from "~/tools/has-property"
import { isFunction } from "~/tools/is-function"
import { isStrictEqual } from "~/tools/is-strict-equal"

import { DerivedImpulse } from "./derived-impulse"
import { DirectImpulse } from "./direct-impulse"
import type { ImpulseFactory } from "./impulse-factory"
import type { ImpulseOptions } from "./impulse-options"
import type { ReadableImpulse } from "./readable-impulse"
import type { ReadonlyImpulse } from "./readonly-impulse"
import type { Scope } from "./scope"
import type { WritableImpulse } from "./writable-impulse"

export interface Impulse<T> extends ReadonlyImpulse<T>, WritableImpulse<T> {
  /**
   * Updates the value.
   *
   * @param valueOrTransform either the new value or a function that transforms the current value.
   *
   * @returns `void` to emphasize that Impulses are mutable.
   *
   * @since 1.0.0
   */
  setValue(valueOrTransform: T | ((currentValue: T, scope: Scope) => T)): void
}

export const Impulse: ImpulseFactory = <T>(
  initialValueOrReadableImpulse?:
    | T
    | ReadableImpulse<T>
    | ((scope: Scope) => T),
  optionsOrWritableImpulse?:
    | ImpulseOptions<T>
    | WritableImpulse<T>
    | ((value: T, scope: Scope) => void),
  optionsOrNothing?: ImpulseOptions<T>,
): Impulse<undefined | T> | Impulse<T> => {
  const isGetterFunction = isFunction(initialValueOrReadableImpulse)

  if (
    !isGetterFunction &&
    !hasProperty(initialValueOrReadableImpulse, "getValue")
  ) {
    const options = optionsOrWritableImpulse as
      | undefined
      | ImpulseOptions<undefined | T>

    return new DirectImpulse(
      initialValueOrReadableImpulse,
      options?.compare ?? isStrictEqual,
    )
  }

  const [setter, options] =
    isFunction(optionsOrWritableImpulse) ||
    hasProperty(optionsOrWritableImpulse, "setValue")
      ? [optionsOrWritableImpulse, optionsOrNothing]
      : [undefined, optionsOrWritableImpulse]

  return new DerivedImpulse(
    isGetterFunction
      ? initialValueOrReadableImpulse
      : (scope) => initialValueOrReadableImpulse.getValue(scope),
    isFunction(setter) ? setter : (value) => setter?.setValue(value),
    options?.compare ?? isStrictEqual,
  )
}
