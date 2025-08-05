export function hasProperty<TKey extends PropertyKey>(
  input: unknown,
  key: TKey,
): input is Record<TKey, unknown> {
  return typeof input === "object" && input != null && key in input
}
