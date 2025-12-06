import type { Compare } from "@owanturist/signal"

import { isStrictEqual } from "~/tools/is-strict-equal"

function createUnionCompare<TPrimary, TSecondary>(
  primary: (value: unknown) => value is TPrimary,
  secondary: Compare<TSecondary>,
): Compare<TPrimary | TSecondary> {
  // do not bother with primary compare if secondary is strict equal
  if (secondary === isStrictEqual || secondary === Object.is) {
    return isStrictEqual
  }

  return (left, right) => {
    if (primary(left) || primary(right)) {
      return left === right
    }

    return secondary(left, right)
  }
}

export { createUnionCompare }
