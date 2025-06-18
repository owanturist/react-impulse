import { tapValues } from "~/tools/tap-values"

export function partitionValues<TObject>(
  object: TObject,
  predicate: (value: TObject[keyof TObject], key: keyof TObject) => boolean,
): [Partial<TObject>, Partial<TObject>] {
  const right = {} as Partial<TObject>
  const left = {} as Partial<TObject>

  tapValues(object, (value, key) => {
    if (predicate(value, key)) {
      right[key] = value
    } else {
      left[key] = value
    }
  })

  return [right, left]
}
