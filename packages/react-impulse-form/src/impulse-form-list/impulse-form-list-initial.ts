import type { Impulse } from "../dependencies"
import type { GetImpulseFormInitial, ImpulseForm } from "../impulse-form"

export type ImpulseFormListInitial<TElement extends ImpulseForm> = Impulse<
  ReadonlyArray<GetImpulseFormInitial<TElement>>
>
