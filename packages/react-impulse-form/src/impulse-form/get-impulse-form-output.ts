import type { GetImpulseFormParam } from "./_get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormOutput<TForm extends ImpulseForm> =
  GetImpulseFormParam<TForm, "output.schema">
