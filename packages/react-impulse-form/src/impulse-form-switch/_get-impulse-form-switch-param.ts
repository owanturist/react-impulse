import type { Compute } from "~/tools/compute"

import type { ImpulseFormParams } from "../impulse-form"
import type { GetImpulseFormParam } from "../impulse-form"

import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type GetImpulseFormSwitchParam<
  TCases extends ImpulseFormSwitchCases,
  TKey extends keyof ImpulseFormParams,
> = Compute<{
  readonly [TCase in keyof TCases]: GetImpulseFormParam<TCases[TCase], TKey>
}>
