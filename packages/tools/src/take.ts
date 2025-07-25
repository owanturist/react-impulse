export function take<T>(
  arr: ReadonlyArray<T>,
  count: number,
): ReadonlyArray<T> {
  if (count <= 0) {
    return []
  }

  if (count >= arr.length) {
    return arr
  }

  return arr.slice(0, count)
}
