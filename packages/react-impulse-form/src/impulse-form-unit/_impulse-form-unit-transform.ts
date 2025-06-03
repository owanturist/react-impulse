import { type ZodLikeSchema, zodLikeParse } from "../zod-like-schema"

import type { ImpulseFormUnitTransformer } from "./impulse-form-unit-transformer"
import type { ImpulseFormUnitValidator } from "./impulse-form-unit-validator"

export interface ImpulseFormUnitTransform<TInput, TError, TOutput> {
  _transformer: boolean
  _validator: ImpulseFormUnitValidator<TInput, TError, TOutput>
}

export function transformFromTransformer<TInput, TOutput>(
  transformer: ImpulseFormUnitTransformer<TInput, TOutput>,
): ImpulseFormUnitTransform<TInput, never, TOutput> {
  return {
    _transformer: true,
    _validator: (input) => [null, transformer(input)],
  }
}

export function transformFromValidator<TInput, TError, TOutput>(
  validator: ImpulseFormUnitValidator<TInput, TError, TOutput>,
): ImpulseFormUnitTransform<TInput, TError, TOutput> {
  return {
    _transformer: false,
    _validator: validator,
  }
}

export function transformFromSchema<TInput, TOutput>(
  schema: ZodLikeSchema<TOutput>,
): ImpulseFormUnitTransform<TInput, ReadonlyArray<string>, TOutput> {
  return {
    _transformer: false,
    _validator: (input) => zodLikeParse(schema, input),
  }
}
