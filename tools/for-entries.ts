import { entries } from "~/tools/entries"

export function forEntries<TObject>(
  object: TObject,
  fn: (value: TObject[typeof key], key: keyof TObject) => void,
): void {
  for (const [key, value] of entries(object)) {
    fn(value, key)
  }
}
