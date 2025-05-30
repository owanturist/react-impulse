import type { GetImpulseFormParam } from "./_get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormErrorSetter<TForm extends ImpulseForm> =
  GetImpulseFormParam<TForm, "error.setter">
