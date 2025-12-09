import type { Monitor } from "@owanturist/signal"

import { mapValues } from "~/tools/map-values"

import type { FormMeta } from "../../form-meta"
import { SignalForm } from "../../signal-form/_internal/signal-form"
import type { FormShapeFields } from "../form-shape-fields"
import type { FormShapeParams } from "../form-shape-params"

import type { FormShapeState } from "./form-shape-state"

type FormShapeField<TField> = TField extends SignalForm ? TField : FormMeta<TField>

class FormShape<TFields extends FormShapeFields> extends SignalForm<FormShapeParams<TFields>> {
  public static override _getState = SignalForm._getState

  public readonly fields: {
    readonly [TField in keyof TFields]: FormShapeField<TFields[TField]>
  }

  public constructor(public readonly _state: FormShapeState<TFields>) {
    super()

    this.fields = {
      ...mapValues(_state._fields, ({ _host }) => _host()),

      ...mapValues(_state._meta, (field) => (monitor: Monitor) => field.read(monitor)),
    } as {
      readonly [TField in keyof TFields]: FormShapeField<TFields[TField]>
    }
  }
}

export { FormShape }
