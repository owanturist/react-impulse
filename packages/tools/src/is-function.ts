type DefinitelyFunction<T> =
  // biome-ignore lint/complexity/noBannedTypes: use Function to ensure correct typing
  Extract<T, Function> extends never ? Function : Extract<T, Function>

function isFunction<T>(
  // biome-ignore lint/complexity/noBannedTypes: use Function to ensure correct typing
  data: Function | T,
): data is DefinitelyFunction<T> {
  return typeof data === "function"
}

export { isFunction }
