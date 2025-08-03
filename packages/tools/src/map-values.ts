import { forValues } from "~/tools/for-values"

export function mapValues<TObject, TResult>(
  object: TObject,
  fn: (value: TObject[typeof key], key: keyof TObject) => TResult,
): Record<keyof TObject, TResult> {
  const result = {} as Record<keyof TObject, TResult>

  forValues(object, (value, key) => {
    result[key] = fn(value, key)
  })

  return result
}
