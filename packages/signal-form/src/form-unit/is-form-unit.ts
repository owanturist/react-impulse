import { FormUnit } from "./_internal/form-unit"

function isFormUnit(value: unknown): value is FormUnit<unknown, unknown, unknown> {
  return value instanceof FormUnit
}

export { isFormUnit }
