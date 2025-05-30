import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormFlagSetter<TForm extends ImpulseForm> =
  GetImpulseFormParam<TForm, "flag.setter">
