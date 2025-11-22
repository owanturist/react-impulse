function drop<T>(arr: ReadonlyArray<T>, count: number): ReadonlyArray<T> {
  if (count <= 0) {
    return arr
  }

  if (count >= arr.length) {
    return []
  }

  return arr.slice(count)
}

export { drop }
