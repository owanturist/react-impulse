import type { Scope } from "./scope"

/**
 * A function that compares two values and returns `true` if they are equal.
 * Depending on the type of the values it might be reasonable to use
 * a custom compare function such as shallow-equal or deep-equal.
 *
 * @since 1.0.0
 */
export type Compare<T> = (left: T, right: T, scope: Scope) => boolean
