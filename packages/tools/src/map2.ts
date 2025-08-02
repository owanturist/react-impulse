export function map2<T1, T2, R>(
  first: ReadonlyArray<T1>,
  second: ReadonlyArray<T2>,
  transform: (valueFirst: T1, valueSecond: T2, index: number) => R,
): ReadonlyArray<R> {
  const length = Math.min(first.length, second.length)
  const acc = new Array<R>(length)

  for (let index = 0; index < length; index++) {
    acc[index] = transform(first[index]!, second[index]!, index)
  }

  return acc
}
