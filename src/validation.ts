import { isFunction } from "./utils"

type EXECUTION_CONTEXT =
  | "subscribe"
  | "watch"
  | "useWatchImpulse"
  | "useImpulseMemo"

let currentExecutionContext: null | EXECUTION_CONTEXT = null

export function registerExecutionContext<
  TArgs extends ReadonlyArray<unknown>,
  TResult,
>(
  name: EXECUTION_CONTEXT,
  func: (...args: TArgs) => TResult,
  ...args: TArgs
): TResult {
  const prev = currentExecutionContext

  currentExecutionContext = name

  const result = func(...args)

  currentExecutionContext = prev

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PropDescriptor<TReturn = any> = TypedPropertyDescriptor<
  (...args: Array<never>) => TReturn
>

export function warnInsideContext(context: EXECUTION_CONTEXT, message: string) {
  return (_: unknown, __: string, descriptor: PropDescriptor): void => {
    if (
      process.env.NODE_ENV === "production" ||
      typeof console === "undefined" ||
      // eslint-disable-next-line no-console
      !isFunction(console.error)
    ) {
      /* c8 ignore next */
      return
    }

    const original = descriptor.value!

    descriptor.value = function (...args) {
      if (context === currentExecutionContext) {
        // eslint-disable-next-line no-console
        console.error(message)
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return original.apply(this, args)
    }
  }
}

export function stopInsideContext(
  context: EXECUTION_CONTEXT,
  message: string,
): (_: unknown, __: string, descriptor: PropDescriptor) => void
export function stopInsideContext<TReturn>(
  context: EXECUTION_CONTEXT,
  message: string,
  returns: TReturn,
): (_: unknown, __: string, descriptor: PropDescriptor<TReturn>) => void
export function stopInsideContext<TReturn = void>(
  context: EXECUTION_CONTEXT,
  message: string,
  returns?: TReturn,
) {
  return (
    _: unknown,
    __: string,
    descriptor: PropDescriptor<undefined | TReturn>,
  ): void => {
    const original = descriptor.value!

    descriptor.value = function (...args) {
      if (context !== currentExecutionContext) {
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

        return returns
      }
    }
  }
}
