import type { ImpulseForm } from "../impulse-form/impulse-form"

import { ImpulseFormOptional } from "./_impulse-form-optional"

export function isImpulseFormOptional(
  anything: unknown,
): anything is ImpulseFormOptional<ImpulseForm, ImpulseForm> {
  return anything instanceof ImpulseFormOptional
}
