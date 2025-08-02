export function replaceElement<T>(
  arr: ReadonlyArray<T>,
  index: number,
  value: T,
): ReadonlyArray<T> {
  if (index < 0 || index >= arr.length) {
    return arr
  }

  const current = arr.at(index)!

  if (value === current) {
    return arr
  }

  return [...arr.slice(0, index), value, ...arr.slice(index + 1)]
}
