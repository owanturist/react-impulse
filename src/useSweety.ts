import { useRef } from "react"

import { Sweety } from "./Sweety"

/**
 * A hook that initiates a stable (never changing) Sweety store.
 *
 * *The initial value is disregarded during subsequent re-renders.*
 *
 * @param lazyInitialValue a function returning an initial value that calls only once when the hook is called.
 * It might be handy when the initial value is expensive to compute.
 *
 * @see {@link Sweety.of}
 */
export function useSweety<T>(lazyInitialValue: () => T): Sweety<T>

/**
 * A hook that initiates a stable (never changing) Sweety store.
 *
 * *The initial value is disregarded during subsequent re-renders.*
 *
 * @param invalidInitValue a function with arguments might not be used to initialize the store.
 */
export function useSweety<TInit extends (...args: Array<never>) => unknown>(
  invalidLazyInitialValue: TInit,
): never

/**
 * A hook that initiates a stable (never changing) Sweety store.
 *
 * *The initial value is disregarded during subsequent re-renders.*
 *
 * @param initialValue a value to initialize the store.
 *
 * @see {@link Sweety.of}
 */
export function useSweety<T>(initialValue: T): Sweety<T>

export function useSweety<T>(lazyOrValue: T | (() => T)): Sweety<T> {
  const sweetyRef = useRef<Sweety<T>>()

  if (sweetyRef.current == null) {
    sweetyRef.current = Sweety.of(
      typeof lazyOrValue === "function"
        ? (lazyOrValue as () => T)()
        : lazyOrValue,
    )
  }

  return sweetyRef.current
}
