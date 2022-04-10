import { useRef } from "react"

import { Sweety } from "./Sweety"

// TODO add docs
export function useSweety<T>(init: () => T): Sweety<T>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSweety(init: (...args: Array<any>) => any): never
export function useSweety<T>(value: T): Sweety<T>
export function useSweety<T>(initOrValue: T | (() => T)): Sweety<T> {
  const sweetyRef = useRef<Sweety<T>>()

  if (sweetyRef.current == null) {
    sweetyRef.current = Sweety.of(
      typeof initOrValue === "function"
        ? (initOrValue as () => T)()
        : initOrValue,
    )
  }

  return sweetyRef.current
}
