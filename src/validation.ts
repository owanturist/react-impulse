export type WarningSource =
  | "useWatchImpulse"
  | "useImpulseMemo"
  | "watch"
  | "subscribe"

export type WarningSet = Record<WarningSource, null | string>

interface MakeWarningOptions {
  isWatchAffected: boolean
  isSubscribeAffected: boolean
  isCritical: boolean
  whatItDoes: string
  method: string
}

const makeHookWarningMessage = (
  hook: string,
  { isCritical, whatItDoes, method }: MakeWarningOptions,
): string => {
  const verb = isCritical ? "may" : "should"

  return `You ${verb} not call ${method} inside of the ${hook} callback. The ${hook} hook is for read-only operations but ${method} ${whatItDoes}.`
}

const makeWatchWarningMessage = ({
  isWatchAffected,
  isCritical,
  method,
}: MakeWarningOptions): null | string => {
  if (!isWatchAffected) {
    return null
  }

  const verb = isCritical ? "may" : "should"

  return `You ${verb} not call ${method} during rendering of watch(Component)`
}

const makeSubscribeWarningMessage = ({
  isSubscribeAffected,
  isCritical,
  method,
  whatItDoes,
}: MakeWarningOptions): null | string => {
  if (!isSubscribeAffected) {
    return null
  }

  const verb = isCritical ? "may" : "should"

  return `You ${verb} not call ${method} inside of the subscribe listener. The listener is for read-only operations but ${method} ${whatItDoes}.`
}

const makeWarningSet = (options: MakeWarningOptions): WarningSet => ({
  useWatchImpulse: makeHookWarningMessage("useWatchImpulse(watcher)", options),
  useImpulseMemo: makeHookWarningMessage("useImpulseMemo(factory)", options),
  watch: makeWatchWarningMessage(options),
  subscribe: makeSubscribeWarningMessage(options),
})

export const WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING = makeWarningSet({
  method: "Impulse#of",
  whatItDoes: "creates a new Impulse",
  isCritical: false,
  isWatchAffected: false,
  isSubscribeAffected: true,
})

export const WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING = makeWarningSet({
  method: "Impulse#clone",
  whatItDoes: "clones an existing Impulse",
  isCritical: false,
  isWatchAffected: false,
  isSubscribeAffected: true,
})

export const WARNING_MESSAGE_CALLING_SET_VALUE_WHEN_WATCHING = makeWarningSet({
  method: "Impulse#setValue",
  whatItDoes: "changes an existing Impulse",
  isCritical: true,
  isWatchAffected: true,
  isSubscribeAffected: false,
})

export const WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING = makeWarningSet({
  method: "Impulse#subscribe",
  whatItDoes: "subscribes to an Impulse",
  isCritical: true,
  isWatchAffected: true,
  isSubscribeAffected: true,
})
