import type { GetImpulseFormParam } from "./_get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormErrorVerbose<TForm extends ImpulseForm> =
  GetImpulseFormParam<TForm, "error.schema.verbose">
