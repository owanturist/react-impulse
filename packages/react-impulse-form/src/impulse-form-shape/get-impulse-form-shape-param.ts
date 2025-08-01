import type { OmitValues } from "~/tools/omit-values"

import type { ImpulseFormParams } from "../impulse-form"
import type { GetImpulseFormParam } from "../impulse-form"

import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

type FallbackParamWhenNever<
  TKey extends keyof ImpulseFormParams,
  TFallback,
  TParam,
> = [TParam] extends [never]
  ? TKey extends "input.schema" | "output.schema" | "output.schema.verbose"
    ? TFallback
    : never
  : TParam

export type GetImpulseFormShapeParam<
  TFields extends ImpulseFormShapeFields,
  TKey extends keyof ImpulseFormParams,
> = OmitValues<
  {
    readonly [TField in keyof TFields]: FallbackParamWhenNever<
      TKey,
      TFields[TField],
      GetImpulseFormParam<TFields[TField], TKey>
    >
  },
  never
>
