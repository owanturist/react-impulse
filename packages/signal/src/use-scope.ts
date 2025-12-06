import { identity } from "~/tools/identity"

import type { Scope } from "./_internal/scope"
import { useCreateScope } from "./_internal/use-create-scope"

/**
 * A hook that returns a Scope.
 *
 * @version 3.0.0
 */
function useScope(): Scope {
  return useCreateScope(identity)
}

export { useScope }
