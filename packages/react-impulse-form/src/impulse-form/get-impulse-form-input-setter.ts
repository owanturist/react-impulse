import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormInputSetter<TForm extends ImpulseForm> =
  GetImpulseFormParam<TForm, "input.setter">
