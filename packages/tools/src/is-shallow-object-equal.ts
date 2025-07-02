import { isStrictEqual } from "~/tools/is-strict-equal"

export function isShallowObjectEqual<T extends Record<PropertyKey, unknown>>(
  left: T,
  right: T,
): boolean {
  if (isStrictEqual(left, right)) {
    return true
  }

  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)

  if (leftKeys.length !== rightKeys.length) {
    return false
  }

  for (const key of leftKeys) {
    if (!right.hasOwnProperty(key) || !isStrictEqual(left[key], right[key])) {
      return false
    }
  }

  return true
}
