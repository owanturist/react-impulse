import { useCallback, useDebugValue } from "react"

import { isFunction } from "~/tools/is-function"
import { isStrictEqual } from "~/tools/is-strict-equal"

import type { Compare } from "./compare"
import type { DependencyList } from "./dependency-list"
import type { ReadableImpulse } from "./readable-impulse"
import { STATIC_SCOPE, type Scope } from "./_internal/scope"
import { useCreateScope } from "./_internal/use-create-scope"
import { useHandler } from "./_internal/use-handler"

interface UseScopedOptions<T> {
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
 * @param impulse anything that implements the `ReadableImpulse` interface.
 *
 * @version 2.0.0
 */
function useScoped<TValue>(impulse: ReadableImpulse<TValue>): TValue

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
function useScoped<TResult>(
  factory: (scope: Scope) => TResult,
  dependencies?: DependencyList,
  options?: UseScopedOptions<TResult>,
): TResult

function useScoped<TResult>(
  factoryOrReadableImpulse: ((scope: Scope) => TResult) | ReadableImpulse<TResult>,
  dependencies?: DependencyList,
  options?: UseScopedOptions<TResult>,
): TResult {
  const transform = useCallback(
    (scope: Scope) => {
      if (isFunction(factoryOrReadableImpulse)) {
        return factoryOrReadableImpulse(scope)
      }

      return factoryOrReadableImpulse.getValue(scope)
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: pass dependencies as is or factory is the only dependency
    dependencies ?? [factoryOrReadableImpulse],
  )

  const compare = useHandler((prev: TResult, next: TResult) => {
    const fn = options?.compare ?? isStrictEqual

    return fn(prev, next, STATIC_SCOPE)
  })

  const value = useCreateScope(transform, compare)

  useDebugValue(value)

  return value
}

export type { UseScopedOptions }
export { useScoped }
