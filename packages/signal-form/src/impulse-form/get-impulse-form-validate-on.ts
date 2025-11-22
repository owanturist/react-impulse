import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

type GetImpulseFormValidateOn<TForm extends ImpulseForm> = GetImpulseFormParam<
  TForm,
  "validateOn.schema"
>

export type { GetImpulseFormValidateOn }
