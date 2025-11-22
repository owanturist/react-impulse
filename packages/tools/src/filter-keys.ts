type FilterKeys<TObject, TValue> = {
  [K in keyof TObject]: TObject[K] extends TValue ? K : never
}[keyof TObject]

export type { FilterKeys }
