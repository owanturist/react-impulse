import { hasProperty } from "~/tools/has-property"
import { isNull } from "~/tools/is-null"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { isStrictEqual } from "~/tools/is-strict-equal"

import { type Compare, Impulse, type Scope, untrack } from "../dependencies"
import { VALIDATE_ON_TOUCH, type ValidateStrategy } from "../validate-strategy"
import type { ZodLikeSchema } from "../zod-like-schema"

import { ImpulseFormUnit as ImpulseFormUnitImpl } from "./_impulse-form-unit"
import {
  type ImpulseFormUnitTransform,
  transformFromSchema,
  transformFromTransformer,
  transformFromValidator,
} from "./_impulse-form-unit-transform"
import type { ImpulseFormUnitTransformer } from "./impulse-form-unit-transformer"
import type { ImpulseFormUnitValidator } from "./impulse-form-unit-validator"

export type ImpulseFormUnit<
  TInput,
  TError = null,
  TOutput = TInput,
> = ImpulseFormUnitImpl<TInput, TError, TOutput>

export interface ImpulseFormUnitOptions<TInput, TError = null> {
  /**
   * The initial or custom error associated with the form value.
   * This can be used to set an error state manually.
   *
   * @default null
   */
  error?: null | TError

  touched?: boolean

  /**
   * A compare function that determines whether the input value changes.
   * When it does, the ImpulseFormUnit#getInput returns the new value.
   * Otherwise, it returns the previous value.
   *
   * Useful for none primitive values such as Objects, Arrays, Date, etc.
   * Intended to improve performance but do not affect business logic.
   *
   * @default Object.is
   *
   * @example
   * const initial = { count: 0 }
   *
   * const form = ImpulseFormUnit(initial, {
   *   isInputEqual: (left, right) => left.count === right.count,
   * })
   *
   * form.setInput({ count: 0 })
   * form.getInput(scope) === initial // true
   */
  isInputEqual?: Compare<TInput>

  /**
   * A compare function that determines whether the input is dirty.
   * When it is, the ImpulseFormUnit#isDirty returns true.
   * Fallbacks to not(isInputEqual) if not provided.
   *
   * Useful for values that have intermediate states deviating from the initial value,
   * but should not be considered dirty such as strings, unsorted arrays, etc.
   * Intended to tune business logic and avoid false positives for dirty states.
   *
   * @default not(isInputEqual)
   *
   * @example
   * const form = ImpulseFormUnit("", {
   *   isInputDirty: (left, right) => left.trim() !== right.trim(),
   * })
   *
   * form.setInput(" ")
   * form.isDirty(scope) === false
   */
  isInputDirty?: Compare<TInput>

  /**
   * A compare function that determines whether the validation error change.
   * When it does, the ImpulseFormUnit#getError returns the new value.
   * Otherwise, it returns the previous value.
   *
   * Useful for none primitive values such as Objects, Arrays, Date, etc.
   * Intended to improve performance but do not affect business logic.
   *
   * @default Object.is
   */

  isErrorEqual?: Compare<TError>

  /**
   * @default input
   */
  initial?: TInput
}

export interface ImpulseFormUnitTransformedOptions<
  TInput,
  TError = null,
  TOutput = TInput,
> extends ImpulseFormUnitOptions<TInput, TError> {
  transform: ImpulseFormUnitTransformer<TInput, TOutput>
}

export interface ImpulseFormUnitSchemaOptions<TInput, TOutput = TInput>
  extends Omit<
    ImpulseFormUnitOptions<TInput, ReadonlyArray<string>>,
    "isErrorEqual"
  > {
  /**
   * @default "onTouch"
   */
  validateOn?: ValidateStrategy

  schema: ZodLikeSchema<TOutput>
}

export interface ImpulseFormUnitValidatedOptions<
  TInput,
  TError = null,
  TOutput = TInput,
> extends ImpulseFormUnitOptions<TInput, TError> {
  /**
   * @default "onTouch"
   */
  validateOn?: ValidateStrategy

  validate: ImpulseFormUnitValidator<TInput, TError, TOutput>
}

export function ImpulseFormUnit<TInput, TError = null, TOutput = TInput>(
  input: TInput,
  options:
    | ImpulseFormUnitValidatedOptions<TInput, TError, TOutput>
    | ImpulseFormUnitTransformedOptions<TInput, TError, TOutput>,
): ImpulseFormUnit<TInput, TError, TOutput>

export function ImpulseFormUnit<TInput, TOutput = TInput>(
  input: TInput,
  options: ImpulseFormUnitSchemaOptions<TInput, TOutput>,
): ImpulseFormUnit<TInput, ReadonlyArray<string>, TOutput>

