import type { ImpulseForm } from "../impulse-form"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import { ImpulseFormSwitch } from "./_internal/impulse-form-switch"

function isImpulseFormSwitch(
  anything: unknown,
): anything is ImpulseFormSwitch<ImpulseForm, ImpulseFormSwitchBranches<ImpulseForm>> {
  return anything instanceof ImpulseFormSwitch
}

export { isImpulseFormSwitch }
