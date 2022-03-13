import { SetStateAction } from "react"

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
 *
 * @see {@link Compare}
 */
export type SetSweetyState<T> = (
  valueOrTransform: SetStateAction<T>,
  compare?: null | Compare<T>,
) => void

/**
 * @private
 */
export const isEqual = <T>(one: T, another: T): boolean => one === another

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

/**
 * @private
 */
export const warning = (message: string): void => {
  /* istanbul ignore next */
  if (
    (process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test") &&
    typeof console !== "undefined" &&
    // eslint-disable-next-line no-console
    typeof console.error === "function"
  ) {
    // eslint-disable-next-line no-console
    console.error(message)
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message)
  } catch {
    // do nothing
  }
}

/**
 * @private
 */
export const modInc = (x: number): number => {
  return (x + 1) % 123456789
}
