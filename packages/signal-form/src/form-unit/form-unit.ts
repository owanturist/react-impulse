import { type Equal, Signal } from "@owanturist/signal"

import { hasProperty } from "~/tools/has-property"
import { isNull } from "~/tools/is-null"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { isStrictEqual } from "~/tools/is-strict-equal"
import { isUndefined } from "~/tools/is-undefined"

import type { SignalForm } from "../signal-form/signal-form"
import { VALIDATE_ON_INIT, VALIDATE_ON_TOUCH, type ValidateStrategy } from "../validate-strategy"

import type { FormUnitTransformer } from "./form-unit-transformer"
import type { FormUnitValidator } from "./form-unit-validator"
import { createIsUnionEqual } from "./_internal/create-is-union-equal"
import type { FormUnit as FormUnitImpl } from "./_internal/form-unit"
import { FormUnitState } from "./_internal/form-unit-state"
import {
  type FormUnitTransform,
  transformFromInput,
  transformFromSchema,
  transformFromTransformer,
  transformFromValidator,
} from "./_internal/form-unit-transform"
import type { ZodLikeSchema } from "./_internal/zod-like-schema"

type FormUnit<TInput, TError = null, TOutput = TInput> = FormUnitImpl<TInput, TError, TOutput>

interface FormUnitOptions<TInput, TError = null> {
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
   * A equality check function that determines whether the input value changes.
   * When it does, the {@link SignalForm.getInput} returns the new value.
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
   * const form = FormUnit(initial, {
   *   isInputEqual: (left, right) => left.count === right.count,
   * })
   *
   * form.setInput({ count: 0 })
   * form.getInput(monitor) === initial // true
   */
  readonly isInputEqual?: Equal<TInput>

  /**
   * BUSINESS LOGIC TUNING
   *
   * A equality check function that determines whether the input is dirty.
   * When it is, the {@link SignalForm.isDirty} returns true.
   * Fallbacks to not(isInputEqual) if not provided.
   *
   * Useful for values that have intermediate states deviating from the initial value,
   * but should not be considered dirty such as strings, unsorted arrays, etc.
   * Intended to tune business logic and avoid false positives for dirty states.
   *
   * @default not(isInputEqual)
   *
   * @example
   * const form = FormUnit("", {
   *   isInputDirty: (left, right) => left.trim() !== right.trim(),
   * })
   *
   * form.setInput(" ")
   * form.isDirty(monitor) === false
   */
  readonly isInputDirty?: Equal<TInput>

  /**
   * PERFORMANCE OPTIMIZATION
   *
   * A equality check function that determines whether the validation error change.
   * When it does, the {@link SignalForm.getError} returns the new value.
   * Otherwise, it returns the previous value.
   *
   * Useful for none primitive values such as Objects, Arrays, Date, etc.
   * Intended to improve performance but do not affect business logic.
   *
   * @default Object.is
   */

  readonly isErrorEqual?: Equal<TError>

  /**
   * @default input
   */
  readonly initial?: TInput
}

interface FormUnitTransformedOptions<TInput, TError = null, TOutput = TInput>
  extends Omit<FormUnitOptions<TInput, TError>, "isOutputEqual"> {
  readonly transform: FormUnitTransformer<TInput, TOutput>

  /**
   * PERFORMANCE OPTIMIZATION
   *
   * A equality check function that determines whether the output value changes.
   * When it does, the {@link SignalForm.getOutput} returns the new value.
   *
   * Useful for none primitive values such as Objects, Arrays, Date, etc.
   * Intended to improve performance but do not affect business logic.
   *
   * @default Object.is
   */
  readonly isOutputEqual?: Equal<TOutput>
}

interface FormUnitSchemaOptions<TInput, TOutput = TInput>
  extends Omit<
    FormUnitTransformedOptions<TInput, ReadonlyArray<string>, TOutput>,
    "transform" | "isErrorEqual"
  > {
  /**
   * @default "onTouch"
   */
  readonly validateOn?: ValidateStrategy

  readonly schema: ZodLikeSchema<TOutput>
}

interface FormUnitValidatedOptions<TInput, TError = null, TOutput = TInput>
  extends Omit<FormUnitTransformedOptions<TInput, TError, TOutput>, "transform"> {
  /**
   * @default "onTouch"
   */
  readonly validateOn?: ValidateStrategy

  readonly validate: FormUnitValidator<TInput, TError, TOutput>
}

