import { ImpulseFormSwitch } from "./_impulse-form-switch"

export function isImpulseFormSwitch(
  anything: unknown,
): anything is ImpulseFormSwitch {
  return anything instanceof ImpulseFormSwitch
}
