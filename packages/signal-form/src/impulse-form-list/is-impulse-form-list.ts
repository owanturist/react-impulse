import type { ImpulseForm } from "../impulse-form/impulse-form"

import { ImpulseFormList } from "./_impulse-form-list"

export function isImpulseFormList(value: unknown): value is ImpulseFormList<ImpulseForm> {
  return value instanceof ImpulseFormList
}
