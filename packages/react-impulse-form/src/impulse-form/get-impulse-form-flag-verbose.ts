import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

type GetImpulseFormFlagVerbose<TForm extends ImpulseForm> = GetImpulseFormParam<
  TForm,
  "flag.schema.verbose"
>

export type { GetImpulseFormFlagVerbose }
