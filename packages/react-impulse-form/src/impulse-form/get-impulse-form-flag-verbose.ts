import type { GetImpulseFormParam } from "./_get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormFlagVerbose<TForm extends ImpulseForm> =
  GetImpulseFormParam<TForm, "flag.schema.verbose">
