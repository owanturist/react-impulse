import { isFunction } from "./utils"

export type WarningSource =
  | "useScoped"
  | "useScopedMemo"
  | "scoped"
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
  useScoped: makeHookWarningMessage("useScoped", options),
  useScopedMemo: makeHookWarningMessage("useScopedMemo", options),
  scoped: makeWatchWarningMessage(options),
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

// TODO come up with better type name
export type NAMES = "subscribe" | "scoped" | "useScoped" | "useScopedMemo"

let currentName: null | NAMES = null

export function warnContext<TArgs extends ReadonlyArray<unknown>, TResult>(
  name: NAMES,
  func: (...args: TArgs) => TResult,
  ...args: TArgs
): TResult {
  const prev = currentName

  currentName = name

  const result = func(...args)

  currentName = prev

  return result
}

export function warnOn(
  name: NAMES,
  message: string,
  { isBreaking }: { isBreaking?: boolean } = {},
) {
  return (_target: unknown, _key: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as (
      ...args: ReadonlyArray<unknown>
    ) => unknown

    descriptor.value = function (...args: Array<unknown>) {
      if (name !== currentName) {
        return original.apply(this, args)
      }

      if (
        process.env.NODE_ENV !== "production" &&
        typeof console !== "undefined" &&
        // eslint-disable-next-line no-console
        isFunction(console.error)
      ) {
        // eslint-disable-next-line no-console
        console.error(message)
      }

      if (!isBreaking) {
        return original.apply(this, args)
      }
    }
  }
}
