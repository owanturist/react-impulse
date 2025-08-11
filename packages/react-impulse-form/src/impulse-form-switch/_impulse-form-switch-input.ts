import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"

import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { MakeImpulseFormSwitchVerboseParam } from "./_make-impulse-form-switch-verbose-param"
import { createImpulseFormSwitchSchemaCompare } from "./_impulse-form-switch-schema"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchInput<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = MakeImpulseFormSwitchVerboseParam<TKind, TBranches, "input.schema">

export const isImpulseFormSwitchInputEqual =
  createImpulseFormSwitchSchemaCompare(isShallowObjectEqual)
