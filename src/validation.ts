export type WarningSource = "useWatchSweety" | "useSweetyMemo"

export type WarningSet = Record<WarningSource, string>

interface MakeWarningOptions {
  isCritical: boolean
  whatItDoes: string
  method: string
}

const makeWarningMessage = (
  hook: string,
  { isCritical, whatItDoes, method }: MakeWarningOptions,
): string => {
  const verb = isCritical ? "may" : "should"

  return `You ${verb} not call ${method} inside of the ${hook} callback. The ${hook} hook is for read-only operations but ${method} ${whatItDoes}.`
}

const makeWarningSet = (options: MakeWarningOptions): WarningSet => ({
  useWatchSweety: makeWarningMessage("useWatchSweety(watcher)", options),
  useSweetyMemo: makeWarningMessage("useSweetyMemo(factory)", options),
})

export const WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING = makeWarningSet({
  method: "Sweety#of",
  whatItDoes: "creates a new store",
  isCritical: false,
})

export const WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING = makeWarningSet({
  method: "Sweety#clone",
  whatItDoes: "creates a new store",
  isCritical: false,
})

export const WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING = makeWarningSet({
  method: "Sweety#setState",
  whatItDoes: "changes an existing store",
  isCritical: true,
})

export const WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING = makeWarningSet({
  method: "Sweety#subscribe",
  whatItDoes: "subscribes to a store",
  isCritical: true,
})
