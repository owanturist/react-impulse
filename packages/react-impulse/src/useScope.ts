import { eq, identity } from "./utils"
import type { Scope } from "./Scope"
import { useCreateScope } from "./useCreateScope"

/**
 * A hook that returns a Scope.
 *
 * @version 3.0.0
 */
export function useScope(): Scope {
  return useCreateScope(identity, eq)
}
