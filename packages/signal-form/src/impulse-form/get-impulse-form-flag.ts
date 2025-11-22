import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

type GetImpulseFormFlag<TForm extends ImpulseForm> = GetImpulseFormParam<TForm, "flag.schema">

export type { GetImpulseFormFlag }
