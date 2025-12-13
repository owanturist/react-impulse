import type { Result } from "../result"

type FormUnitValidator<TInput, TError, TOutput> = (input: TInput) => Result<TError, TOutput>

export type { FormUnitValidator }
