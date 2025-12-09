import type { SignalForm } from "../signal-form/signal-form"

import type { FormSwitchBranches } from "./form-switch-branches"
import type { FormSwitchConciseParam } from "./_internal/form-switch-concise-param"

type FormSwitchError<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = FormSwitchConciseParam<TKind, TBranches, "error.schema", null>

export type { FormSwitchError }
