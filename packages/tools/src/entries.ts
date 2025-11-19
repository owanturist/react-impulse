export type ObjectEntries<TObject extends Record<string, unknown>> = {
  [TKey in keyof TObject]: [TKey, TObject[TKey]]
}[keyof TObject]

export function entries<TObject extends Record<string, unknown>>(
  object: TObject,
): ReadonlyArray<ObjectEntries<TObject>>

export function entries<TItem>(array: ReadonlyArray<TItem>): ArrayIterator<[number, TItem]>

export function entries(
  arrayOrObject: Record<string, unknown> | ReadonlyArray<unknown>,
): ArrayIterator<[number, unknown]> | ReadonlyArray<[string, unknown]> {
  return Array.isArray(arrayOrObject) ? arrayOrObject.entries() : Object.entries(arrayOrObject)
}
