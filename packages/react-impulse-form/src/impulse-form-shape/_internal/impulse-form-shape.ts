import type { Monitor } from "@owanturist/signal"

import { mapValues } from "~/tools/map-values"

import { SignalForm } from "../../impulse-form/_internal/impulse-form"
import type { FormMeta } from "../../impulse-form-meta"
import type { FormShapeFields } from "../impulse-form-shape-fields"
import type { FormShapeParams } from "../impulse-form-shape-params"

import type { FormShapeState } from "./impulse-form-shape-state"

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
