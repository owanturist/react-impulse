import { isStrictEqual } from "~/tools/is-strict-equal"

function isShallowArrayEqual<T>(left: ReadonlyArray<T>, right: ReadonlyArray<T>): boolean {
  if (isStrictEqual(left, right)) {
    return true
  }

  if (left.length !== right.length) {
    return false
  }

  return left.every(
    // biome-ignore lint/style/noNonNullAssertion: the lengths are equal
    (value, index) => isStrictEqual(value, right[index]!),
  )
}

export { isShallowArrayEqual }
