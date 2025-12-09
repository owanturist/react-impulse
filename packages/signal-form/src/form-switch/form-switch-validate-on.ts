import type { SignalForm } from "../signal-form/signal-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { FormSwitchBranches } from "./form-switch-branches"
import type { FormSwitchConciseParam } from "./_internal/form-switch-concise-param"

type FormSwitchValidateOn<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = FormSwitchConciseParam<TKind, TBranches, "validateOn.schema", ValidateStrategy>

export type { FormSwitchValidateOn }
