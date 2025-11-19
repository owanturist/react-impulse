import type { Compute } from "~/tools/compute"
import type { FilterKeys } from "~/tools/filter-keys"

export type OmitValues<TObject, TValue> = Compute<Omit<TObject, FilterKeys<TObject, TValue>>>
