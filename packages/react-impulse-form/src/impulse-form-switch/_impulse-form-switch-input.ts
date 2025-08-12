import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"

import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormSwitchVerboseParam } from "./_impulse-form-switch-verbose-param"
import { createImpulseFormSwitchVerboseSchemaCompare } from "./_impulse-form-switch-verbose-schema"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchInput<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchVerboseParam<TKind, TBranches, "input.schema">

export const isImpulseFormSwitchInputEqual =
  createImpulseFormSwitchVerboseSchemaCompare(isShallowObjectEqual)
