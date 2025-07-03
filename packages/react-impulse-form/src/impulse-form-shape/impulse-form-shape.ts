import { mapValues } from "~/tools/map-values"
import { Option } from "~/tools/option"
import { partitionEntries } from "~/tools/partition-entries"

import { untrack } from "../dependencies"
import { isImpulseForm } from "../impulse-form"

import type { ImpulseFormShape as ImpulseFormShapeImpl } from "./_impulse-form-shape"
import { ImpulseFormShapeSpec } from "./_impulse-form-shape-spec"
import type { ImpulseFormShapeErrorSetter } from "./impulse-form-shape-error-setter"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeFlagSetter } from "./impulse-form-shape-flag-setter"
import type { ImpulseFormShapeInputSetter } from "./impulse-form-shape-input-setter"
import type { ImpulseFormShapeValidateOnSetter } from "./impulse-form-shape-validate-on-setter"

export type ImpulseFormShape<TFields extends ImpulseFormShapeFields> =
  ImpulseFormShapeImpl<TFields>

export interface ImpulseFormShapeOptions<
  TFields extends ImpulseFormShapeFields,
> {
  readonly input?: ImpulseFormShapeInputSetter<TFields>
  readonly initial?: ImpulseFormShapeInputSetter<TFields>
  readonly touched?: ImpulseFormShapeFlagSetter<TFields>
  readonly validateOn?: ImpulseFormShapeValidateOnSetter<TFields>
  readonly error?: ImpulseFormShapeErrorSetter<TFields>
}

export function ImpulseFormShape<TFields extends ImpulseFormShapeFields>(
  fields: TFields,
  {
    input,
    initial,
    touched,
    validateOn,
    error,
  }: ImpulseFormShapeOptions<TFields> = {},
): ImpulseFormShape<TFields> {
  const [impulseFields, constantFields] = partitionEntries(
    fields,
    isImpulseForm,
  )

  return new ImpulseFormShapeSpec(
    mapValues(impulseFields, (field) => field._spec),
    constantFields,
  )
    ._override({
      _input: Option(input),
      _initial: Option(initial),
      _error: Option(error),
      _touched: Option(touched),
      _validateOn: Option(validateOn),
    })
    ._create()
}
