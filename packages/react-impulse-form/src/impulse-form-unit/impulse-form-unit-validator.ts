import type { Result } from "../result"

export type ImpulseFormUnitValidator<TInput, TError, TOutput> = (
  input: TInput,
) => Result<TError, TOutput>
