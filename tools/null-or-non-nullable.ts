export type NullOrNonNullable<T> = [T, null] extends [null, T]
  ? null
  : NonNullable<T>
