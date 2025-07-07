import type { GetImpulseFormInput, ImpulseForm } from "../impulse-form"

export { isShallowArrayEqual as isImpulseFormListInputEqual } from "~/tools/is-shallow-array-equal"

export type ImpulseFormListInput<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormInput<TElement>
>
