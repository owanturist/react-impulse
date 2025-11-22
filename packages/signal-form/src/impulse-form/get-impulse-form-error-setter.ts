import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

type GetImpulseFormErrorSetter<TForm extends ImpulseForm> = GetImpulseFormParam<
  TForm,
  "error.setter"
>

export type { GetImpulseFormErrorSetter }
