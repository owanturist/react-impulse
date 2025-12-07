import { useCallback, useDebugValue } from "react"

import { isFunction } from "~/tools/is-function"
import { isStrictEqual } from "~/tools/is-strict-equal"

import type { DependencyList } from "./dependency-list"
import type { Equal } from "./equal"
import type { ReadableSignal } from "./readable-signal"
import type { Signal } from "./signal"
import type { Monitor } from "./_internal/monitor"
import { useCreateMonitor } from "./_internal/use-create-monitor"
import { useHandler } from "./_internal/use-handler"

/**
 * The options for the {@link useComputed} hook.
 *
 * @template TValue the type of the resulting value.
 *
 * @version 1.0.0
 */
interface UseComputedOptions<TValue> {
  /**
   * The equality check function determines whether or not the factory result is different.
   * If the factory result is different, a host component re-renders.
   * In some cases specifying the function leads to better performance because it prevents unnecessary updates.
   *
   * @default Object.is
   */
  readonly equals?: null | Equal<TValue>
}

/**
 * A hook reads an {@link signal} value whenever it updates but enqueues a re-render only when the resulting value is different from the previous.
 *
 * @template TValue the type of the {@link Signal} value.
 *
 * @param signal anything that implements the {@link ReadableSignal} interface.
 *
 * @returns the {@link signal}'s value.
 *
 * @version 1.0.0
 */
function useComputed<TValue>(signal: ReadableSignal<TValue>): TValue

/**
 * A hook that executes the {@link compute} function whenever any of the involved {@link Signal}s' values update but enqueues a re-render only when the resulting value is different from the previous.
 *
 * @template TResult the type of the {@link compute} result.
 *
 * @param compute a function that provides {@link Monitor} as the first argument and subscribes to all {@link Signal}s calling the {@link Signal.read} method inside the function.
 * @param dependencies optional array of dependencies of the {@link compute} function. If not defined, the {@link compute} function is called on every render.
 * @param options optional {@link UseComputedOptions}.
 * @param options.equals the {@link Equal} function that determines whether or not the {@link compute} result is different from the previous one. Defaults to {@link Object.is}.
 *
 * @returns the {@link compute} function result.
 *
 * @version 1.0.0
 */
function useComputed<TResult>(
  compute: (monitor: Monitor) => TResult,
  dependencies?: DependencyList,
  options?: UseComputedOptions<TResult>,
): TResult

function useComputed<TResult>(
  computeOrReadableSignal: ((monitor: Monitor) => TResult) | ReadableSignal<TResult>,
  dependencies?: DependencyList,
  options?: UseComputedOptions<TResult>,
): TResult {
  const transform = useCallback(
    (monitor: Monitor) => {
      if (isFunction(computeOrReadableSignal)) {
        return computeOrReadableSignal(monitor)
      }

      return computeOrReadableSignal.read(monitor)
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: pass dependencies as is or factory is the only dependency
    dependencies ?? [computeOrReadableSignal],
  )

  const equals = useHandler((prev: TResult, next: TResult) => {
    const fn = options?.equals ?? isStrictEqual

    return fn(prev, next)
  })

  const value = useCreateMonitor(transform, equals)

  useDebugValue(value)

  return value
}

export type { UseComputedOptions }
export { useComputed }
