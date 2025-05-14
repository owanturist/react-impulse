import { BaseImpulse } from "./BaseImpulse"
import type { Impulse, ReadonlyImpulse } from "./Impulse"
import type { Scope } from "./Scope"
import type { Func } from "./utils"

/**
 * A function to check whether or not the input is an Impulse.
 *
 * @version 3.0.0
 */
export function isImpulse<T, Unknown = unknown>(
  input: Unknown | Impulse<T>,
): input is Impulse<T>

/**
 * A function to check whether or not the input is an Impulse.
 *
 * @version 3.0.0
 */
export function isImpulse<T, Unknown = unknown>(
  input: Unknown | ReadonlyImpulse<T>,
): input is ReadonlyImpulse<T>

/**
 * A function to check whether or not an Impulse value passes the `check`.
 *
 * @version 3.0.0
 */
export function isImpulse<T, Unknown = unknown>(
  scope: Scope,
  check: (value: unknown) => value is T,
  input: Unknown | Impulse<T>,
): input is Impulse<T>

/**
 * A function to check whether or not an Impulse value passes the `check`.
 *
 * @version 3.0.0
 */
export function isImpulse<T, Unknown = unknown>(
  scope: Scope,
  check: (value: unknown) => value is T,
  input: Unknown | ReadonlyImpulse<T>,
): input is ReadonlyImpulse<T>

export function isImpulse(
  ...args:
    | [input: unknown]
    | [scope: Scope, check: Func<[unknown], boolean>, input: unknown]
): boolean {
  if (args.length === 1) {
    return args[0] instanceof BaseImpulse
  }

  if (isImpulse(args[2])) {
    const value = args[2].getValue(args[0])

    return args[1](value)
  }

  return false
}
