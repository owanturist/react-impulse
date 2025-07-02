export function zipMap<TElement, T0, T1, T2>(
  elements: ReadonlyArray<TElement>,
  fn: (el: TElement, index: number) => [T0, T1, T2],
): [ReadonlyArray<T0>, ReadonlyArray<T1>, ReadonlyArray<T2>]

export function zipMap<TElement, T0, T1>(
  elements: ReadonlyArray<TElement>,
  fn: (el: TElement, index: number) => [T0, T1],
): [ReadonlyArray<T0>, ReadonlyArray<T1>]

export function zipMap<TElement>(
  elements: ReadonlyArray<TElement>,
  fn: (el: TElement, index: number) => ReadonlyArray<unknown>,
): ReadonlyArray<ReadonlyArray<unknown>> {
  const result: Array<Array<unknown>> = [[], [], []]

  for (const [index, tuple] of elements.map(fn).entries()) {
    for (const [position, entry] of tuple.entries()) {
      result[position]![index] = entry
    }
  }

  return result
}
