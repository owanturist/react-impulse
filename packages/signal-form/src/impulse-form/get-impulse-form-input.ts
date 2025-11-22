import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

type GetImpulseFormInput<TForm extends ImpulseForm> = GetImpulseFormParam<TForm, "input.schema">

export type { GetImpulseFormInput }
