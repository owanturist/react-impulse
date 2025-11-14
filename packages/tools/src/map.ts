import { isArray } from "./is-array"

export function map<T, R>(
  iterable: ReadonlyArray<T> | Iterable<T>,
  transform: (value: T, index: number) => R,
): ReadonlyArray<R> {
  const arr = isArray(iterable) ? iterable : Array.from(iterable)

  return arr.map((value, index) => transform(value, index))
}
