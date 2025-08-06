import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

export type ImpulseFormSwitchBranches<TKind extends ImpulseForm> = Record<
  GetImpulseFormParam<TKind, "output.schema">,
  ImpulseForm
>
