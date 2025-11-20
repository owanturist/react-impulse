import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormErrorVerbose<TForm extends ImpulseForm> = GetImpulseFormParam<
  TForm,
  "error.schema.verbose"
>
