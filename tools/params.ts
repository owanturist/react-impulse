export function params<TArgs extends ReadonlyArray<unknown>>(
  ...args: TArgs
): TArgs {
  return args
}

params._first = <T>(first: T): T => first
params._second = <T>(_first: unknown, second: T): T => second
params._third = <T>(_first: unknown, _second: unknown, third: T): T => third
