import { forEntries } from "~/tools/for-entries"

export function mapValues<TObject>(
  object: TObject,
  fn: (value: TObject[typeof key], key: keyof TObject) => TObject[typeof key],
): TObject
export function mapValues<TObject, TResult>(
  object: TObject,
  fn: (value: TObject[typeof key], key: keyof TObject) => TResult,
): Record<keyof TObject, TResult>

export function mapValues<TObject, TResult>(
  object: TObject,
  fn: (value: TObject[typeof key], key: keyof TObject) => TResult,
): Record<keyof TObject, TResult> {
  const result = {} as Record<keyof TObject, TResult>

  forEntries(object, (value, key) => {
    result[key] = fn(value, key)
  })

  return result
}
