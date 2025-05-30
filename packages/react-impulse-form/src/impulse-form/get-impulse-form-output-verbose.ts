import type { GetImpulseFormParam } from "./_get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormOutputVerbose<TForm extends ImpulseForm> =
  GetImpulseFormParam<TForm, "output.schema.verbose">
