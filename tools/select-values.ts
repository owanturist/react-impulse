import { mapValues } from "~/tools/map-values"

export function selectValues<
  TObject,
  TSelected extends keyof TObject[keyof TObject],
>(
  object: TObject,
  key: TSelected,
): { [TKey in keyof TObject]: TObject[TKey][TSelected] } {
  const selected = mapValues(object, (value) => value[key])

  return selected as { [TKey in keyof TObject]: TObject[TKey][TSelected] }
}
