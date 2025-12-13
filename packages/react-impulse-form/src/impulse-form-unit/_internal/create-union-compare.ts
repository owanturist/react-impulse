import type { Equal } from "@owanturist/signal"

import { isStrictEqual } from "~/tools/is-strict-equal"

function createIsUnionEqual<TPrimary, TSecondary>(
  primary: (value: unknown) => value is TPrimary,
  secondary: Equal<TSecondary>,
): Equal<TPrimary | TSecondary> {
  // do not bother with primary check if secondary is strict equal
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

export { createIsUnionEqual }
