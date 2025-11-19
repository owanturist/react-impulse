import { concat } from "~/tools/concat"
import { drop } from "~/tools/drop"
import { entries } from "~/tools/entries"
import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"
import { map } from "~/tools/map"
import { take } from "~/tools/take"

import { Impulse, type Scope, untrack } from "../dependencies"
import type { GetImpulseFormParams } from "../impulse-form/get-impulse-form-params"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"
import { type ImpulseFormChild, ImpulseFormState } from "../impulse-form/impulse-form-state"
import { toConcise } from "../to-concise"
import { VALIDATE_ON_TOUCH } from "../validate-strategy"

import { ImpulseFormList } from "./_impulse-form-list"
import type { ImpulseFormListParams } from "./_impulse-form-list-params"
import type { ImpulseFormListError } from "./impulse-form-list-error"
import type { ImpulseFormListErrorSetter } from "./impulse-form-list-error-setter"
import type { ImpulseFormListErrorVerbose } from "./impulse-form-list-error-verbose"
import type { ImpulseFormListFlag } from "./impulse-form-list-flag"
import type { ImpulseFormListFlagSetter } from "./impulse-form-list-flag-setter"
import type { ImpulseFormListFlagVerbose } from "./impulse-form-list-flag-verbose"
import type { ImpulseFormListInput } from "./impulse-form-list-input"
import type { ImpulseFormListInputSetter } from "./impulse-form-list-input-setter"
import type { ImpulseFormListOutput } from "./impulse-form-list-output"
import type { ImpulseFormListOutputVerbose } from "./impulse-form-list-output-verbose"
import type { ImpulseFormListValidateOn } from "./impulse-form-list-validate-on"
import type { ImpulseFormListValidateOnSetter } from "./impulse-form-list-validate-on-setter"
import type { ImpulseFormListValidateOnVerbose } from "./impulse-form-list-validate-on-verbose"

export class ImpulseFormListState<
  TElement extends ImpulseForm = ImpulseForm,
