import { SetStateAction, useEffect, useLayoutEffect, useRef } from "react"

/**
 * A function that compares two values and returns `true` if they are equal.
 * Depending on the type of the values it might be reasonable to use
 * a custom compare function such as shallow-equal or deep-equal.
 */
export type Compare<T> = (prev: T, next: T) => boolean

/**
 * The setState function that can be used to set the state of the store.
 *
 * @param valueOrTransform either the new value or a function that will be applied to the current value before setting.
 *
 * @param compare an optional compare function with the highest priority to use for this call only.
 * If not defined it uses `compare` from `useSetSweetyState` or `useSweetyState`.
 * The strict equality check function (`===`) will be used if `null`.
 *
 * @example
 * import { useSetSweetyState, useSweetyState } from "react-sweety"
 *
 * const setState = useSetSweetyState(store)
 * // or
 * const [state, setState] = useSweetyState(store)
 */
export type SetSweetyState<T> = (
  valueOrTransform: SetStateAction<T>,
  compare?: null | Compare<T>,
) => void

/**
 * @private
 */
export const isEqual: Compare<unknown> = Object.is

/**
 * @private
 */
export const overrideCompare = <T>(
  original: Compare<T>,
  override: undefined | null | Compare<T>,
): Compare<T> => {
  if (override === null) {
    return isEqual
  }

  return override ?? original
}

/**
 * @private
 */
export const noop: VoidFunction = () => {
  // do nothing
}

const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect

export const useEvent = <THandler extends (...args: Array<never>) => unknown>(
  handler: THandler,
): THandler => {
  const handlerRef = useRef(handler)

  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler
  })

  return useRef(((...args) => handlerRef.current(...args)) as THandler).current
}
