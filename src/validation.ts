export type WarningSource = "useWatchImpulse" | "useImpulseMemo" | "watch"

export type WarningSet = Record<WarningSource, null | string>

interface MakeHookWarningOptions {
  isWatchAffected: boolean
  isCritical: boolean
  whatItDoes: string
  method: string
}

const makeHookWarningMessage = (
  hook: string,
  { isCritical, whatItDoes, method }: MakeHookWarningOptions,
): string => {
  const verb = isCritical ? "may" : "should"

  return `You ${verb} not call ${method} inside of the ${hook} callback. The ${hook} hook is for read-only operations but ${method} ${whatItDoes}.`
}

const makeWarningSet = (options: MakeHookWarningOptions): WarningSet => ({
  useWatchImpulse: makeHookWarningMessage("useWatchImpulse(watcher)", options),
  useImpulseMemo: makeHookWarningMessage("useImpulseMemo(factory)", options),
  watch: options.isWatchAffected
    ? `You may not call ${options.method} during rendering of watch(Component)`
    : null,
})

export const WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING = makeWarningSet({
  method: "Impulse#of",
  whatItDoes: "creates a new store",
  isCritical: false,
  isWatchAffected: false,
})

export const WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING = makeWarningSet({
  method: "Impulse#clone",
  whatItDoes: "creates a new store",
  isCritical: false,
  isWatchAffected: false,
})

export const WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING = makeWarningSet({
  method: "Impulse#setState",
  whatItDoes: "changes an existing store",
  isCritical: true,
  isWatchAffected: true,
})

export const WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING = makeWarningSet({
  method: "Impulse#subscribe",
  whatItDoes: "subscribes to a store",
  isCritical: true,
  isWatchAffected: true,
})
