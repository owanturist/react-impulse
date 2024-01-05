import { type DependencyList, useCallback, useDebugValue } from "./dependencies"
import {
  type Compare,
  eq,
  useStableCallback,
  type Func,
  isFunction,
} from "./utils"
import type { Scope } from "./Scope"
import { useScope } from "./useScope"
import type { ReadonlyImpulse } from "./Impulse"

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
 * A hook reads an `impulse` value whenever it updates
 * but enqueues a re-render only when the resulting value is different from the previous.
 *
 * @param impulse an impulse to extract scoped value from.
 *
 * @version 2.0.0
 */
export function useScoped<TValue>(impulse: ReadonlyImpulse<TValue>): TValue

/**
 * A hook that executes the `factory` function whenever any of the involved Impulses' values update
 * but enqueues a re-render only when the resulting value is different from the previous.
 *
 * @param factory a function that provides Scope as the first argument and subscribes to all Impulses calling the `Impulse#getValue` method inside the function.
 * @param dependencies optional array of dependencies of the `factory` function. If not defined, the `factory` function is called on every render.
 * @param options optional `UseScopedOptions`.
 *
 * @version 1.0.0
 */
export function useScoped<TResult>(
  factory: (scope: Scope) => TResult,
  dependencies?: DependencyList,
  options?: UseScopedOptions<TResult>,
): TResult

export function useScoped<TResult>(
  impulseOrFactory: ReadonlyImpulse<TResult> | Func<[Scope], TResult>,
  dependencies?: DependencyList,
  options?: UseScopedOptions<TResult>,
): TResult {
  const transform = useCallback(
    (scope: Scope) => {
      if (isFunction(impulseOrFactory)) {
        return impulseOrFactory(scope)
      }

      return impulseOrFactory.getValue(scope)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies ?? [impulseOrFactory],
  )
  const value = useScope(transform, useStableCallback(options?.compare ?? eq))

  useDebugValue(value)

  return value
}
