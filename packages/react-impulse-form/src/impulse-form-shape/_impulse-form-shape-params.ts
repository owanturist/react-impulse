import type { ImpulseFormParams } from "../impulse-form"

import type { ImpulseFormShapeError } from "./impulse-form-shape-error"
import type { ImpulseFormShapeErrorSetter } from "./impulse-form-shape-error-setter"
import type { ImpulseFormShapeErrorVerbose } from "./impulse-form-shape-error-verbose"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeFlag } from "./impulse-form-shape-flag"
import type { ImpulseFormShapeFlagSetter } from "./impulse-form-shape-flag-setter"
import type { ImpulseFormShapeFlagVerbose } from "./impulse-form-shape-flag-verbose"
import type { ImpulseFormShapeInput } from "./impulse-form-shape-input"
import type { ImpulseFormShapeInputSetter } from "./impulse-form-shape-input-setter"
import type { ImpulseFormShapeOutput } from "./impulse-form-shape-output"
import type { ImpulseFormShapeOutputVerbose } from "./impulse-form-shape-output-verbose"
import type { ImpulseFormShapeValidateOn } from "./impulse-form-shape-validate-on"
import type { ImpulseFormShapeValidateOnSetter } from "./impulse-form-shape-validate-on-setter"
import type { ImpulseFormShapeValidateOnVerbose } from "./impulse-form-shape-validate-on-verbose"

export interface ImpulseFormShapeParams<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseFormParams {
  readonly "input.schema": ImpulseFormShapeInput<TFields>
  readonly "input.setter": ImpulseFormShapeInputSetter<TFields>

  readonly "output.schema": ImpulseFormShapeOutput<TFields>
  readonly "output.schema.verbose": ImpulseFormShapeOutputVerbose<TFields>

  readonly "flag.setter": ImpulseFormShapeFlagSetter<TFields>
  readonly "flag.schema": ImpulseFormShapeFlag<TFields>
  readonly "flag.schema.verbose": ImpulseFormShapeFlagVerbose<TFields>

  readonly "validateOn.setter": ImpulseFormShapeValidateOnSetter<TFields>
  readonly "validateOn.schema": ImpulseFormShapeValidateOn<TFields>
  readonly "validateOn.schema.verbose": ImpulseFormShapeValidateOnVerbose<TFields>

  readonly "error.setter": ImpulseFormShapeErrorSetter<TFields>
  readonly "error.schema": ImpulseFormShapeError<TFields>
  readonly "error.schema.verbose": ImpulseFormShapeErrorVerbose<TFields>
}
