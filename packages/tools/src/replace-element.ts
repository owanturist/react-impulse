export function replaceElement<T>(
  arr: ReadonlyArray<T>,
  index: number,
  replacer: (current: T) => T,
): ReadonlyArray<T> {
  if (index < 0 || index >= arr.length) {
    return arr
  }

  const current = arr.at(index)!
  const next = replacer(current)

  if (next === current) {
    return arr
  }

  return [...arr.slice(0, index), next, ...arr.slice(index + 1)]
}
