import { ImpulseFormUnit } from "./_impulse-form-unit"

export function isImpulseFormUnit(
  value: unknown,
): value is ImpulseFormUnit<unknown> {
  return value instanceof ImpulseFormUnit
}
