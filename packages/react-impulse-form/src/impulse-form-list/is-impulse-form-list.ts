import { ImpulseFormList } from "./_impulse-form-list"

export function isImpulseFormList(value: unknown): value is ImpulseFormList {
  return value instanceof ImpulseFormList
}
