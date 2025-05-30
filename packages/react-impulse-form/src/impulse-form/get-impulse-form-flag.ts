import type { GetImpulseFormParam } from "./_get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormFlag<TForm extends ImpulseForm> = GetImpulseFormParam<
  TForm,
  "flag.schema"
>