> extends ImpulseFormState<ImpulseFormListParams<TElement>> {
  public readonly _host = Lazy(() => new ImpulseFormList(this))

  public readonly _elements: Impulse<
    ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>>
  >

  private readonly _initialElements: Impulse<{
    _list: Impulse<ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>>>
  }>

  public constructor(
    parent: null | ImpulseFormState,
    elements: ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>>,
  ) {
    super(parent)

    const initialElements = map(elements, (element) => element._clone())

    this._initialElements = Impulse({
      _list: Impulse(initialElements),
    })

    this._elements = Impulse(
      untrack((scope) =>
        map(elements, (element, index) => {
          const child = this._parentOf(element)

          child._replaceInitial(scope, initialElements.at(index), true)

          return child
        }),
      ),
    )
  }

  public _childOf(parent: null | ImpulseFormState): ImpulseFormListState<TElement> {
    return new ImpulseFormListState(parent, untrack(this._elements))
  }

  public _getElements(scope: Scope): ReadonlyArray<TElement> {
    return map(this._elements.getValue(scope), ({ _host }) => _host() as TElement)
  }

  public _getInitialElements(
    scope: Scope,
  ): ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>> {
    return this._initialElements.getValue(scope)._list.getValue(scope)
  }

  public readonly _initial = Impulse(
    (scope): ImpulseFormListInput<TElement> =>
      map(this._getInitialElements(scope), ({ _initial }) => _initial.getValue(scope)),
  )

  public _replaceInitial(
    scope: Scope,
    state: undefined | ImpulseFormListState<TElement>,
    isMounting: boolean,
  ): void {
    if (state) {
      const elements = this._elements.getValue(scope)
      const initialElements = state._initialElements.getValue(scope)

      this._initialElements.setValue(initialElements)

      for (const [index, element] of entries(initialElements._list.getValue(scope))) {
        elements.at(index)?._replaceInitial(scope, element, isMounting)
      }
    }
  }

  public _setInitial(scope: Scope, setter: ImpulseFormListInputSetter<TElement>): void {
    const setters = isFunction(setter)
      ? setter(this._initial.getValue(scope), this._input.getValue(scope))
      : setter

    const elements = this._elements.getValue(scope)
    const initialElements = this._initialElements.getValue(scope)
    const initialElementsList = initialElements._list.getValue(scope)

    const nextInitialElements = map(
      take(
        concat(
          initialElementsList,
          // fallback the initial elements to the current elements' tail
          drop(elements, initialElementsList.length),
        ),
        setters.length,
      ),
      (element) => element._clone(),
    )

    initialElements._list.setValue(nextInitialElements)

    for (const [index, initial] of entries(setters)) {
      if (!isUndefined(initial)) {
        nextInitialElements.at(index)?._setInitial(scope, initial)
      }
    }

    for (const [index, element] of entries(nextInitialElements)) {
      elements.at(index)?._replaceInitial(scope, element, false)
    }
  }

  public readonly _input = Impulse(
    (scope): ImpulseFormListInput<TElement> =>
      map(this._elements.getValue(scope), ({ _input }) => _input.getValue(scope)),
  )

  public _setInput(scope: Scope, setter: ImpulseFormListInputSetter<TElement>): void {
    const setters = isFunction(setter)
      ? setter(this._input.getValue(scope), this._initial.getValue(scope))
      : setter

    for (const [index, element] of entries(this._elements.getValue(scope))) {
      const input = setters.at(index)

      if (!isUndefined(input)) {
        element._setInput(scope, input)
      }
    }
  }

  public readonly _error = Impulse((scope): ImpulseFormListError<TElement> => {
    const error = map(this._elements.getValue(scope), ({ _error }) => _error.getValue(scope))

    if (error.every(isNull)) {
      return null
    }

    return error
  })

  public readonly _errorVerbose = Impulse(
    (scope): ImpulseFormListErrorVerbose<TElement> =>
      map(this._elements.getValue(scope), ({ _errorVerbose }) => _errorVerbose.getValue(scope)),
  )

  public _setError(scope: Scope, setter: ImpulseFormListErrorSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._errorVerbose.getValue(scope)) : setter

    for (const [index, element] of entries(this._elements.getValue(scope))) {
      const error = isNull(setters) ? setters : setters.at(index)

      if (!isUndefined(error)) {
        element._setError(scope, error)
      }
    }
  }

  public readonly _validateOn = Impulse((scope): ImpulseFormListValidateOn<TElement> => {
    const validateOn = map(this._elements.getValue(scope), ({ _validateOn }) =>
      _validateOn.getValue(scope),
    )

    return toConcise(validateOn, isString, VALIDATE_ON_TOUCH)
  })

  public readonly _validateOnVerbose = Impulse(
    (scope): ImpulseFormListValidateOnVerbose<TElement> =>
      map(this._elements.getValue(scope), ({ _validateOnVerbose }) =>
        _validateOnVerbose.getValue(scope),
      ),
  )

  public _setValidateOn(scope: Scope, setter: ImpulseFormListValidateOnSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._validateOnVerbose.getValue(scope)) : setter

    for (const [index, element] of entries(this._getInitialElements(scope))) {
      const validateOn = isString(setters) ? setters : setters.at(index)

      if (!isUndefined(validateOn)) {
        element._setValidateOn(scope, validateOn)
      }
    }

    for (const [index, element] of entries(this._elements.getValue(scope))) {
      const validateOn = isString(setters) ? setters : setters.at(index)

      if (!isUndefined(validateOn)) {
        element._setValidateOn(scope, validateOn)
      }
    }
  }

  public readonly _touched = Impulse((scope): ImpulseFormListFlag<TElement> => {
    const touched = map(this._elements.getValue(scope), ({ _touched }) => _touched.getValue(scope))

    return toConcise(touched, isBoolean, false)
  })

  public readonly _touchedVerbose = Impulse(
    (scope): ImpulseFormListFlagVerbose<TElement> =>
      map(this._elements.getValue(scope), ({ _touchedVerbose }) => _touchedVerbose.getValue(scope)),
  )

  public _setTouched(scope: Scope, setter: ImpulseFormListFlagSetter<TElement>): void {
    const setters = isFunction(setter) ? setter(this._touchedVerbose.getValue(scope)) : setter

    for (const [index, element] of entries(this._elements.getValue(scope))) {
      const touched = isBoolean(setters) ? setters : setters.at(index)

      if (!isUndefined(touched)) {
        element._setTouched(scope, touched)
      }
    }
  }

  public readonly _output = Impulse((scope): null | ImpulseFormListOutput<TElement> => {
    const output = map(this._elements.getValue(scope), ({ _output }) => _output.getValue(scope))

    if (output.some(isNull)) {
      return null
    }

    return output
  })

  public readonly _outputVerbose = Impulse(
    (scope): ImpulseFormListOutputVerbose<TElement> =>
      map(this._elements.getValue(scope), ({ _outputVerbose }) => _outputVerbose.getValue(scope)),
  )

  public readonly _valid = Impulse((scope): ImpulseFormListFlag<TElement> => {
    const valid = map(this._elements.getValue(scope), ({ _valid }) => _valid.getValue(scope))

    return toConcise(valid, isBoolean, false)
  })

  public readonly _validVerbose = Impulse(
    (scope): ImpulseFormListFlagVerbose<TElement> =>
      map(this._elements.getValue(scope), ({ _validVerbose }) => _validVerbose.getValue(scope)),
  )

  public readonly _invalid = Impulse((scope): ImpulseFormListFlag<TElement> => {
    const invalid = map(this._elements.getValue(scope), ({ _invalid }) => _invalid.getValue(scope))

    return toConcise(invalid, isBoolean, false)
  })

  public readonly _invalidVerbose = Impulse(
    (scope): ImpulseFormListFlagVerbose<TElement> =>
      map(this._elements.getValue(scope), ({ _invalidVerbose }) => _invalidVerbose.getValue(scope)),
  )

  public readonly _validated = Impulse((scope): ImpulseFormListFlag<TElement> => {
    const validated = map(this._elements.getValue(scope), ({ _validated }) =>
      _validated.getValue(scope),
    )

    return toConcise(validated, isBoolean, false)
  })

  public readonly _validatedVerbose = Impulse(
    (scope): ImpulseFormListFlagVerbose<TElement> =>
      map(this._elements.getValue(scope), ({ _validatedVerbose }) =>
        _validatedVerbose.getValue(scope),
      ),
  )

  public _forceValidated(scope: Scope): void {
    for (const element of this._elements.getValue(scope)) {
      element._forceValidated(scope)
    }
  }

  public readonly _dirty = Impulse((scope): ImpulseFormListFlag<TElement> => {
    const elements = this._elements.getValue(scope)
    const initialElements = this._getInitialElements(scope)

    const dirty = concat(
      map(elements, ({ _dirty, _dirtyOn }, index) => {
        if (index >= initialElements.length) {
          // added elements are always dirty
          return _dirtyOn.getValue(scope)
        }

        return _dirty.getValue(scope)
      }),

      // removed elements are always dirty
      map(drop(initialElements, elements.length), ({ _dirtyOn }) => _dirtyOn.getValue(scope)),
    )

    return toConcise(dirty, isBoolean, false)
  })

  public readonly _dirtyVerbose = Impulse((scope): ImpulseFormListFlagVerbose<TElement> => {
    const elements = this._elements.getValue(scope)
    const initialElements = this._getInitialElements(scope)

    return concat(
      map(elements, ({ _dirtyVerbose, _dirtyOnVerbose }, index) => {
        if (index >= initialElements.length) {
          // added elements are always dirty
          return _dirtyOnVerbose.getValue(scope)
        }

        return _dirtyVerbose.getValue(scope)
      }),

      // removed elements are always dirty
      map(drop(initialElements, elements.length), ({ _dirtyOnVerbose }) =>
        _dirtyOnVerbose.getValue(scope),
      ),
    )
  })

  public readonly _dirtyOn = Impulse((scope): ImpulseFormListFlag<TElement> => {
    const dirtyOn = map(this._getInitialElements(scope), ({ _dirtyOn }) => _dirtyOn.getValue(scope))

    return toConcise(dirtyOn, isBoolean, false)
  })

  public readonly _dirtyOnVerbose = Impulse(
    (scope): ImpulseFormListFlagVerbose<TElement> =>
      map(this._getInitialElements(scope), ({ _dirtyOnVerbose }) =>
        _dirtyOnVerbose.getValue(scope),
      ),
  )

  public _reset(scope: Scope, resetter: undefined | ImpulseFormListInputSetter<TElement>): void {
    if (!isUndefined(resetter)) {
      this._setInitial(scope, resetter)
    }

    const nextElements = this._getInitialElements(scope)

    for (const element of nextElements) {
      element._reset(scope, undefined)
    }

    this._elements.setValue(map(nextElements, (element) => this._parentOf(element)))
  }

  public _getChildren<TChildParams extends ImpulseFormParams>(
    scope: Scope,
  ): ReadonlyArray<ImpulseFormChild<TChildParams, ImpulseFormListParams<TElement>>> {
    return map(this._elements.getValue(scope), (element, index) => ({
      _state: element as unknown as ImpulseFormState<TChildParams>,
      _mapToChild: (output) => output.at(index),
    }))
  }
}
