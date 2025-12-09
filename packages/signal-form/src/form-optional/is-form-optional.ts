import type { SignalForm } from "../signal-form/signal-form"

import { FormOptional } from "./_internal/form-optional"

function isFormOptional(anything: unknown): anything is FormOptional<SignalForm, SignalForm> {
  return anything instanceof FormOptional
}

export { isFormOptional }
