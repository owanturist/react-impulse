import { SignalForm } from "./_internal/signal-form"

function isSignalForm(value: unknown): value is SignalForm {
  return value instanceof SignalForm
}

export { isSignalForm }
