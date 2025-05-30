import type { GetImpulseFormParam } from "./_get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormValidateOnSetter<TForm extends ImpulseForm> =
  GetImpulseFormParam<TForm, "validateOn.setter">
