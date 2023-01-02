import { useState } from "react"

import { Sweety } from "./Sweety"
import { Compare, isFunction } from "./utils"

/**
 * A hook that initiates a stable (never changing) Sweety instance.
 *
 * *The initial state is disregarded during subsequent re-renders.*
 *
 * @param lazyInitialState a function returning an initial state that calls only once during the initial render.
 * @param compare an optional `Compare` function applied as `Sweety#compare`. When not defined or `null` then `Object.is` applies as a fallback.
 */
export function useSweety<T>(
  lazyInitialState: () => T,
  compare?: null | Compare<T>,
): Sweety<T>

export function useSweety<T>(
  invalidLazyInitialState: (...args: Array<never>) => unknown,
  compare?: null | Compare<T>,
): never

/**
 * A hook that initiates a stable (never changing) Sweety instance.
 *
 * *The initial state is disregarded during subsequent re-renders.*
 *
 * @param initialState a state used during the initial render
 * @param compare an optional `Compare` function applied as `Sweety#compare`. When not defined or `null` then `Object.is` applies as a fallback.
 */
export function useSweety<T>(
  initialState: T, // eslint-disable-line @typescript-eslint/unified-signatures
  compare?: null | Compare<T>,
): Sweety<T>

export function useSweety<T>(
  lazyOrState: T | (() => T),
  compare?: null | Compare<T>,
): Sweety<T> {
  const [instance] = useState(() => {
    const initialState = isFunction(lazyOrState) ? lazyOrState() : lazyOrState

    return Sweety.of(initialState, compare)
  })

  return instance
}