function FormUnit<TInput, TError = null, TOutput = TInput>(
  input: TInput,
  options:
    | FormUnitValidatedOptions<TInput, TError, TOutput>
    | FormUnitTransformedOptions<TInput, TError, TOutput>,
): FormUnit<TInput, TError, TOutput>

function FormUnit<TInput, TOutput = TInput>(
  input: TInput,
  options: FormUnitSchemaOptions<TInput, TOutput>,
): FormUnit<TInput, ReadonlyArray<string>, TOutput>

function FormUnit<TInput>(
  input: TInput,
  options?: FormUnitOptions<TInput>,
): FormUnit<TInput, null, TInput>

function FormUnit<TInput, TError>(
  input: TInput,
  options?: FormUnitOptions<TInput, TError>,
): FormUnit<TInput, TError, TInput>

function FormUnit<TInput, TError = null, TOutput = TInput>(
  input_: TInput,
  options?:
    | FormUnitOptions<TInput, TError>
    | FormUnitTransformedOptions<TInput, TError, TOutput>
    | FormUnitSchemaOptions<TInput, TOutput>
    | FormUnitValidatedOptions<TInput, TError, TOutput>,
):
  | FormUnit<TInput, TError>
  | FormUnit<TInput, ReadonlyArray<string>, TOutput>
  | FormUnit<TInput, TError, TOutput> /* enforce syntax highlight */ {
  const isInputEqual = options?.isInputEqual ?? isStrictEqual
  const isInputDirty = options?.isInputDirty ?? ((left, right) => !isInputEqual(left, right))
  const initialOrInput = options?.initial ?? input_

  const input = Signal(input_, { equals: isInputEqual })

  const initial = Signal({
    _explicit: Signal(!isUndefined(options?.initial)),
    _current: Signal(isInputEqual(initialOrInput, input_) ? input_ : initialOrInput, {
      equals: isInputEqual,
    }),
  })

  const touched = Signal(options?.touched ?? false)

  if (hasProperty(options, "schema")) {
    const transform = transformFromSchema<TInput, TOutput>(options.schema)
    const isErrorEqual = createIsUnionEqual(isNull, isShallowArrayEqual)
    const isOutputEqual = createIsUnionEqual<null, TOutput>(
      isNull,
      options.isOutputEqual ?? isStrictEqual,
    )

    return new FormUnitState(
      null,
      initial,
      input,
      Signal(options.error ?? null, { equals: isErrorEqual }),
      Signal(options.validateOn ?? VALIDATE_ON_TOUCH),
      touched,
      Signal(transform),
      isInputDirty,
      isInputEqual,
      isOutputEqual,
      isErrorEqual,
    )._host()
  }

  const isErrorEqual = createIsUnionEqual<null, TError>(
    isNull,
    options?.isErrorEqual ?? isStrictEqual,
  )
  const error = Signal<null | TError>(options?.error ?? null, {
    equals: isErrorEqual,
  })

  if (hasProperty(options, "validate")) {
    const transform = transformFromValidator(options.validate)
    const isOutputEqual = createIsUnionEqual<null, TOutput>(
      isNull,
      options.isOutputEqual ?? isStrictEqual,
    )

    return new FormUnitState(
      null,
      initial,
      input,
      error,
      Signal(options.validateOn ?? VALIDATE_ON_TOUCH),
      touched,
      Signal(transform),
      isInputDirty,
      isInputEqual,
      isOutputEqual,
      isErrorEqual,
    )._host()
  }

  if (hasProperty(options, "transform")) {
    const transform = transformFromTransformer(options.transform)
    const isOutputEqual = createIsUnionEqual<null, TOutput>(
      isNull,
      options.isOutputEqual ?? isStrictEqual,
    )

    return new FormUnitState(
      null,
      initial,
      input,
      error,
      Signal<ValidateStrategy>(VALIDATE_ON_INIT),
      touched,
      Signal(transform as FormUnitTransform<TInput, TError, TOutput>),
      isInputDirty,
      isInputEqual,
      isOutputEqual,
      isErrorEqual,
    )._host()
  }

  return new FormUnitState(
    null,
    initial,
    input,
    error,
    Signal<ValidateStrategy>(VALIDATE_ON_INIT),
    touched,
    Signal(transformFromInput as FormUnitTransform<TInput, TError, TInput>),
    isInputDirty,
    isInputEqual,
    createIsUnionEqual(isNull, isInputEqual),
    isErrorEqual,
  )._host()
}

export type {
  FormUnitOptions,
  FormUnitTransformedOptions,
  FormUnitSchemaOptions,
  FormUnitValidatedOptions,
}
export { FormUnit }
