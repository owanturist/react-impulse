import { useEffect, useLayoutEffect, useRef } from "./dependencies"

export type ObjectCompute<TObject extends object> = {
  [K in keyof TObject]: TObject[K]
}

export type ObjectFilter<TObject extends object, TValue> = {
  [K in keyof TObject]: TObject[K] extends TValue ? K : never
}[keyof TObject]

export type Func<TArgs extends ReadonlyArray<unknown>, TReturn = void> = (
  ...args: TArgs
) => TReturn

export type Setter<
  TValue,
  TPrevValues extends ReadonlyArray<unknown> = [TValue],
> = TValue | Func<TPrevValues, TValue>

export type AtLeast<
  TObj extends object,
  TKey extends keyof TObj = keyof TObj,
> = ObjectCompute<
  {
    [K in TKey]-?: TObj[K]
  } & {
    [K in Exclude<keyof TObj, TKey>]?: TObj[K]
  }
>

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction<T>(data: T | Function): data is Function {
  return typeof data === "function"
}

export function isBoolean<T>(data: T | boolean): data is boolean {
  return typeof data === "boolean"
}

export function isDefined<T>(data: T): data is NonNullable<T> {
  return data != null
}

export function isTruthy<T>(
  data: T,
): data is Exclude<T, null | undefined | false | "" | 0> {
  return Boolean(data)
}

export function identity<T>(value: T): T {
  return value
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
