import { isStrictEqual } from "~/tools/is-strict-equal"

import type { Compare } from "../dependencies"

export function createUnionCompare<TPrimary, TSecondary>(
  primary: (value: unknown) => value is TPrimary,
  secondary: Compare<TSecondary>,
): Compare<TPrimary | TSecondary> {
  // do not bother with primary compare if secondary is strict equal
  if (secondary === isStrictEqual || secondary === Object.is) {
    return isStrictEqual
  }

  return (left, right, scope) => {
    if (primary(left) || primary(right)) {
      return left === right
    }

    return secondary(left, right, scope)
  }
}
