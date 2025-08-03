import { forValues } from "~/tools/for-values"

export function partitionEntries<TObject, TResult>(
  object: TObject,
  predicate: (
    value: TObject[typeof key] | TResult,
    key: keyof TObject,
  ) => value is TResult,
): [Record<keyof TObject, TResult>, TObject] {
  const right = {} as Record<keyof TObject, TResult>
  const left = {} as TObject

  forValues(object, (value, key) => {
    if (predicate(value, key)) {
      right[key] = value
    } else {
      left[key] = value
    }
  })

  return [right, left]
}
