import { tapValues } from "./tap-values"

export function mapValues<TObject, TResult>(
  object: TObject,
  fn: (value: TObject[keyof TObject], key: keyof TObject) => TResult,
): Record<keyof TObject, TResult> {
  const result = {} as Record<keyof TObject, TResult>

  tapValues(object, (value, key) => {
    result[key] = fn(value, key)
  })

  return result
}
