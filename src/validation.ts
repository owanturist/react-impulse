import { isFunction } from "./utils"

type EXECUTION_CONTEXT = "subscribe" | "scoped" | "useScoped" | "useScopedMemo"

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

export function warnInsideContext(context: EXECUTION_CONTEXT, message: string) {
  return (
    _: unknown,
    __: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor: TypedPropertyDescriptor<(...args: Array<never>) => any>,
  ): void => {
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

export function stopInsideContext(context: EXECUTION_CONTEXT, message: string) {
  return (
    _: unknown,
    __: string,
    descriptor: TypedPropertyDescriptor<(...args: Array<never>) => void>,
  ): void => {
    const original = descriptor.value!

    descriptor.value = function (...args) {
      if (context !== currentExecutionContext) {
        original.apply(this, args)
      } else if (
        process.env.NODE_ENV !== "production" &&
        typeof console !== "undefined" &&
        // eslint-disable-next-line no-console
        isFunction(console.error)
      ) {
        // eslint-disable-next-line no-console
        console.error(message)
      }
    }
  }
}
