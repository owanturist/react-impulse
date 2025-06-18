import { isNull } from "~/tools/is-null"
import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"
import { mapValues } from "~/tools/map-values"
import type { OmitValues } from "~/tools/omit-values"
import { None, Option } from "~/tools/option"
import { resolveSetter } from "~/tools/setter"

import { createNullableCompare } from "../create-nullable-compare"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type {
  ImpulseFormSpec,
  ImpulseFormSpecPatch,
} from "../impulse-form/impulse-form-spec"

import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import type { ImpulseFormShapeErrorVerbose } from "./impulse-form-shape-error-verbose"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeInput } from "./impulse-form-shape-input"
import type { ImpulseFormShapeOutput } from "./impulse-form-shape-output"
import type { ImpulseFormShapeOutputVerbose } from "./impulse-form-shape-output-verbose"

type ImpulseFormShapeSpecFields<TFields extends ImpulseFormShapeFields> =
  OmitValues<
    {
      [TField in keyof TFields]: TFields[TField] extends ImpulseForm<
        infer TParams
      >
        ? ImpulseFormSpec<TParams>
        : never
    },
    never
  >

export class ImpulseFormShapeSpec<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> implements ImpulseFormSpec<ImpulseFormShapeParams<TFields>>
{
  public readonly _initial: ImpulseFormShapeInput<TFields>
  public readonly _input: ImpulseFormShapeInput<TFields>
  public readonly _error: ImpulseFormShapeErrorVerbose<TFields>

  public readonly _isOutputEqual = createNullableCompare(isShallowObjectEqual)

  public constructor(
    public readonly _fields: ImpulseFormShapeSpecFields<TFields>,
    public readonly _constants: Omit<TFields, keyof typeof this._fields>,
  ) {
    this._initial = {
      ...mapValues(_fields, ({ _initial }) => _initial),
      ...this._constants,
    } as ImpulseFormShapeInput<TFields>

    this._input = {
      ...mapValues(_fields, ({ _input }) => _input),
      ...this._constants,
    } as ImpulseFormShapeInput<TFields>

    this._error = {
      ...mapValues(_fields, ({ _error }) => _error),
      ...this._constants,
    } as ImpulseFormShapeErrorVerbose<TFields>
  }

  public _outputFromVerbose(
    verbose: ImpulseFormShapeOutputVerbose<TFields>,
  ): null | ImpulseFormShapeOutput<TFields> {
    for (const field of Object.values(verbose)) {
      if (isNull(field)) {
        return null
      }
    }

    return verbose as unknown as ImpulseFormShapeOutput<TFields>
  }

  public _override({
    _input = None,
    _initial = None,
    _error = None,
  }: Partial<
    ImpulseFormSpecPatch<ImpulseFormShapeParams<TFields>>
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

    const fields = mapValues(this._fields, (field, key) => {
      return field._override({
        _input: input._chain((shape) => {
          return Option(shape[key as keyof typeof shape])
        }),

        _initial: initial._chain((shape) => {
          return Option(shape[key as keyof typeof shape])
        }),

        _error: error._chain((shape) => {
          if (isNull(shape)) {
            return Option(shape)
          }

          return Option(shape[key as keyof typeof shape])
        }),
      })
    })

    return new ImpulseFormShapeSpec(
      fields as typeof this._fields,
      this._constants,
    )
  }

  public _create(): ImpulseForm<ImpulseFormShapeParams<TFields>> {
    throw new Error("")
  }
}
