import type { ImpulseForm } from "../impulse-form/impulse-form"

import { ImpulseFormList } from "./_internal/impulse-form-list"

function isImpulseFormList(value: unknown): value is ImpulseFormList<ImpulseForm> {
  return value instanceof ImpulseFormList
}

export { isImpulseFormList }
