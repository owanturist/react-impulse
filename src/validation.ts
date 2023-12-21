import { type Func, isFunction } from "./utils"

export type ExecutionContext = "scoped" | "useScoped" | "useScopedMemo"

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
    private readonly _spec: ReadonlyMap<ExecutionContext, string>,
  ) {}

  private _getMessage(): null | undefined | string {
    return currentExecutionContext && this._spec.get(currentExecutionContext)
  }

  private _print(message: string): void {
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

  public _when<TName extends TContext>(
    name: TName,
    message: string,
  ): Validate<Exclude<ExecutionContext, TName>> {
    return new Validate(new Map(this._spec).set(name, message))
  }

  public _alert(): ValidateDecorator {
    return (_, __, descriptor) => {
      /* c8 ignore next 3 */
      if (process.env.NODE_ENV === "production") {
        return
      }

      const original = descriptor.value!
      const that = this

      descriptor.value = function (...args) {
        const message = that._getMessage()

        if (message) {
          that._print(message)
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return original.apply(this, args)
      }
    }
  }

  public _prevent(): ValidateDecorator
  public _prevent<TReturn>(returns: TReturn): ValidateDecorator<TReturn>
  public _prevent<TReturn = void>(
    returns?: TReturn,
  ): ValidateDecorator<undefined | TReturn> {
    return (_, __, descriptor) => {
      const original = descriptor.value!
      const that = this

      descriptor.value = function (...args) {
        const message = that._getMessage()

        if (message == null) {
          return original.apply(this, args)
        }

        if (process.env.NODE_ENV !== "production") {
          that._print(message)
        }

        return returns
      }
    }
  }
}

export const validate = new Validate(new Map())
