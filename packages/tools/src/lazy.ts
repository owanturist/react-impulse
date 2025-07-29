export type Lazy<T> = () => T

export function Lazy<T>(init: () => T): Lazy<T> {
  let value: null | { _current: T } = null

  return () => {
    value ??= { _current: init() }

    return value._current
  }
}

console.log("TODO verify it is necessary to have Lazy")
