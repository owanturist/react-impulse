export function isTruthy<T>(data: T): data is Exclude<T, "" | 0 | false | null | undefined> {
  return Boolean(data)
}
