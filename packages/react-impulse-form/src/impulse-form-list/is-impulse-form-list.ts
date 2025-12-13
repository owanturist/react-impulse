import type { SignalForm } from "../impulse-form/impulse-form"

import { FormList } from "./_internal/impulse-form-list"

function isFormList(value: unknown): value is FormList<SignalForm> {
  return value instanceof FormList
}

export { isFormList }
