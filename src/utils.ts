export {
  type Compare,
  type Func,
  eq,
  noop,
  isFunction,
  useIsomorphicLayoutEffect,
  useEvent,
  usePermanent,
}

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useState,
} from "./dependencies"

/**
 * A function that compares two values and returns `true` if they are equal.
 * Depending on the type of the values it might be reasonable to use
 * a custom compare function such as shallow-equal or deep-equal.
 *
 * @version 1.0.0
 */
type Compare<T> = (left: T, right: T) => boolean

type Func<TArgs extends ReadonlyArray<unknown>, TResult = void> = (
  ...args: TArgs
) => TResult

const eq: Compare<unknown> = Object.is

function noop(): void {
  // do nothing
}

function isFunction<TFunction extends Func<ReadonlyArray<never>, unknown>>(
  anything: unknown,
): anything is TFunction {
  return typeof anything === "function"
}

const useIsomorphicLayoutEffect =
  // /* c8 ignore next */
  typeof window === "undefined" ? useEffect : useLayoutEffect

function useEvent<TArgs extends ReadonlyArray<unknown>, TResult>(
  handler: Func<TArgs, TResult>,
): Func<TArgs, TResult> {
  const handlerRef = useRef<(...args: TArgs) => TResult>()

  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler
  })

  return useCallback((...args: TArgs) => handlerRef.current!(...args), [])
}

function usePermanent<TValue>(init: () => TValue): TValue {
  const [value] = useState(init)

  return value
}
