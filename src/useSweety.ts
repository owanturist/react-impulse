import { useState } from "react"

import { Sweety } from "./Sweety"
import { isFunction } from "./utils"

/**
 * A hook that initiates a stable (never changing) Sweety instance.
 *
 * *The initial state is disregarded during subsequent re-renders.*
 *
 * @param lazyInitialState a function returning an initial state that calls only once during the initial render.
 */
export function useSweety<T>(lazyInitialState: () => T): Sweety<T>

export function useSweety<TInit extends (...args: Array<never>) => unknown>(
  invalidLazyInitialState: TInit,
): never

/**
 * A hook that initiates a stable (never changing) Sweety instance.
 *
 * *The initial state is disregarded during subsequent re-renders.*
 *
 * @param initialState a state used during the initial render
 */
export function useSweety<T>(initialState: T): Sweety<T> // eslint-disable-line @typescript-eslint/unified-signatures

export function useSweety<T>(lazyOrState: T | (() => T)): Sweety<T> {
  const [instance] = useState(() => {
    const initialState = isFunction(lazyOrState) ? lazyOrState() : lazyOrState

    return Sweety.of(initialState)
  })

  return instance
}
