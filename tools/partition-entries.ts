import { forEntries } from "~/tools/for-entries"

export function partitionEntries<TObject, TResult>(
  object: TObject,
  predicate: (
    value: TObject[typeof key] | TResult,
    key: keyof TObject,
  ) => value is TResult,
): [Partial<Record<keyof TObject, TResult>>, Partial<TObject>] {
  const right = {} as Partial<Record<keyof TObject, TResult>>
  const left = {} as Partial<TObject>

  forEntries(object, (value, key) => {
    if (predicate(value, key)) {
      right[key] = value
    } else {
      left[key] = value
    }
  })

  return [right, left]
}
