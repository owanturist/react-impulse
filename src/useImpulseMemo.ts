import { useMemo } from "react"

import { useScope } from "./useScope"
import { Scope } from "./Scope"

/**
 * The hook is an `Impulse` version of the `React.useMemo` hook.
 * During the `factory` execution, all the Impulses
 * calling the `Impulse#getValue` method become _phantom dependencies_ of the hook.
 *
 * @param factory a function calculates a value `T` whenever any of the `dependencies`' values change.
 * @param dependencies an array of values used in the `factory` function.
 *
 * @version 1.0.0
 */
export const useImpulseMemo = <T>(
  factory: (scope: Scope) => T,
  dependencies: undefined | ReadonlyArray<unknown>,
): T => {
  const scope = useScope()

  return useMemo(
    () => factory(scope),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies && [...dependencies, scope],
  )
}
