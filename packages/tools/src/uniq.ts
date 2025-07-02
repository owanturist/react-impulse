export function uniq<T>(values: ReadonlyArray<T>): ReadonlyArray<T> {
  const acc = new Set<T>()

  const result = values.filter((value) => {
    if (acc.has(value)) {
      return false
    }

    acc.add(value)

    return true
  })

  return result.length === values.length ? values : result
}
