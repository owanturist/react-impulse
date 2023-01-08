import { useState } from "react"

import { Impulse } from "./Impulse"
import { Compare, isFunction } from "./utils"

/**
 * A hook that initiates a stable (never changing) Impulse.
 *
 * *The initial state is disregarded during subsequent re-renders.*
 *
 * @param lazyInitialState a function returning an initial state that calls only once during the initial render.
 * @param compare an optional `Compare` function applied as `Impulse#compare`. When not defined or `null` then `Object.is` applies as a fallback.
 *
 * @version 1.0.0
 */
export function useImpulse<T>(
  lazyInitialState: () => T,
  compare?: null | Compare<T>,
): Impulse<T>

export function useImpulse<T>(
  invalidLazyInitialState: (...args: Array<never>) => unknown,
  compare?: null | Compare<T>,
): never

/**
 * A hook that initiates a stable (never changing) Impulse.
 *
 * *The initial state is disregarded during subsequent re-renders.*
 *
 * @param initialState a state used during the initial render
 * @param compare an optional `Compare` function applied as `Impulse#compare`. When not defined or `null` then `Object.is` applies as a fallback.
 *
 * @version 1.0.0
 */
export function useImpulse<T>(
  initialState: T, // eslint-disable-line @typescript-eslint/unified-signatures
  compare?: null | Compare<T>,
): Impulse<T>

export function useImpulse<T>(
  lazyOrState: T | (() => T),
  compare?: null | Compare<T>,
): Impulse<T> {
  const [impulse] = useState(() => {
    const initialState = isFunction(lazyOrState) ? lazyOrState() : lazyOrState

    return Impulse.of(initialState, compare)
  })

  return impulse
}
