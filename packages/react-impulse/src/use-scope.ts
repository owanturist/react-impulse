import { isStrictEqual } from "./is-strict-equal"
import type { Scope } from "./scope"
import { useCreateScope } from "./use-create-scope"
import { identity } from "./identity"

/**
 * A hook that returns a Scope.
 *
 * @version 3.0.0
 */
export function useScope(): Scope {
  return useCreateScope(identity, isStrictEqual)
}
