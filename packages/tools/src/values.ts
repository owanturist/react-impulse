export const values: <TObject>(
  object: TObject,
) => ReadonlyArray<TObject[keyof TObject]> = Object.values
