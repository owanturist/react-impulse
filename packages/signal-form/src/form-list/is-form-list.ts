import type { SignalForm } from "../signal-form/signal-form"

import { FormList } from "./_internal/form-list"

function isFormList(value: unknown): value is FormList<SignalForm> {
  return value instanceof FormList
}

export { isFormList }
