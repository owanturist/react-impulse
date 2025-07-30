import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"

export interface ImpulseFormSwitchKindParams<TKind> extends ImpulseFormParams {
  "input.schema": unknown
  "input.setter": unknown

  "output.schema": null | TKind
  "output.schema.verbose": null | TKind

  "flag.setter": unknown
  "flag.schema": unknown
  "flag.schema.verbose": unknown

  "validateOn.setter": unknown
  "validateOn.schema": unknown
  "validateOn.schema.verbose": unknown

  "error.setter": unknown
  "error.schema": unknown
  "error.schema.verbose": unknown
}
