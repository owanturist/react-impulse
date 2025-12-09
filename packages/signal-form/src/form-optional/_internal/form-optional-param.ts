import type { GetSignalFormParam } from "../../signal-form/get-signal-form-param"
import type { SignalForm } from "../../signal-form/signal-form"
import type { SignalFormParams } from "../../signal-form/signal-form-params"
import type { FormOptionalSchema } from "../form-optional-schema"

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
