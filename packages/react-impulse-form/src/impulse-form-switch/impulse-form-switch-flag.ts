import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormSwitchBranches } from "./impulse-form-switch-branches"
import type { FormSwitchConciseParam } from "./_internal/impulse-form-switch-concise-param"

type FormSwitchFlag<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = FormSwitchConciseParam<TKind, TBranches, "flag.schema", boolean>

export type { FormSwitchFlag }
