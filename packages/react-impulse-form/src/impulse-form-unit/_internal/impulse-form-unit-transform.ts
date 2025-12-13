import type { FormUnitTransformer } from "../impulse-form-unit-transformer"
import type { FormUnitValidator } from "../impulse-form-unit-validator"

import { type ZodLikeSchema, zodLikeParse } from "./zod-like-schema"

interface FormUnitTransform<TInput, TError, TOutput> {
  readonly _transformer: boolean
  readonly _validator: FormUnitValidator<TInput, TError, TOutput>
}

const transformFromInput = {
  _transformer: true,
  _validator: (input) => [null, input],
} satisfies FormUnitTransform<unknown, never, unknown>

function transformFromTransformer<TInput, TOutput>(
  transformer: FormUnitTransformer<TInput, TOutput>,
): FormUnitTransform<TInput, never, TOutput> {
  return {
    _transformer: true,
    _validator: (input) => [null, transformer(input)],
  }
}

function transformFromValidator<TInput, TError, TOutput>(
  validator: FormUnitValidator<TInput, TError, TOutput>,
): FormUnitTransform<TInput, TError, TOutput> {
  return {
    _transformer: false,
    _validator: validator,
  }
}

function transformFromSchema<TInput, TOutput>(
  schema: ZodLikeSchema<TOutput>,
): FormUnitTransform<TInput, ReadonlyArray<string>, TOutput> {
  return {
    _transformer: false,
    _validator: (input) => zodLikeParse(schema, input),
  }
}

export type { FormUnitTransform }
export { transformFromInput, transformFromTransformer, transformFromValidator, transformFromSchema }
