import { identity } from "~/tools/identity"

import type { Monitor } from "./_internal/monitor"
import { useCreateMonitor } from "./_internal/use-create-monitor"

/**
 * A hook that returns a {@link Monitor}.
 *
 * @returns A {@link Monitor} instance.
 *
 * @version 1.0.0
 */
function useMonitor(): Monitor {
  return useCreateMonitor(identity)
}

export { useMonitor }
