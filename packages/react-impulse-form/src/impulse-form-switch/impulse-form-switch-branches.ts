import type { GetImpulseFormParam, ImpulseForm } from "../impulse-form"

type ImpulseFormSwitchBranches<TKind extends ImpulseForm> = GetImpulseFormParam<
  TKind,
  "output.schema"
> extends string
  ? Record<GetImpulseFormParam<TKind, "output.schema">, ImpulseForm>
  : never

export type { ImpulseFormSwitchBranches }
