import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

type GetImpulseFormValidateOnSetter<TForm extends ImpulseForm> = GetImpulseFormParam<
  TForm,
  "validateOn.setter"
>

export type { GetImpulseFormValidateOnSetter }
