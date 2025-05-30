import type Types from "ts-toolbelt"

import type { Compute } from "~/tools/compute"

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
> = Compute<
  Types.Object.Filter<
    {
      readonly [TField in Types.Any.Keys<TFields>]: FallbackParamWhenNever<
        TKey,
        TFields[TField],
        GetImpulseFormParam<TFields[TField], TKey>
      >
    },
    never,
    "equals"
  >
>
