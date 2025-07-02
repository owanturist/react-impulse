import { isFunction } from "~/tools/is-function"

export type Setter<
  TValue,
  TPrevValues extends ReadonlyArray<unknown> = [TValue],
> = TValue | ((...args: TPrevValues) => TValue)

export function resolveSetter<
  TValue,
  TPrevValues extends ReadonlyArray<unknown>,
>(setter: Setter<TValue, TPrevValues>, ...args: TPrevValues): TValue {
  return isFunction(setter) ? setter(...args) : setter
}
