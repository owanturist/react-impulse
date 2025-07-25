export function map<T, R>(
  arr: ReadonlyArray<T>,
  transform: (value: T, index: number) => R,
): ReadonlyArray<R> {
  return arr.map((value, index) => transform(value, index))
}
