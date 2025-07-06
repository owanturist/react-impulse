import { isBoolean } from "~/tools/is-boolean"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { Lazy } from "~/tools/lazy"
import { mapValues } from "~/tools/map-values"
import type { OmitValues } from "~/tools/omit-values"
import { Option, Some } from "~/tools/option"
import { resolveSetter } from "~/tools/setter"

import { Impulse, untrack } from "../dependencies"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"
import type {
  ImpulseFormSpec,
  ImpulseFormSpecPatch,
} from "../impulse-form/impulse-form-spec"
import type { ImpulseFormState } from "../impulse-form/impulse-form-state"

import { ImpulseFormShape } from "./_impulse-form-shape"
import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import { ImpulseFormShapeState } from "./_impulse-form-shape-state"
import type { ImpulseFormShapeErrorVerbose } from "./impulse-form-shape-error-verbose"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeFlagVerbose } from "./impulse-form-shape-flag-verbose"
import type { ImpulseFormShapeInput } from "./impulse-form-shape-input"
import type { ImpulseFormShapeValidateOnVerbose } from "./impulse-form-shape-validate-on-verbose"

export type ImpulseFormShapeSpecFields<TFields extends ImpulseFormShapeFields> =
  OmitValues<
    {
      [TField in keyof TFields]: TFields[TField] extends ImpulseForm<
        infer TParams
      >
        ? Impulse<ImpulseFormSpec<TParams>>
        : never
    },
    never
  >

export class ImpulseFormShapeSpec<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> implements ImpulseFormSpec<ImpulseFormShapeParams<TFields>>
{
  public constructor(
    public readonly _fields: ImpulseFormShapeSpecFields<TFields>,
    public readonly _constants: Omit<
      TFields,
      keyof ImpulseFormShapeSpecFields<TFields>
    >,
  ) {}

  public readonly _initial = {
    ...mapValues(this._fields, (field) => untrack(field)._initial),
    ...this._constants,
  } as ImpulseFormShapeInput<TFields>

  public readonly _input = {
    ...mapValues(this._fields, (field) => untrack(field)._input),
    ...this._constants,
  } as ImpulseFormShapeInput<TFields>

  public readonly _error = mapValues(
    this._fields,
    (field) => untrack(field)._error,
  ) as ImpulseFormShapeErrorVerbose<TFields>

  public readonly _validateOn = mapValues(
    this._fields,
    (field) => untrack(field)._validateOn,
  ) as ImpulseFormShapeValidateOnVerbose<TFields>

  public readonly _touched = mapValues(
    this._fields,
    (field) => untrack(field)._touched,
  ) as ImpulseFormShapeFlagVerbose<TFields>

  public _override({
    _input,
    _initial,
    _error,
    _validateOn,
    _touched,
  }: ImpulseFormSpecPatch<
    ImpulseFormShapeParams<TFields>
  >): ImpulseFormShapeSpec<TFields> {
    const input = _input._map((setter) => {
      return resolveSetter(setter, this._input, this._initial)
    })

    const initial = _initial._map((setter) => {
      return resolveSetter(setter, this._initial, this._input)
    })

    const error = _error._map((setter) => {
      return resolveSetter(setter, this._error)
    })

    const validateOn = _validateOn._map((setter) => {
      return resolveSetter(setter, this._validateOn)
    })

    const touched = _touched._map((setter) => {
      return resolveSetter(setter, this._touched)
    })

    const fields = mapValues(this._fields, (field, key) => {
      const next = untrack(field)._override({
        _input: input._chain((shape) => {
          return Option(shape[key])
        }),

        _initial: initial._chain((shape) => {
          return Option(shape[key])
        }),

        _error: error._chain((shape) => {
          if (isNull(shape)) {
            return Some(null)
          }

          return Option(shape[key])
        }),

        _validateOn: validateOn._chain((shape) => {
          if (isString(shape)) {
            return Some(shape)
          }

          return Option(shape[key])
        }),

        _touched: touched._chain((shape) => {
          if (isBoolean(shape)) {
            return Some(shape)
          }

          return Option(shape[key])
        }),
      })

      return Impulse(next)
    })

    return new ImpulseFormShapeSpec(fields, this._constants)
  }

  public _create(
    parent?: Lazy<ImpulseFormState<ImpulseFormParams>>,
  ): ImpulseFormShape<TFields> {
    const state = Lazy((): ImpulseFormShapeState<TFields> => {
      return new ImpulseFormShapeState(
        parent,
        mapValues(fields, (field) => field._state._peek()),
        this._constants,
      )
    })

    const fields = mapValues(this._fields, (field) => {
      return untrack(field)._create(state)
    })

    const spec = new ImpulseFormShapeSpec(
      mapValues(fields, (field) => field._spec),
      this._constants,
    )

    return new ImpulseFormShape(Impulse(spec), state, fields)
  }
}
