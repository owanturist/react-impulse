import { isNull } from "~/tools/is-null"

import type { Compare, Scope } from "./dependencies"

export function createNullableCompare<TValue>(compare: Compare<TValue>) {
  return (left: null | TValue, right: null | TValue, scope: Scope) => {
    if (isNull(left) || isNull(right)) {
      // null === null -> true
      // null === unknown -> false
      // unknown === null -> false
      return left === right
    }

    return compare(left, right, scope)
  }
}
