import type { ImpulseFormUnitTransformer } from "../impulse-form-unit-transformer"
import type { ImpulseFormUnitValidator } from "../impulse-form-unit-validator"

import { type ZodLikeSchema, zodLikeParse } from "./zod-like-schema"

interface ImpulseFormUnitTransform<TInput, TError, TOutput> {
  readonly _transformer: boolean
  readonly _validator: ImpulseFormUnitValidator<TInput, TError, TOutput>
}

const transformFromInput = {
  _transformer: true,
  _validator: (input) => [null, input],
} satisfies ImpulseFormUnitTransform<unknown, never, unknown>

function transformFromTransformer<TInput, TOutput>(
  transformer: ImpulseFormUnitTransformer<TInput, TOutput>,
): ImpulseFormUnitTransform<TInput, never, TOutput> {
  return {
    _transformer: true,
    _validator: (input) => [null, transformer(input)],
  }
}

function transformFromValidator<TInput, TError, TOutput>(
  validator: ImpulseFormUnitValidator<TInput, TError, TOutput>,
): ImpulseFormUnitTransform<TInput, TError, TOutput> {
  return {
    _transformer: false,
    _validator: validator,
  }
}

function transformFromSchema<TInput, TOutput>(
  schema: ZodLikeSchema<TOutput>,
): ImpulseFormUnitTransform<TInput, ReadonlyArray<string>, TOutput> {
  return {
    _transformer: false,
    _validator: (input) => zodLikeParse(schema, input),
  }
}

export type { ImpulseFormUnitTransform }

export { transformFromInput, transformFromTransformer, transformFromValidator, transformFromSchema }
