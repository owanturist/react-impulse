import type { Setter } from "~/tools/setter"

type FormUnitInputSetter<TInput> = Setter<TInput, [TInput, TInput]>

export type { FormUnitInputSetter }
