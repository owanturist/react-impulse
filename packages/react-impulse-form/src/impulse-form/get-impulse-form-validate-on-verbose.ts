import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

type GetImpulseFormValidateOnVerbose<TForm extends ImpulseForm> = GetImpulseFormParam<
  TForm,
  "validateOn.schema.verbose"
>

export type { GetImpulseFormValidateOnVerbose }
