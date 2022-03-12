import { SetStateContext } from "./SetStateContext"

export const batch = (fn: () => void): void => {
  const [, emit] = SetStateContext.init()

  fn()

  emit()
}
