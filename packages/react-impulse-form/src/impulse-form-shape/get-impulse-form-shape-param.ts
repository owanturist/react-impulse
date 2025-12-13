import type { OmitValues } from "~/tools/omit-values"

import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalFormParams } from "../impulse-form/impulse-form-params"

import type { FormShapeFields } from "./impulse-form-shape-fields"

type FallbackParamWhenNever<TKey extends keyof SignalFormParams, TFallback, TParam> = [
  TParam,
] extends [never]
  ? TKey extends "input.schema" | "output.schema" | "output.schema.verbose"
    ? TFallback
    : never
  : TParam

type GetFormShapeParam<
  TFields extends FormShapeFields,
  TKey extends keyof SignalFormParams,
> = OmitValues<
  {
    readonly [TField in keyof TFields]: FallbackParamWhenNever<
      TKey,
      TFields[TField],
      GetSignalFormParam<TFields[TField], TKey>
    >
  },
  never
>

export type { GetFormShapeParam }
