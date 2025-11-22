import { isFunction } from "~/tools/is-function"

type Setter<TValue, TPrevValues extends ReadonlyArray<unknown> = [TValue]> =
  | TValue
  | ((...args: TPrevValues) => TValue)

function resolveSetter<TValue, TPrevValues extends ReadonlyArray<unknown>>(
  setter: Setter<TValue, TPrevValues>,
  ...args: TPrevValues
): TValue {
  return isFunction(setter) ? setter(...args) : setter
}

export type { Setter }
export { resolveSetter }
