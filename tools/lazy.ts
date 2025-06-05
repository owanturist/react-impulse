import { isUndefined } from "~/tools/is-undefined"

export type Lazy<T> = () => T

export function Lazy<T>(init: () => T): Lazy<T> {
  let value: undefined | T = undefined

  return () => {
    if (isUndefined(value)) {
      value = init()
    }

    return value
  }
}
