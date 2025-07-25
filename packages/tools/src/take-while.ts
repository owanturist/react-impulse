export function takeWhile<T, R = T>(
  arr: ReadonlyArray<T>,
  predicate: (value: T | R, index: number) => value is R,
): ReadonlyArray<R> {
  const result: Array<R> = []

  for (const [index, value] of arr.entries()) {
    if (!predicate(value, index)) {
      return result
    }

    result.push(value)
  }

  return result
}
