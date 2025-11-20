import type { ImpulseForm } from "../impulse-form/impulse-form"

import { ImpulseFormSwitch } from "./_impulse-form-switch"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export function isImpulseFormSwitch(
  anything: unknown,
): anything is ImpulseFormSwitch<ImpulseForm, ImpulseFormSwitchBranches<ImpulseForm>> {
  return anything instanceof ImpulseFormSwitch
}
