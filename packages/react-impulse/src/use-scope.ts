import { identity } from "~/tools/identity"
import { isStrictEqual } from "~/tools/is-strict-equal"

import type { Scope } from "./scope"
import { useCreateScope } from "./use-create-scope"

/**
 * A hook that returns a Scope.
 *
 * @category Scope Factories
 * @group React Hooks
 * @since 3.0.0
 */
export function useScope(): Scope {
  return useCreateScope(identity, isStrictEqual)
}
