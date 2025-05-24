export function isFunction<
  TFunction extends (...args: ReadonlyArray<never>) => unknown,
>(anything: unknown): anything is TFunction {
  return typeof anything === "function"
}
