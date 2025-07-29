import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormInitial<TForm extends ImpulseForm> =
  GetImpulseFormParam<TForm, "initial">
