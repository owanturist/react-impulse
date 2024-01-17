export type Key = string | number | symbol

export type Compute<T extends object> = { [K in keyof T]: T[K] }

export type Func<TArgs, TReturn = void> =
  TArgs extends ReadonlyArray<unknown>
    ? (...args: TArgs) => TReturn
    : (arg: TArgs) => TReturn

export type Setter<
  TValue,
  TPrevValues extends ReadonlyArray<unknown> = [TValue],
> = TValue | Func<TPrevValues, TValue>

export type AtLeast<
  TObj extends object,
  TKey extends keyof TObj = keyof TObj,
> = Compute<
  {
    [K in TKey]-?: TObj[K]
  } & {
    [K in Exclude<keyof TObj, TKey>]?: TObj[K]
  }
>

type DefinitelyFunction<T> =
  // eslint-disable-next-line @typescript-eslint/ban-types
  Extract<T, Function> extends never ? Function : Extract<T, Function>

export function isFunction<T>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: T | Function,
): data is DefinitelyFunction<T> {
  return typeof data === "function"
}

export function isDefined<TValue>(
  value: null | undefined | TValue,
): value is TValue {
  return value != null
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
