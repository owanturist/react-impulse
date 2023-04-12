import type { Dispatch } from "react"

let scheduledListeners: null | Set<VoidFunction> = null

const insertListeners = (
  acc: Set<VoidFunction>,
  next: ReadonlySet<VoidFunction>,
): void => {
  next.forEach((listener) => acc.add(listener))
}

export const scheduleEmit = (
  execute: (register: Dispatch<ReadonlySet<VoidFunction>>) => void,
): void => {
  if (scheduledListeners == null) {
    scheduledListeners = new Set()

    execute((listeners) => insertListeners(scheduledListeners!, listeners))

    scheduledListeners.forEach((listener) => listener())

    scheduledListeners = null
  } else {
    execute((listeners) => insertListeners(scheduledListeners!, listeners))
  }
}
