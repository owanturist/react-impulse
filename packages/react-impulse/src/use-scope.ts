import { identity } from "~/tools/identity"

import type { Scope } from "./scope"
import { useCreateScope } from "./use-create-scope"

/**
 * A hook that returns a Scope.
 *
 * @version 3.0.0
 */
export function useScope(): Scope {
  return useCreateScope(identity)
}
