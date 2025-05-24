import { isStrictEqual } from "~/is-strict-equal"

export function isShallowArrayEqual<T>(
  left: ReadonlyArray<T>,
  right: ReadonlyArray<T>,
): boolean {
  if (isStrictEqual(left, right)) {
    return true
  }

  if (left.length !== right.length) {
    return false
  }

  return left.every((value, index) => isStrictEqual(value, right[index]!))
}
