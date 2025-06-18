export type Entries<TObject> = {
  [TKey in keyof TObject]: [TKey, TObject[TKey]]
}[keyof TObject]

export const entries: <TObject>(
  object: TObject,
) => ReadonlyArray<Entries<TObject>> = Object.entries
