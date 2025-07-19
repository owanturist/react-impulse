import { isBoolean } from "~/tools/is-boolean"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { Option, Some } from "~/tools/option"
import { resolveSetter } from "~/tools/setter"

import { Impulse, untrack } from "../dependencies"
import type { GetImpulseFormParams } from "../impulse-form/get-impulse-form-params"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type {
  ImpulseFormSpec,
  ImpulseFormSpecPatch,
} from "../impulse-form/impulse-form-spec"

import { ImpulseFormList } from "./_impulse-form-list"
import type { ImpulseFormListParams } from "./_impulse-form-list-params"
import {
  type ImpulseFormListInput,
  isImpulseFormListInputEqual,
} from "./impulse-form-list-input"

export class ImpulseFormListSpec<TElement extends ImpulseForm>
  implements ImpulseFormSpec<ImpulseFormListParams<TElement>>
{
  public constructor(
    public readonly _elements: Impulse<
      ReadonlyArray<ImpulseFormSpec<GetImpulseFormParams<TElement>>>
    >,
    public readonly _initial = Impulse<ImpulseFormListInput<TElement>>(
      untrack(_elements).map((element) => untrack(element._initial)),
      {
        compare: isImpulseFormListInputEqual,
      },
    ),
  ) {}

  public readonly _input = untrack(this._elements).map(({ _input }) => _input)

  public readonly _error = untrack(this._elements).map(({ _error }) => _error)

  public readonly _validateOn = untrack(this._elements).map(
    ({ _validateOn }) => _validateOn,
  )

  public readonly _touched = untrack(this._elements).map(
    ({ _touched }) => _touched,
  )

  public _override({
    _input,
    _initial,
    _error,
    _validateOn,
    _touched,
  }: ImpulseFormSpecPatch<
    ImpulseFormListParams<TElement>
  >): ImpulseFormListSpec<TElement> {
    const input = _input._map((setter) => {
      return resolveSetter(setter, this._input, untrack(this._initial))
    })

    const initial = _initial._map((setter) => {
      return resolveSetter(setter, untrack(this._initial), this._input)
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

    const elements = untrack(this._elements).map((element, index) => {
      return element._override({
        _input: input._chain((arr) => {
          return Option(arr[index])
        }),

        _initial: initial._chain((arr) => {
          return Option(arr[index])
        }),

        _error: error._chain((arr) => {
          if (isNull(arr)) {
            return Some(null)
          }

          return Option(arr[index])
        }),

        _validateOn: validateOn._chain((arr) => {
          if (isString(arr)) {
            return Some(arr)
          }

          return Option(arr[index])
        }),

        _touched: touched._chain((arr) => {
          if (isBoolean(arr)) {
            return Some(arr)
          }

          return Option(arr[index])
        }),
      })
    })

    return new ImpulseFormListSpec(
      Impulse<ReadonlyArray<ImpulseFormSpec<GetImpulseFormParams<TElement>>>>(
        elements,
      ),
    )
  }

  public _childOf(
    parent: ImpulseForm,
    initial: Impulse<ImpulseFormListInput<TElement>>,
  ): ImpulseFormList<TElement> {
    // const state = Lazy((): ImpulseForListState<TElement> => {
    //   const initial = Impulse(
    //     (scope) => {
    //       const values = spec.getValue(scope)._elements.map((element) => {
    //         return element.getValue(scope)._initial
    //       })

    //       return values as ImpulseFormListInput<TElement>
    //     },

    //     {
    //       compare: isImpulseFormListInputEqual,
    //     },
    //   )

    //   return new ImpulseForListState(
    //     parent,
    //     spec,
    //     initial,
    //     Impulse(
    //       (scope) => {
    //         return elements.getValue(scope).map(({ _state }) => _state._peek())
    //       },
    //       {
    //         compare: isShallowArrayEqual,
    //       },
    //     ),
    //   )
    // })

    // const elements = Impulse(
    //   this._elements.map((element) => {
    //     return untrack(element)._create(state)
    //   }),
    //   {
    //     compare: isShallowArrayEqual,
    //   },
    // )

    // const spec = Impulse(
    //   new ImpulseFormListSpec(untrack(elements).map(({ _spec }) => _spec)),
    // )

    return new ImpulseFormList(
      parent,
      new ImpulseFormListSpec(this._elements, initial),
    )
  }
}
