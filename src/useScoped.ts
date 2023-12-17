import { type DependencyList, useCallback, useDebugValue } from "./dependencies"
import { type Compare, eq, useEvent } from "./utils"
import type { Scope } from "./Scope"
import { useScope } from "./useScope"
import { defineExecutionContext } from "./validation"

export interface UseScopedOptions<T> {
  /**
   * The compare function determines whether or not the factory result is different.
   * If the factory result is different, a host component re-renders.
   * In many cases specifying the function leads to better performance because it prevents unnecessary updates.
   *
   * @default Object.is
   */
  readonly compare?: null | Compare<T>
}

/**
 * A hook that executes the `factory` function whenever any of the involved Impulses' values update
 * but enqueues a re-render only when the resulting value is different from the previous.
 *
 * @param factory a function that subscribes to all Impulses calling the `Impulse#getValue` method inside the function.
 * @param dependencies optional array of dependencies of the `factory` function. If not defined, the `factory` function is called on every render.
 * @param options optional `UseScopedOptions`.
 *
 * @version 1.0.0
 */
export function useScoped<TResult>(
  factory: (scope: Scope) => TResult,
  dependencies?: DependencyList,
  { compare }: UseScopedOptions<TResult> = {},
): TResult {
  const transform = useCallback(
    (scope: Scope) => defineExecutionContext("useScoped", factory, scope),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies ?? [factory],
  )
  const value = useScope(transform, useEvent(compare ?? eq))

  useDebugValue(value)

  return value
}
