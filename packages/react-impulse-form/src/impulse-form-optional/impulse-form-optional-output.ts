import type { GetImpulseFormParam, ImpulseForm } from "../impulse-form"

type ImpulseFormOptionalOutput<TElement extends ImpulseForm> =
  | undefined
  | GetImpulseFormParam<TElement, "output.schema">

export type { ImpulseFormOptionalOutput }
