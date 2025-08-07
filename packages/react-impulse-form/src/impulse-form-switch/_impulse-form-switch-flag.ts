import { isBoolean } from "~/tools/is-boolean"

import { createUnionCompare } from "../create-union-compare"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { GetImpulseFormSwitchParams } from "./_get-impulse-form-switch-params"
import { isShallowImpulseFormSwitchSchemaEqual } from "./_impulse-form-switch-schema"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchFlag<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = GetImpulseFormSwitchParams<TKind, TBranches, "flag.schema", boolean>

export const isImpulseFormSwitchFlagEqual = createUnionCompare(
  isBoolean,
  isShallowImpulseFormSwitchSchemaEqual,
)
