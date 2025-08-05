export function isString<TValue extends string, TRest = unknown>(
  value: TRest | TValue,
): value is TValue {
  return typeof value === "string"
}
