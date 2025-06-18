import { entries } from "~/tools/entries"

export function tapValues<TObject>(
  object: TObject,
  fn: (value: TObject[keyof TObject], key: keyof TObject) => void,
): void {
  for (const [key, value] of entries(object)) {
    fn(value, key)
  }
}
