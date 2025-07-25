export function isDefined<TValue>(
  data: void | null | undefined | TValue,
): data is TValue {
  return data != null
}
