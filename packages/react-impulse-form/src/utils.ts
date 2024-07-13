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

params._second = <T>(_: unknown, second: T): T => second

export function zipMap<TElement, TLeft, TRight>(
  elements: ReadonlyArray<TElement>,
  fn: (el: TElement, index: number) => [TLeft, TRight],
): [ReadonlyArray<TLeft>, ReadonlyArray<TRight>] {
  const left = new Array<TLeft>(elements.length)
  const right = new Array<TRight>(elements.length)

  for (const [index, element] of elements.entries()) {
    const [leftItem, rightItem] = fn(element, index)

    left[index] = leftItem
    right[index] = rightItem
  }

  return [left, right]
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
