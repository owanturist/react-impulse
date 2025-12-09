import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"

type FormSwitchBranches<TKind extends SignalForm> = GetSignalFormParam<
  TKind,
  "output.schema"
> extends string
  ? Record<GetSignalFormParam<TKind, "output.schema">, SignalForm>
  : never

export type { FormSwitchBranches }
