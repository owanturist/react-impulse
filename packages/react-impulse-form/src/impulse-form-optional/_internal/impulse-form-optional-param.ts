import type { GetSignalFormParam } from "../../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../../impulse-form/impulse-form"
import type { SignalFormParams } from "../../impulse-form/impulse-form-params"
import type { FormOptionalSchema } from "../impulse-form-optional-schema"

type FormOptionalParam<
  TEnabled extends SignalForm,
  TElement extends SignalForm,
  TKey extends keyof SignalFormParams,
  TConcise = never,
> =
  | TConcise
  | FormOptionalSchema<
      TConcise | GetSignalFormParam<TEnabled, TKey>,
      TConcise | GetSignalFormParam<TElement, TKey>
    >

export type { FormOptionalParam }
