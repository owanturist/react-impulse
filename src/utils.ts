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
export type Compare<T> = (left: T, right: T) => boolean

export type Func<TArgs extends ReadonlyArray<unknown>, TResult = void> = (
  ...args: TArgs
) => TResult

export const eq: Compare<unknown> = Object.is

export function noop(): void {
  // do nothing
}

export function isFunction<
  TFunction extends Func<ReadonlyArray<never>, unknown>,
>(anything: unknown): anything is TFunction {
  return typeof anything === "function"
}

export const useIsomorphicLayoutEffect =
  /* c8 ignore next */
  typeof window === "undefined" ? useEffect : useLayoutEffect

export function useEvent<TArgs extends ReadonlyArray<unknown>, TResult>(
  handler: Func<TArgs, TResult>,
): Func<TArgs, TResult> {
  const handlerRef = useRef<Func<TArgs, TResult>>(null as never)

  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler
  })

  return useCallback((...args) => handlerRef.current(...args), [])
}

export function usePermanent<TValue>(init: () => TValue): TValue {
  const [value] = useState(init)

  return value
}
