import { SignalForm } from "./_internal/impulse-form"

function isSignalForm(value: unknown): value is SignalForm {
  return value instanceof SignalForm
}

export { isSignalForm }
