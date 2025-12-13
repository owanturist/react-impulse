import type { SignalForm } from "../impulse-form/impulse-form"

import { FormOptional } from "./_internal/impulse-form-optional"

function isFormOptional(anything: unknown): anything is FormOptional<SignalForm, SignalForm> {
  return anything instanceof FormOptional
}

export { isFormOptional }
