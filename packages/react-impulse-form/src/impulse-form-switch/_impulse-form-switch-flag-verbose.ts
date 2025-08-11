import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"

import type { ImpulseForm } from "../impulse-form/impulse-form"

import { createImpulseFormSwitchSchemaCompare } from "./_impulse-form-switch-schema"
import type { MakeImpulseFormSwitchVerboseParam } from "./_make-impulse-form-switch-verbose-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchFlagVerbose<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = MakeImpulseFormSwitchVerboseParam<TKind, TBranches, "flag.schema.verbose">

export const isImpulseFormSwitchFlagVerboseEqual =
  createImpulseFormSwitchSchemaCompare(isShallowObjectEqual)
