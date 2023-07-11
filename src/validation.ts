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
type ValidateDecorator<TReturn = any> = (
  target: unknown,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<Func<Array<never>, TReturn>>,
) => void

class Validate<TContext extends ExecutionContext> {
  public constructor(
    private readonly spec: ReadonlyMap<ExecutionContext, string>,
  ) {}

  public when<TName extends TContext>(
    name: TName,
    message: string,
  ): Validate<Exclude<ExecutionContext, TName>> {
    return new Validate(new Map(this.spec).set(name, message))
  }

  public alert(): ValidateDecorator {
    return (_, __, descriptor) => {
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

  public prevent(): ValidateDecorator
  public prevent<TReturn>(returns: TReturn): ValidateDecorator<TReturn>
  public prevent<TReturn = void>(
    returns?: TReturn,
  ): ValidateDecorator<undefined | TReturn> {
    return (_, __, descriptor) => {
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
