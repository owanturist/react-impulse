import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

/**
 * A function that compares two values and returns `true` if they are equal.
 * Depending on the type of the values it might be reasonable to use
 * a custom compare function such as shallow-equal or deep-equal.
 *
 * @version 1.0.0
 */
export type Compare<T> = (left: T, right: T) => boolean

/**
 * @private
 */
export const isEqual: Compare<unknown> = Object.is

/**
 * @private
 */
export const noop: VoidFunction = () => {
  // do nothing
}

export const isFunction = <
  TFunction extends (...args: Array<never>) => unknown,
>(
  anything: unknown,
): anything is TFunction => {
  return typeof anything === "function"
}

const useIsomorphicEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect

export const useEvent = <TArgs extends Array<unknown>, TResult>(
  handler: (...args: TArgs) => TResult,
): ((...args: TArgs) => TResult) => {
  const handlerRef = useRef<(...args: TArgs) => TResult>()

  useIsomorphicEffect(() => {
    handlerRef.current = handler
  })

  return useCallback((...args: TArgs) => handlerRef.current!(...args), [])
}

export const usePermanent = <TValue>(init: () => TValue): TValue => {
  const [value] = useState(init)

  return value
}
