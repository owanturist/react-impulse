import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormInput<TForm extends ImpulseForm> = GetImpulseFormParam<
  TForm,
  "input.schema"
>
