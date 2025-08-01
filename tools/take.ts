export function take<T>(
  arr: ReadonlyArray<T>,
  count: number,
): ReadonlyArray<T> {
  if (count >= arr.length) {
    return arr
  }

  if (count <= 0) {
    return []
  }

  return arr.slice(0, count)
}
