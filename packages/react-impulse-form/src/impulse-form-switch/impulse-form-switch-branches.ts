import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"

type FormSwitchBranches<TKind extends SignalForm> =
  GetSignalFormParam<TKind, "output.schema"> extends string
    ? Record<GetSignalFormParam<TKind, "output.schema">, SignalForm>
    : never

export type { FormSwitchBranches }
