import { isFunction, useEffect, useLayoutEffect, useRef } from "./dependencies"

export type Func<TArgs extends ReadonlyArray<unknown>, TReturn = void> = (
  this: void,
  ...args: TArgs
) => TReturn

export type Setter<
  TValue,
  TPrevValues extends ReadonlyArray<unknown> = [TValue],
> = TValue | Func<TPrevValues, TValue>

// TODO use everywhere
export function resolveSetter<
  TValue,
  TPrevValues extends ReadonlyArray<unknown>,
>(setter: Setter<TValue, TPrevValues>, ...prevValues: TPrevValues): TValue {
  return isFunction(setter) ? setter(...prevValues) : setter
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type ComputeObject<Obj> = unknown & {
  [K in keyof Obj]: Obj[K]
}

export function isTrue(value: unknown): value is true {
  return value === true
}

export function isFalse(value: unknown): value is false {
  return value === false
}

export function isNull(value: unknown): value is null {
  return value === null
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

export function isPresent<TValue>(
  data: void | null | undefined | TValue,
): data is TValue {
  return data != null
}

export function isHtmlElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement
}

export function eq<T>(left: T, right: T): boolean {
  return Object.is(left, right)
}

export function params<TArgs extends ReadonlyArray<unknown>>(
  ...args: TArgs
): TArgs {
  return args
}

params._second = <T>(_first: unknown, second: T): T => second
params._third = <T>(_first: unknown, _second: unknown, third: T): T => third

export function zipMap<TElement, T0, T1, T2>(
  elements: ReadonlyArray<TElement>,
  fn: (el: TElement, index: number) => [T0, T1, T2],
): [ReadonlyArray<T0>, ReadonlyArray<T1>, ReadonlyArray<T2>]
export function zipMap<TElement, T0, T1>(
  elements: ReadonlyArray<TElement>,
  fn: (el: TElement, index: number) => [T0, T1],
): [ReadonlyArray<T0>, ReadonlyArray<T1>]
export function zipMap<TElement>(
  elements: ReadonlyArray<TElement>,
  fn: (el: TElement, index: number) => ReadonlyArray<unknown>,
): ReadonlyArray<ReadonlyArray<unknown>> {
  const result: Array<Array<unknown>> = [[], [], []]

  for (const [index, tuple] of elements.map(fn).entries()) {
    for (const [position, entry] of tuple.entries()) {
      result[position]![index] = entry
    }
  }

  return result
}

export function uniq<T>(values: ReadonlyArray<T>): ReadonlyArray<T> {
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

  return left.every((value, index) => eq(value, right[index]!))
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
