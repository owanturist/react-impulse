import { entries } from "~/tools/entries"

export function partitionEntries<TObject extends Record<string, unknown>, TResult>(
  object: TObject,
  predicate: (value: TObject[typeof key] | TResult, key: keyof TObject) => value is TResult,
): [Record<keyof TObject, TResult>, TObject] {
  const right = {} as Record<keyof TObject, TResult>
  const left = {} as TObject

  for (const [key, value] of entries(object)) {
    if (predicate(value, key)) {
      right[key] = value
    } else {
      left[key] = value
    }
  }

  return [right, left]
}