export function ImpulseFormUnit<TInput, TError = null>(
  input: TInput,
  options?: ImpulseFormUnitOptions<TInput, TError>,
): ImpulseFormUnit<TInput, TError, TInput>

export function ImpulseFormUnit<TInput, TError = null, TOutput = TInput>(
  input: TInput,
  options?:
    | ImpulseFormUnitOptions<TInput, TError>
    | ImpulseFormUnitTransformedOptions<TInput, TError, TOutput>
    | ImpulseFormUnitSchemaOptions<TInput, TOutput>
    | ImpulseFormUnitValidatedOptions<TInput, TError, TOutput>,
):
  | ImpulseFormUnit<TInput, TError>
  | ImpulseFormUnit<TInput, ReadonlyArray<string>, TOutput>
  | ImpulseFormUnit<TInput, TError, TOutput> /* enforce syntax highlight */ {
  const touched = options?.touched ?? false

  const isInputEqual = options?.isInputEqual ?? isStrictEqual
  const isInputDirty =
    options?.isInputDirty ??
    ((left, right, scope) => !isInputEqual(left, right, scope))

  const isExplicitInitial = hasProperty(options, "initial")
  const initial = isExplicitInitial ? options.initial! : input
  const inputOrInitial = untrack((scope) => {
    return isInputEqual(initial, input, scope) ? initial : input
  })

  if (hasProperty(options, "schema")) {
    return new ImpulseFormUnitImpl<TInput, ReadonlyArray<string>, TOutput>(
      null,
      Impulse(),
      Impulse(touched),
      Impulse(options.validateOn ?? VALIDATE_ON_TOUCH),
      Impulse(options.error ?? null, {
        compare: createErrorImpulseCompare(isShallowArrayEqual),
      }),
      Impulse(isExplicitInitial),
      Impulse(initial, { compare: isInputEqual }),
      Impulse(inputOrInitial, { compare: isInputEqual }),
      Impulse<
        | undefined
        | ImpulseFormUnitTransform<TInput, ReadonlyArray<string>, TOutput>
      >(transformFromSchema(options.schema)),
      isInputEqual,
      isInputDirty,
    )
  }

  const isErrorEqual = createErrorImpulseCompare<TError>(
    options?.isErrorEqual ?? isStrictEqual,
  )

  if (hasProperty(options, "validate")) {
    return new ImpulseFormUnitImpl<TInput, TError, TOutput>(
      null,
      Impulse(),
      Impulse(touched),
      Impulse(options.validateOn ?? VALIDATE_ON_TOUCH),
      Impulse<null | TError>(options.error ?? null, { compare: isErrorEqual }),
      Impulse(isExplicitInitial),
      Impulse(initial, { compare: isInputEqual }),
      Impulse(inputOrInitial, { compare: isInputEqual }),
      Impulse<undefined | ImpulseFormUnitTransform<TInput, TError, TOutput>>(
        transformFromValidator(options.validate),
      ),
      isInputEqual,
      isInputDirty,
    )
  }

  if (hasProperty(options, "transform")) {
    return new ImpulseFormUnitImpl<TInput, TError, TOutput>(
      null,
      Impulse(),
      Impulse(touched),
      Impulse<ValidateStrategy>(VALIDATE_ON_TOUCH),
      Impulse<null | TError>(options.error ?? null, { compare: isErrorEqual }),
      Impulse(isExplicitInitial),
      Impulse(initial, { compare: isInputEqual }),
      Impulse(inputOrInitial, { compare: isInputEqual }),
      Impulse<undefined | ImpulseFormUnitTransform<TInput, TError, TOutput>>(
        transformFromTransformer(options.transform),
      ),
      isInputEqual,
      isInputDirty,
    )
  }

  return new ImpulseFormUnitImpl<TInput, TError>(
    null,
    Impulse(),
    Impulse(touched),
    Impulse<ValidateStrategy>(VALIDATE_ON_TOUCH),
    Impulse<null | TError>(options?.error ?? null, { compare: isErrorEqual }),
    Impulse(isExplicitInitial),
    Impulse(initial, { compare: isInputEqual }),
    Impulse(inputOrInitial, { compare: isInputEqual }),
    Impulse(),
    isInputEqual,
    isInputDirty,
  )
}

function createErrorImpulseCompare<TError>(compare: Compare<TError>) {
  return (left: null | TError, right: null | TError, scope: Scope) => {
    if (isNull(left) || isNull(right)) {
      // null === null -> true
      // null === unknown -> false
      // unknown === null -> false
      return left === right
    }

    return compare(left, right, scope)
  }
}
