import type { Result } from "../result"

type ImpulseFormUnitValidator<TInput, TError, TOutput> = (input: TInput) => Result<TError, TOutput>

export type { ImpulseFormUnitValidator }
