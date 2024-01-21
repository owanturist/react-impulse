import { useEffect, useLayoutEffect, useRef } from "./dependencies"

export type Func<TArgs extends ReadonlyArray<unknown>, TReturn = void> = (
  ...args: TArgs
) => TReturn

export type Setter<
  TValue,
  TPrevValues extends ReadonlyArray<unknown> = [TValue],
> = TValue | Func<TPrevValues, TValue>

export function isDefined<T>(data: T): data is NonNullable<T> {
  return data != null
}

export function shallowArrayEquals<T>(
  left: ReadonlyArray<T>,
  right: ReadonlyArray<T>,
): boolean {
  if (Object.is(left, right)) {
    return true
  }

  if (left.length !== right.length) {
    return false
  }

  return left.every((value, index) => Object.is(value, right[index]))
}

export const useIsomorphicLayoutEffect =
  /* c8 ignore next */
  typeof window === "undefined" ? useEffect : useLayoutEffect

export function useHandler<
  THandler extends null | undefined | Func<ReadonlyArray<never>, unknown>,
>(handler: THandler): THandler {
  const handlerRef = useRef<THandler>(null as never)
  const stableRef = useRef(((...args) => {
    return handlerRef.current?.(...args)
  }) as NonNullable<THandler>)

  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler
  })

  return handler && stableRef.current
}
