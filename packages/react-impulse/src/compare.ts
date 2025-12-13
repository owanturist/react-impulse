/**
 * The equality check function.
 *
 *
 * @template T the type of values to compare.
 * @param left the first value to compare.
 * @param right the second value to compare.
 * @returns `true` if the two values are considered equal, otherwise `false`.
 *
 * @version 1.0.0
 */
type Equal<T> = (left: T, right: T) => boolean

export type { Equal }
