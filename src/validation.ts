import { Func, isFunction } from "./utils"

export type ExecutionContext =
  | "subscribe"
  | "watch"
  | "useWatchImpulse"
  | "useImpulseMemo"

export type ExecutionContextSpec = Partial<Record<ExecutionContext, string>>

let currentExecutionContext: null | ExecutionContext = null

export function defineExecutionContext<
  TArgs extends ReadonlyArray<unknown>,
  TResult,
>(
  name: ExecutionContext,
  execute: Func<TArgs, TResult>,
  ...args: TArgs
): TResult {
  const prev = currentExecutionContext

  currentExecutionContext = name

  const result = execute(...args)

  currentExecutionContext = prev

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PropDescriptor<TReturn = any> = TypedPropertyDescriptor<
  Func<Array<never>, TReturn>
>

export function alertCallingFrom(spec: ExecutionContextSpec) {
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
      const message = currentExecutionContext && spec[currentExecutionContext]

      if (message) {
        // eslint-disable-next-line no-console
        console.error(message)
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return original.apply(this, args)
    }
  }
}

export function preventCallingFrom(
  spec: ExecutionContextSpec,
): (_: unknown, __: string, descriptor: PropDescriptor) => void
export function preventCallingFrom<TReturn>(
  spec: ExecutionContextSpec,
  returns: TReturn,
): (_: unknown, __: string, descriptor: PropDescriptor<TReturn>) => void
export function preventCallingFrom<TReturn = void>(
  spec: ExecutionContextSpec,
  returns?: TReturn,
) {
  return (
    _: unknown,
    __: string,
    descriptor: PropDescriptor<undefined | TReturn>,
  ): void => {
    const original = descriptor.value!

    descriptor.value = function (...args) {
      const message = currentExecutionContext && spec[currentExecutionContext]

      if (message == null) {
        return original.apply(this, args)
      }

      if (
        process.env.NODE_ENV !== "production" &&
        typeof console !== "undefined" &&
        // eslint-disable-next-line no-console
        isFunction(console.error) &&
        // don't print empty message
        message
      ) {
        // eslint-disable-next-line no-console
        console.error(message)
      }

      return returns
    }
  }
}
