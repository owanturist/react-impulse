import { entries } from "~/tools/entries"
import { hasProperty } from "~/tools/has-property"

export function forIntersection<TFirst, TSecond>(
  first: TFirst,
  second: TSecond,
  fn: (
    valueFirst: TFirst[typeof key],
    valueSecond: TSecond[typeof key],
    key: keyof TFirst & keyof TSecond,
  ) => void,
): void {
  for (const [key, valueFirst] of entries(first)) {
    if (hasProperty(second, key)) {
      fn(valueFirst, second[key], key)
    }
  }
}
