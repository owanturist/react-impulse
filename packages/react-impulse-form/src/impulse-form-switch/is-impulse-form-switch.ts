import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormSwitchBranches } from "./impulse-form-switch-branches"
import { FormSwitch } from "./_internal/impulse-form-switch"

function isFormSwitch(
  anything: unknown,
): anything is FormSwitch<SignalForm, FormSwitchBranches<SignalForm>> {
  return anything instanceof FormSwitch
}

export { isFormSwitch }
