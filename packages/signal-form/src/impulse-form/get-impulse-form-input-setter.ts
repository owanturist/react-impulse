import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

type GetImpulseFormInputSetter<TForm extends ImpulseForm> = GetImpulseFormParam<
  TForm,
  "input.setter"
>

export type { GetImpulseFormInputSetter }
