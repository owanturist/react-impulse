import type { SignalForm } from "../signal-form/signal-form"

import type { FormSwitchBranches } from "./form-switch-branches"
import { FormSwitch } from "./_internal/form-switch"

function isFormSwitch(
  anything: unknown,
): anything is FormSwitch<SignalForm, FormSwitchBranches<SignalForm>> {
  return anything instanceof FormSwitch
}

export { isFormSwitch }
