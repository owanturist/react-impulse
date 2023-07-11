import { Func, isFunction } from "./utils"

export type ExecutionContext =
  | "subscribe"
  | "watch"
  | "useWatchImpulse"
  | "useImpulseMemo"

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

class Validate<TContext extends ExecutionContext> {
  public constructor(
    private readonly spec: ReadonlyMap<ExecutionContext, string>,
  ) {}

  public on<TName extends TContext>(
    name: TName,
    message: string,
  ): Validate<Exclude<ExecutionContext, TName>> {
    return new Validate(new Map(this.spec).set(name, message))
  }

  public alert() {
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
      const spec = this.spec

      descriptor.value = function (...args) {
        const message =
          currentExecutionContext && spec.get(currentExecutionContext)

        if (message) {
          // eslint-disable-next-line no-console
          console.error(message)
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return original.apply(this, args)
      }
    }
  }

  public prevent(): (_: unknown, __: string, descriptor: PropDescriptor) => void
  public prevent<TReturn>(
    returns: TReturn,
  ): (_: unknown, __: string, descriptor: PropDescriptor<TReturn>) => void
  public prevent<TReturn = void>(returns?: TReturn) {
    return (
      _: unknown,
      __: string,
      descriptor: PropDescriptor<undefined | TReturn>,
    ): void => {
      const original = descriptor.value!
      const spec = this.spec

      descriptor.value = function (...args) {
        const message =
          currentExecutionContext && spec.get(currentExecutionContext)

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
}

export const validate = new Validate(new Map())
