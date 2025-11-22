type ObjectEntries<TObject extends Record<string, unknown>> = {
  [TKey in keyof TObject]: [TKey, TObject[TKey]]
}[keyof TObject]

function entries<TObject extends Record<string, unknown>>(
  object: TObject,
): ReadonlyArray<ObjectEntries<TObject>>

function entries<TItem>(array: ReadonlyArray<TItem>): ArrayIterator<[number, TItem]>

function entries(
  arrayOrObject: Record<string, unknown> | ReadonlyArray<unknown>,
): ArrayIterator<[number, unknown]> | ReadonlyArray<[string, unknown]> {
  return Array.isArray(arrayOrObject) ? arrayOrObject.entries() : Object.entries(arrayOrObject)
}

export type { ObjectEntries }
export { entries }
