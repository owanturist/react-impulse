import type { Impulse } from "../dependencies"
import type { ImpulseForm } from "../impulse-form"
import type { GetImpulseFormInitial } from "../impulse-form/get-impulse-form-initial"

export { isShallowArrayEqual as isImpulseFormListInitialEqual } from "~/tools/is-shallow-array-equal"

export type ImpulseFormListInitial<TElement extends ImpulseForm> = Impulse<
  ReadonlyArray<GetImpulseFormInitial<TElement>>
>
