import { ImpulseFormUnit } from "./_internal/impulse-form-unit"

function isImpulseFormUnit(value: unknown): value is ImpulseFormUnit<unknown, unknown, unknown> {
  return value instanceof ImpulseFormUnit
}

export { isImpulseFormUnit }
