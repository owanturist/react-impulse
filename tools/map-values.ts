import { entries } from "~/tools/entries"

export function mapValues<TObject, TResult>(
  object: TObject,
  fn: (value: TObject[keyof TObject], key: keyof TObject) => TResult,
): Record<keyof TObject, TResult> {
  const result = {} as Record<keyof TObject, TResult>

  for (const [key, value] of entries(object)) {
    result[key] = fn(value, key)
  }

  return result
}
