import { useEffect, useLayoutEffect, useRef } from "./dependencies"

export type Func<TArgs extends ReadonlyArray<unknown>, TReturn = void> = (
  this: void,
  ...args: TArgs
) => TReturn

export type Setter<
  TValue,
  TPrevValues extends ReadonlyArray<unknown> = [TValue],
> = TValue | Func<TPrevValues, TValue>

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type ComputeObject<Obj> = unknown & {
  [K in keyof Obj]: Obj[K]
}

export const isTrue = (value: unknown): value is true => value === true

export const isHtmlElement = (value: unknown): value is HTMLElement => {
  return value instanceof HTMLElement
}

export const eq = <T>(left: T, right: T): boolean => Object.is(left, right)

export const uniq = <T>(values: ReadonlyArray<T>): ReadonlyArray<T> => {
  const acc = new Set<T>()

  const result = values.filter((value) => {
    if (acc.has(value)) {
      return false
    }

    acc.add(value)

    return true
  })

  return result.length === values.length ? values : result
}

export function shallowArrayEquals<T>(
  left: ReadonlyArray<T>,
  right: ReadonlyArray<T>,
): boolean {
  if (eq(left, right)) {
    return true
  }

  if (left.length !== right.length) {
    return false
  }

  return left.every((value, index) => eq(value, right[index]))
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
