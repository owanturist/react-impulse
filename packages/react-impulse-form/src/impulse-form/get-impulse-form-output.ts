import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

type GetImpulseFormOutput<TForm extends ImpulseForm> = GetImpulseFormParam<TForm, "output.schema">

export type { GetImpulseFormOutput }
