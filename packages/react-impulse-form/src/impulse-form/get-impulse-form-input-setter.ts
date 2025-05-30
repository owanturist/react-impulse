import type { GetImpulseFormParam } from "./_get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormInputSetter<TForm extends ImpulseForm> =
  GetImpulseFormParam<TForm, "input.setter">
