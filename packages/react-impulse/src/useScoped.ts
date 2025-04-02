import { type DependencyList, useCallback, useDebugValue } from "./dependencies"
import { type Compare, eq, useHandler, type Func, isFunction } from "./utils"
import { STATIC_SCOPE, type Scope } from "./Scope"
import { useCreateScope } from "./useCreateScope"
import type { ImpulseGetter } from "./Impulse"

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
 * @param impulse anything that implements the `ImpulseGetter` interface.
 *
 * @version 2.0.0
 */
export function useScoped<TValue>(impulse: ImpulseGetter<TValue>): TValue

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
  factoryOrImpulseGetter: ImpulseGetter<TResult> | Func<[Scope], TResult>,
  dependencies?: DependencyList,
  options?: UseScopedOptions<TResult>,
): TResult {
  const transform = useCallback(
    (scope: Scope) => {
      if (isFunction(factoryOrImpulseGetter)) {
        return factoryOrImpulseGetter(scope)
      }

      return factoryOrImpulseGetter.getValue(scope)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies ?? [factoryOrImpulseGetter],
  )
  const compare = useHandler((prev: TResult, next: TResult) => {
    const cmp = options?.compare ?? eq

    return cmp(prev, next, STATIC_SCOPE)
  })

  const value = useCreateScope(transform, compare)

  useDebugValue(value)

  return value
}
