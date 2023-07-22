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
  /*@__MANGLE_PROP__*/
  private readonly spec: ReadonlyMap<ExecutionContext, string> = new Map()

  public constructor(spec: ReadonlyMap<ExecutionContext, string>) {
    this.spec = spec
  }

  /*@__MANGLE_PROP__*/
  private getMessage(): null | undefined | string {
    return currentExecutionContext && this.spec.get(currentExecutionContext)
  }

  /*@__MANGLE_PROP__*/
  private print(message: string): void {
    if (
      typeof console !== "undefined" &&
      // eslint-disable-next-line no-console
      isFunction(console.error) &&
      // don't print empty messages
      /* c8 ignore next */
      message
    ) {
      // eslint-disable-next-line no-console
      console.error(message)
    }
  }

  /*@__MANGLE_PROP__*/
  public when<TName extends TContext>(
    name: TName,
    message: string,
  ): Validate<Exclude<ExecutionContext, TName>> {
    return new Validate(new Map(this.spec).set(name, message))
  }

  /*@__MANGLE_PROP__*/
  public alert(): ValidateDecorator {
    return (_, __, descriptor) => {
      if (process.env.NODE_ENV === "production") {
        /* c8 ignore next */
        return
      }

      const original = descriptor.value!
      const that = this

      descriptor.value = function (...args) {
        const message = that.getMessage()

        if (message) {
          that.print(message)
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return original.apply(this, args)
      }
    }
  }

  public prevent(): ValidateDecorator
  public prevent<TReturn>(returns: TReturn): ValidateDecorator<TReturn>
  /*@__MANGLE_PROP__*/
  public prevent<TReturn = void>(
    returns?: TReturn,
  ): ValidateDecorator<undefined | TReturn> {
    return (_, __, descriptor) => {
      const original = descriptor.value!
      const that = this

      descriptor.value = function (...args) {
        const message = that.getMessage()

        if (message == null) {
          return original.apply(this, args)
        }

        if (process.env.NODE_ENV !== "production") {
          that.print(message)
        }

        return returns
      }
    }
  }
}

export const validate = new Validate(new Map())
