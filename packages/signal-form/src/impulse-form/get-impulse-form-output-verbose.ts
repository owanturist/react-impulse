import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

type GetImpulseFormOutputVerbose<TForm extends ImpulseForm> = GetImpulseFormParam<
  TForm,
  "output.schema.verbose"
>

export type { GetImpulseFormOutputVerbose }
