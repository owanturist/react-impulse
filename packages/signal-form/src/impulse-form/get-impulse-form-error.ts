import type { GetImpulseFormParam } from "./get-impulse-form-param"
import type { ImpulseForm } from "./impulse-form"

type GetImpulseFormError<TForm extends ImpulseForm> = GetImpulseFormParam<TForm, "error.schema">

export type { GetImpulseFormError }
