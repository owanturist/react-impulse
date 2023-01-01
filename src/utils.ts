import { useEffect, useLayoutEffect, useRef } from "react"

/**
 * A function that compares two values and returns `true` if they are equal.
 * Depending on the type of the values it might be reasonable to use
 * a custom compare function such as shallow-equal or deep-equal.
 */
export type Compare<T> = (left: T, right: T) => boolean

/**
 * @private
 */
export const isEqual: Compare<unknown> = Object.is

const isDefined = <T>(value: undefined | null | T): value is T => value != null

/**
 * @private
 */
// TODO use ?? instead
export const overrideCompare = <T>(
  lowest: Compare<T>,
  ...overrides: Array<undefined | null | Compare<T>>
): Compare<T> => {
  const [override = lowest] = overrides
    .map((compare) => (compare === null ? isEqual : compare))
    .filter(isDefined)
    .slice(-1)

  return override
}

/**
 * @private
 */
export const noop: VoidFunction = () => {
  // do nothing
}

const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect

// TODO move to useWatchSweety
export const useEvent = <THandler extends (...args: Array<never>) => unknown>(
  handler: THandler,
): THandler => {
  const handlerRef = useRef(handler)

  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler
  })

  return useRef(((...args) => handlerRef.current(...args)) as THandler).current
}

export const isFunction = <
  TFunction extends (...args: Array<never>) => unknown,
>(
  anything: unknown,
): anything is TFunction => {
  return typeof anything === "function"
}
