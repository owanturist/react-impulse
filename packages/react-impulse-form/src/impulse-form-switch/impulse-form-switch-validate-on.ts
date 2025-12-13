import type { SignalForm } from "../impulse-form/impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { FormSwitchBranches } from "./impulse-form-switch-branches"
import type { FormSwitchConciseParam } from "./_internal/impulse-form-switch-concise-param"

type FormSwitchValidateOn<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = FormSwitchConciseParam<TKind, TBranches, "validateOn.schema", ValidateStrategy>

export type { FormSwitchValidateOn }
