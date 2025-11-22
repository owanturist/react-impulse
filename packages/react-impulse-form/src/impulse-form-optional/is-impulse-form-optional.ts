import type { ImpulseForm } from "../impulse-form"

import { ImpulseFormOptional } from "./_internal/impulse-form-optional"

function isImpulseFormOptional(
  anything: unknown,
): anything is ImpulseFormOptional<ImpulseForm, ImpulseForm> {
  return anything instanceof ImpulseFormOptional
}

export { isImpulseFormOptional }
