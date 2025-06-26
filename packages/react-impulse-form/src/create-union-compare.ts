import type { Compare } from "./dependencies"

export function createUnionCompare<TPrimary, TSecondary>(
  primary: (value: unknown) => value is TPrimary,
  secondary: Compare<TSecondary>,
): Compare<TPrimary | TSecondary> {
  return (left, right, scope) => {
    if (primary(left) || primary(right)) {
      return left === right
    }

    return secondary(left, right, scope)
  }
}
