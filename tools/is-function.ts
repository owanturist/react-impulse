type DefinitelyFunction<T> =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  Extract<T, Function> extends never ? Function : Extract<T, Function>

export function isFunction<T>(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  data: Function | T,
): data is DefinitelyFunction<T> {
  return typeof data === "function"
}
