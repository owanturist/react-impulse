import { hasProperty } from "~/tools/has-property"
import { isNull } from "~/tools/is-null"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { isStrictEqual } from "~/tools/is-strict-equal"
import { isUndefined } from "~/tools/is-undefined"

import { type Compare, Impulse, untrack } from "../dependencies"
import {
  VALIDATE_ON_INIT,
  VALIDATE_ON_TOUCH,
  type ValidateStrategy,
} from "../validate-strategy"
import type { ZodLikeSchema } from "../zod-like-schema"

import { createUnionCompare } from "./_create-union-compare"
import type { ImpulseFormUnit as ImpulseFormUnitImpl } from "./_impulse-form-unit"
import { ImpulseFormUnitState } from "./_impulse-form-unit-state"
import {
  type ImpulseFormUnitTransform,
  transformFromInput,
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
  readonly error?: null | TError

  readonly touched?: boolean

  /**
   * PERFORMANCE OPTIMIZATION
   *
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
  readonly isInputEqual?: Compare<TInput>

  /**
   * BUSINESS LOGIC TUNING
   *
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
  readonly isInputDirty?: Compare<TInput>

  /**
   * PERFORMANCE OPTIMIZATION
   *
   * A compare function that determines whether the validation error change.
   * When it does, the ImpulseFormUnit#getError returns the new value.
   * Otherwise, it returns the previous value.
   *
   * Useful for none primitive values such as Objects, Arrays, Date, etc.
   * Intended to improve performance but do not affect business logic.
   *
   * @default Object.is
   */

  readonly isErrorEqual?: Compare<TError>

  /**
   * @default input
   */
  readonly initial?: TInput
}

export interface ImpulseFormUnitTransformedOptions<
  TInput,
  TError = null,
  TOutput = TInput,
> extends Omit<ImpulseFormUnitOptions<TInput, TError>, "isOutputEqual"> {
  readonly transform: ImpulseFormUnitTransformer<TInput, TOutput>

  /**
   * PERFORMANCE OPTIMIZATION
   *
   * A compare function that determines whether the output value changes.
   * When it does, the ImpulseFormUnit#getOutput returns the new value.
   *
   * Useful for none primitive values such as Objects, Arrays, Date, etc.
   * Intended to improve performance but do not affect business logic.
   *
   * @default Object.is
   */
  readonly isOutputEqual?: Compare<TOutput>
}

export interface ImpulseFormUnitSchemaOptions<TInput, TOutput = TInput>
  extends Omit<
    ImpulseFormUnitTransformedOptions<TInput, ReadonlyArray<string>, TOutput>,
    "transform" | "isErrorEqual"
  > {
  /**
   * @default "onTouch"
   */
  readonly validateOn?: ValidateStrategy

  readonly schema: ZodLikeSchema<TOutput>
}

export interface ImpulseFormUnitValidatedOptions<
  TInput,
  TError = null,
  TOutput = TInput,
> extends Omit<
    ImpulseFormUnitTransformedOptions<TInput, TError, TOutput>,
    "transform"
  > {
  /**
   * @default "onTouch"
   */
  readonly validateOn?: ValidateStrategy

  readonly validate: ImpulseFormUnitValidator<TInput, TError, TOutput>
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

export function ImpulseFormUnit<TInput>(
  input: TInput,
  options?: ImpulseFormUnitOptions<TInput>,
): ImpulseFormUnit<TInput, null, TInput>

export function ImpulseFormUnit<TInput, TError>(
  input: TInput,
  options?: ImpulseFormUnitOptions<TInput, TError>,
): ImpulseFormUnit<TInput, TError, TInput>

export function ImpulseFormUnit<TInput, TError = null, TOutput = TInput>(
  input_: TInput,
  options?:
    | ImpulseFormUnitOptions<TInput, TError>
    | ImpulseFormUnitTransformedOptions<TInput, TError, TOutput>
    | ImpulseFormUnitSchemaOptions<TInput, TOutput>
    | ImpulseFormUnitValidatedOptions<TInput, TError, TOutput>,
):
  | ImpulseFormUnit<TInput, TError>
  | ImpulseFormUnit<TInput, ReadonlyArray<string>, TOutput>
  | ImpulseFormUnit<TInput, TError, TOutput> /* enforce syntax highlight */ {
  const isInputEqual = options?.isInputEqual ?? isStrictEqual
  const isInputDirty =
    options?.isInputDirty ??
    ((left, right, scope) => !isInputEqual(left, right, scope))

  const input = Impulse(input_, { compare: isInputEqual })

  const initial = Impulse({
    _explicit: Impulse(!isUndefined(options?.initial)),
    _current: Impulse(
      untrack((scope) => {
        const initialOrInput = options?.initial ?? input_

        return isInputEqual(initialOrInput, input_, scope)
          ? input_
          : initialOrInput
      }),
      {
        compare: isInputEqual,
      },
    ),
  })

  const touched = Impulse(options?.touched ?? false)

  if (hasProperty(options, "schema")) {
    const transform = transformFromSchema<TInput, TOutput>(options.schema)
    const isErrorEqual = createUnionCompare(isNull, isShallowArrayEqual)
    const isOutputEqual = createUnionCompare<null, TOutput>(
      isNull,
      options.isOutputEqual ?? isStrictEqual,
    )

    return new ImpulseFormUnitState(
      null,
      initial,
      input,
      Impulse(options.error ?? null, { compare: isErrorEqual }),
      Impulse(options.validateOn ?? VALIDATE_ON_TOUCH),
      touched,
      Impulse(transform),
      isInputDirty,
      isInputEqual,
      isOutputEqual,
      isErrorEqual,
    )._host()
  }

  const isErrorEqual = createUnionCompare<null, TError>(
    isNull,
    options?.isErrorEqual ?? isStrictEqual,
  )
  const error = Impulse<null | TError>(options?.error ?? null, {
    compare: isErrorEqual,
  })

  if (hasProperty(options, "validate")) {
    const transform = transformFromValidator(options.validate)
    const isOutputEqual = createUnionCompare<null, TOutput>(
      isNull,
      options.isOutputEqual ?? isStrictEqual,
    )

    return new ImpulseFormUnitState(
      null,
      initial,
      input,
      error,
      Impulse(options.validateOn ?? VALIDATE_ON_TOUCH),
      touched,
      Impulse(transform),
      isInputDirty,
      isInputEqual,
      isOutputEqual,
      isErrorEqual,
    )._host()
  }

  if (hasProperty(options, "transform")) {
    const transform = transformFromTransformer(options.transform)
    const isOutputEqual = createUnionCompare<null, TOutput>(
      isNull,
      options.isOutputEqual ?? isStrictEqual,
    )

    return new ImpulseFormUnitState(
      null,
      initial,
      input,
      error,
      Impulse<ValidateStrategy>(VALIDATE_ON_INIT),
      touched,
      Impulse(transform as ImpulseFormUnitTransform<TInput, TError, TOutput>),
      isInputDirty,
      isInputEqual,
      isOutputEqual,
      isErrorEqual,
    )._host()
  }

  return new ImpulseFormUnitState(
    null,
    initial,
    input,
    error,
    Impulse<ValidateStrategy>(VALIDATE_ON_INIT),
    touched,
    Impulse(
      transformFromInput as ImpulseFormUnitTransform<TInput, TError, TInput>,
    ),
    isInputDirty,
    isInputEqual,
    createUnionCompare(isNull, isInputEqual),
    isErrorEqual,
  )._host()
}
