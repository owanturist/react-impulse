export function concat<T>(left: ReadonlyArray<T>, right: ReadonlyArray<T>): ReadonlyArray<T> {
  if (left.length === 0) {
    return right
  }

  if (right.length === 0) {
    return left
  }

  return [...left, ...right]
}
