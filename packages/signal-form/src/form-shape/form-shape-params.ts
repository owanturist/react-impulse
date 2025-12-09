import type { SignalFormParams } from "../signal-form/signal-form-params"

import type { FormShapeError } from "./form-shape-error"
import type { FormShapeErrorSetter } from "./form-shape-error-setter"
import type { FormShapeErrorVerbose } from "./form-shape-error-verbose"
import type { FormShapeFields } from "./form-shape-fields"
import type { FormShapeFlag } from "./form-shape-flag"
import type { FormShapeFlagSetter } from "./form-shape-flag-setter"
import type { FormShapeFlagVerbose } from "./form-shape-flag-verbose"
import type { FormShapeInput } from "./form-shape-input"
import type { FormShapeInputSetter } from "./form-shape-input-setter"
import type { FormShapeOutput } from "./form-shape-output"
import type { FormShapeOutputVerbose } from "./form-shape-output-verbose"
import type { FormShapeValidateOn } from "./form-shape-validate-on"
import type { FormShapeValidateOnSetter } from "./form-shape-validate-on-setter"
import type { FormShapeValidateOnVerbose } from "./form-shape-validate-on-verbose"

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
