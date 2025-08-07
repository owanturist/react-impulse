import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

export type ImpulseFormSwitchBranches<TKind extends ImpulseForm> =
  GetImpulseFormParam<TKind, "output.schema"> extends string
    ? Record<GetImpulseFormParam<TKind, "output.schema">, ImpulseForm>
    : never
