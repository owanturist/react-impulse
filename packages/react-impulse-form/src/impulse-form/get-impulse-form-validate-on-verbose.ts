import type { GetImpulseFormParam } from "./_get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormValidateOnVerbose<TForm extends ImpulseForm> =
  GetImpulseFormParam<TForm, "validateOn.schema.verbose">
