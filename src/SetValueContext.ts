import type { Dispatch } from "react"

const registeredEmitters = new Set<VoidFunction>()
let scheduledListeners: null | Array<Set<VoidFunction>> = null

const runListeners = (listeners: Array<Set<VoidFunction>>): void => {
  const calledListeners = new WeakSet<VoidFunction>()

  listeners.forEach((bag) => {
    bag.forEach((listener) => {
      // don't emit the same listener twice, for instance when using `useWatchImpulse`
      if (!calledListeners.has(listener)) {
        // the listener might register watchers (for useWatchImpulse)
        // so each watcher will emit only once in the code bellow
        // even if there were multiple watching stores updated
        listener()
        calledListeners.add(listener)
      }
    })
  })
}

const runEmitters = (): void => {
  registeredEmitters.forEach((emit) => emit())
  registeredEmitters.clear()
}

export const scheduleEmit = (
  execute: (register: Dispatch<Set<VoidFunction>>) => void,
): void => {
  if (scheduledListeners != null) {
    execute((listeners) => scheduledListeners!.push(listeners))
  } else {
    scheduledListeners = []

    execute((listeners) => scheduledListeners!.push(listeners))

    runListeners(scheduledListeners)
    runEmitters()

    scheduledListeners = null
  }
}

export const registerEmitter = (emitter: VoidFunction): void => {
  registeredEmitters.add(emitter)
}
