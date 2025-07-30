export const keys = Object.keys as <
  TObject extends Record<PropertyKey, unknown>,
>(
  object: TObject,
) => ReadonlyArray<keyof TObject>
