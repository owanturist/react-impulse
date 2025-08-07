import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"

import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { GetImpulseFormSwitchParams } from "./_get-impulse-form-switch-params"
import { createImpulseFormSwitchSchemaCompare } from "./_impulse-form-switch-schema"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchFlagVerbose<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = GetImpulseFormSwitchParams<TKind, TBranches, "flag.schema.verbose">

export const isImpulseFormSwitchFlagVerboseEqual =
  createImpulseFormSwitchSchemaCompare(isShallowObjectEqual)
