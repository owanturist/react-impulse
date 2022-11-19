export type WarningSource = "useWatchSweety" | "useSweetyMemo" | "watch"

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
  useWatchSweety: makeHookWarningMessage("useWatchSweety(watcher)", options),
  useSweetyMemo: makeHookWarningMessage("useSweetyMemo(factory)", options),
  watch: options.isWatchAffected
    ? `You may not call ${options.method} during rendering of watch(Component)`
    : null,
})

export const WARNING_MESSAGE_CALLING_OF_WHEN_WATCHING = makeWarningSet({
  method: "Sweety#of",
  whatItDoes: "creates a new store",
  isCritical: false,
  isWatchAffected: false,
})

export const WARNING_MESSAGE_CALLING_CLONE_WHEN_WATCHING = makeWarningSet({
  method: "Sweety#clone",
  whatItDoes: "creates a new store",
  isCritical: false,
  isWatchAffected: false,
})

export const WARNING_MESSAGE_CALLING_SET_STATE_WHEN_WATCHING = makeWarningSet({
  method: "Sweety#setState",
  whatItDoes: "changes an existing store",
  isCritical: true,
  isWatchAffected: true,
})

export const WARNING_MESSAGE_CALLING_SUBSCRIBE_WHEN_WATCHING = makeWarningSet({
  method: "Sweety#subscribe",
  whatItDoes: "subscribes to a store",
  isCritical: true,
  isWatchAffected: true,
})