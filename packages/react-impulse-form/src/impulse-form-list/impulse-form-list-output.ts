import type { GetImpulseFormOutput, ImpulseForm } from "../impulse-form"

type ImpulseFormListOutput<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormOutput<TElement>
>

export type { ImpulseFormListOutput }
