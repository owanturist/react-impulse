import type { Compute } from "./compute"
import type { FilterKeys } from "./filter-keys"

export type OmitValues<TObject, TValue> = Compute<
  Omit<TObject, FilterKeys<TObject, TValue>>
>
