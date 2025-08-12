import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"

import type { ImpulseForm } from "../impulse-form/impulse-form"

import { createImpulseFormSwitchVerboseSchemaCompare } from "./_impulse-form-switch-verbose-schema"
import type { ImpulseFormSwitchVerboseParam } from "./_impulse-form-switch-verbose-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchOutputVerbose<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchVerboseParam<TKind, TBranches, "output.schema.verbose">

export const isImpulseFormSwitchOutputVerboseEqual =
  createImpulseFormSwitchVerboseSchemaCompare(isShallowObjectEqual)
