export const isArray: <T>(data: ArrayLike<unknown> | T) => data is ReadonlyArray<unknown> =
  Array.isArray
