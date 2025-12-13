import type { SignalFormParams } from "../impulse-form/impulse-form-params"

import type { FormShapeError } from "./impulse-form-shape-error"
import type { FormShapeErrorSetter } from "./impulse-form-shape-error-setter"
import type { FormShapeErrorVerbose } from "./impulse-form-shape-error-verbose"
import type { FormShapeFields } from "./impulse-form-shape-fields"
import type { FormShapeFlag } from "./impulse-form-shape-flag"
import type { FormShapeFlagSetter } from "./impulse-form-shape-flag-setter"
import type { FormShapeFlagVerbose } from "./impulse-form-shape-flag-verbose"
import type { FormShapeInput } from "./impulse-form-shape-input"
import type { FormShapeInputSetter } from "./impulse-form-shape-input-setter"
import type { FormShapeOutput } from "./impulse-form-shape-output"
import type { FormShapeOutputVerbose } from "./impulse-form-shape-output-verbose"
import type { FormShapeValidateOn } from "./impulse-form-shape-validate-on"
import type { FormShapeValidateOnSetter } from "./impulse-form-shape-validate-on-setter"
import type { FormShapeValidateOnVerbose } from "./impulse-form-shape-validate-on-verbose"

interface FormShapeParams<TFields extends FormShapeFields> extends SignalFormParams {
  readonly "input.schema": FormShapeInput<TFields>
  readonly "input.setter": FormShapeInputSetter<TFields>

  readonly "output.schema": FormShapeOutput<TFields>
  readonly "output.schema.verbose": FormShapeOutputVerbose<TFields>

  readonly "flag.setter": FormShapeFlagSetter<TFields>
  readonly "flag.schema": FormShapeFlag<TFields>
  readonly "flag.schema.verbose": FormShapeFlagVerbose<TFields>

  readonly "validateOn.setter": FormShapeValidateOnSetter<TFields>
  readonly "validateOn.schema": FormShapeValidateOn<TFields>
  readonly "validateOn.schema.verbose": FormShapeValidateOnVerbose<TFields>

  readonly "error.setter": FormShapeErrorSetter<TFields>
  readonly "error.schema": FormShapeError<TFields>
  readonly "error.schema.verbose": FormShapeErrorVerbose<TFields>
}

export type { FormShapeParams }
