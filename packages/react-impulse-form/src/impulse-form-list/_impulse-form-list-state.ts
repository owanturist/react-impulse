import { concat } from "~/tools/concat"
import { drop } from "~/tools/drop"
import { entries } from "~/tools/entries"
import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { isString } from "~/tools/is-string"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"
import { map } from "~/tools/map"
import { take } from "~/tools/take"

import { Impulse, type Scope, untrack } from "../dependencies"
import type { GetImpulseFormParams } from "../impulse-form/get-impulse-form-params"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"
import {
  type ImpulseFormChild,
  ImpulseFormState,
} from "../impulse-form/impulse-form-state"
import { VALIDATE_ON_TOUCH } from "../validate-strategy"

import { ImpulseFormList } from "./_impulse-form-list"
import type { ImpulseFormListParams } from "./_impulse-form-list-params"
import { isImpulseFormListErrorEqual } from "./impulse-form-list-error"
import type { ImpulseFormListErrorSetter } from "./impulse-form-list-error-setter"
import { isImpulseFormListErrorVerboseEqual } from "./impulse-form-list-error-verbose"
import { isImpulseFormListFlagEqual } from "./impulse-form-list-flag"
import type { ImpulseFormListFlagSetter } from "./impulse-form-list-flag-setter"
import { isImpulseFormListFlagVerboseEqual } from "./impulse-form-list-flag-verbose"
import { isImpulseFormListInputEqual } from "./impulse-form-list-input"
import type { ImpulseFormListInputSetter } from "./impulse-form-list-input-setter"
import { isImpulseFormListOutputEqual } from "./impulse-form-list-output"
import { isImpulseFormListOutputVerboseEqual } from "./impulse-form-list-output-verbose"
import { isImpulseFormListValidateOnEqual } from "./impulse-form-list-validate-on"
import type { ImpulseFormListValidateOnSetter } from "./impulse-form-list-validate-on-setter"
import { isImpulseFormListValidateOnVerboseEqual } from "./impulse-form-list-validate-on-verbose"

export class ImpulseFormListState<
  TElement extends ImpulseForm = ImpulseForm,
> extends ImpulseFormState<ImpulseFormListParams<TElement>> {
  public readonly _host = Lazy(() => new ImpulseFormList(this))

  public readonly _elements: Impulse<
    ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>>
  >

  private readonly _initialElements: Impulse<{
    _list: Impulse<
      ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>>
    >
  }>

  public constructor(
    parent: null | ImpulseFormState,
    elements: ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>>,
  ) {
    super(parent)

    const initialElements = map(elements, (element) => element._clone())

    this._initialElements = Impulse({
      _list: Impulse(initialElements, {
        compare: isShallowArrayEqual,
      }),
    })

    this._elements = Impulse(
      untrack((scope) => {
        return map(elements, (element, index) => {
          const child = this._parentOf(element)

          child._replaceInitial(scope, initialElements.at(index), true)

          return child
        })
      }),
      {
        compare: isShallowArrayEqual,
      },
    )
  }

  public _childOf(
    parent: null | ImpulseFormState,
  ): ImpulseFormListState<TElement> {
    return new ImpulseFormListState(parent, untrack(this._elements))
  }

  public _getElements(scope: Scope): ReadonlyArray<TElement> {
    return map(
      this._elements.getValue(scope),
      ({ _host }) => _host() as TElement,
    )
  }

  public _getInitialElements(
    scope: Scope,
  ): ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>> {
    return this._initialElements.getValue(scope)._list.getValue(scope)
  }

  public readonly _initial = Impulse(
    (scope) => {
      return map(this._getInitialElements(scope), ({ _initial }) => {
        return _initial.getValue(scope)
      })
    },

    {
      compare: isImpulseFormListInputEqual,
    },
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

      for (const [index, element] of entries(
        initialElements._list.getValue(scope),
      )) {
        elements.at(index)?._replaceInitial(scope, element, isMounting)
      }
    }
  }

  public _setInitial(
    scope: Scope,
    setter: ImpulseFormListInputSetter<TElement>,
  ): void {
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
    (scope) => {
      return map(this._elements.getValue(scope), ({ _input }) => {
        return _input.getValue(scope)
      })
    },

    {
      compare: isImpulseFormListInputEqual,
    },
  )

  public _setInput(
    scope: Scope,
    setter: ImpulseFormListInputSetter<TElement>,
  ): void {
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

  public readonly _error = Impulse(
    (scope) => {
      const error = map(this._elements.getValue(scope), ({ _error }) => {
        return _error.getValue(scope)
      })

      if (error.every(isNull)) {
        return null
      }

      return error
    },
    {
      compare: isImpulseFormListErrorEqual,
    },
  )

  public readonly _errorVerbose = Impulse(
    (scope) => {
      return map(this._elements.getValue(scope), ({ _errorVerbose }) => {
        return _errorVerbose.getValue(scope)
      })
    },

    {
      compare: isImpulseFormListErrorVerboseEqual,
    },
  )

  public _setError(
    scope: Scope,
    setter: ImpulseFormListErrorSetter<TElement>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._errorVerbose.getValue(scope))
      : setter

    for (const [index, element] of entries(this._elements.getValue(scope))) {
      const error = isNull(setters) ? setters : setters.at(index)

      if (!isUndefined(error)) {
        element._setError(scope, error)
      }
    }
  }

  public readonly _validateOn = Impulse(
    (scope) => {
      const validateOn = map(
        this._elements.getValue(scope),
        ({ _validateOn }) => _validateOn.getValue(scope),
      )

      /**
       * Fallback to onTouch if none string validateOn is present.
       * When the elements are empty it will use it.
       * When the elements are not empty and have any value different than it uses the elements.
       */
      const onlyValidateOn = validateOn.find(isString) ?? VALIDATE_ON_TOUCH

      for (const fieldValidateOn of validateOn) {
        if (fieldValidateOn !== onlyValidateOn) {
          return validateOn
        }
      }

      return onlyValidateOn
    },

    {
      compare: isImpulseFormListValidateOnEqual,
    },
  )

  public readonly _validateOnVerbose = Impulse(
    (scope) => {
      return map(this._elements.getValue(scope), ({ _validateOnVerbose }) => {
        return _validateOnVerbose.getValue(scope)
      })
    },

    {
      compare: isImpulseFormListValidateOnVerboseEqual,
    },
  )

  public _setValidateOn(
    scope: Scope,
    setter: ImpulseFormListValidateOnSetter<TElement>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._validateOnVerbose.getValue(scope))
      : setter

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

  public readonly _touched = Impulse(
    (scope) => {
      const touched = map(this._elements.getValue(scope), ({ _touched }) => {
        return _touched.getValue(scope)
      })

      const onlyTouched = touched.find(isBoolean) ?? false

      for (const fieldTouched of touched) {
        if (fieldTouched !== onlyTouched) {
          return touched
        }
      }

      return onlyTouched
    },

    {
      compare: isImpulseFormListFlagEqual,
    },
  )

  public readonly _touchedVerbose = Impulse(
    (scope) => {
      return map(this._elements.getValue(scope), ({ _touchedVerbose }) => {
        return _touchedVerbose.getValue(scope)
      })
    },

    {
      compare: isImpulseFormListFlagVerboseEqual,
    },
  )

  public _setTouched(
    scope: Scope,
    setter: ImpulseFormListFlagSetter<TElement>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._touchedVerbose.getValue(scope))
      : setter

    for (const [index, element] of entries(this._elements.getValue(scope))) {
      const touched = isBoolean(setters) ? setters : setters.at(index)

      if (!isUndefined(touched)) {
        element._setTouched(scope, touched)
      }
    }
  }

  public readonly _output = Impulse(
    (scope) => {
      const output = map(this._elements.getValue(scope), ({ _output }) => {
        return _output.getValue(scope)
      })

      if (output.some(isNull)) {
        return null
      }

      return output
    },
    {
      compare: isImpulseFormListOutputEqual,
    },
  )

  public readonly _outputVerbose = Impulse(
    (scope) => {
      return map(this._elements.getValue(scope), ({ _outputVerbose }) => {
        return _outputVerbose.getValue(scope)
      })
    },
    {
      compare: isImpulseFormListOutputVerboseEqual,
    },
  )

  public readonly _valid = Impulse(
    (scope) => {
      const valid = map(this._elements.getValue(scope), ({ _valid }) => {
        return _valid.getValue(scope)
      })

      const onlyValid = valid.find(isBoolean) ?? false

      for (const fieldValid of valid) {
        if (fieldValid !== onlyValid) {
          return valid
        }
      }

      return onlyValid
    },

    {
      compare: isImpulseFormListFlagEqual,
    },
  )

  public readonly _validVerbose = Impulse(
    (scope) => {
      return map(this._elements.getValue(scope), ({ _validVerbose }) => {
        return _validVerbose.getValue(scope)
      })
    },

    {
      compare: isImpulseFormListFlagVerboseEqual,
    },
  )

  public readonly _invalid = Impulse(
    (scope) => {
      const invalid = map(this._elements.getValue(scope), ({ _invalid }) => {
        return _invalid.getValue(scope)
      })

      const onlyInvalid = invalid.find(isBoolean) ?? false

      for (const fieldInvalid of invalid) {
        if (fieldInvalid !== onlyInvalid) {
          return invalid
        }
      }

      return onlyInvalid
    },

    {
      compare: isImpulseFormListFlagEqual,
    },
  )

  public readonly _invalidVerbose = Impulse(
    (scope) => {
      return map(this._elements.getValue(scope), ({ _invalidVerbose }) => {
        return _invalidVerbose.getValue(scope)
      })
    },

    {
      compare: isImpulseFormListFlagVerboseEqual,
    },
  )

  public readonly _validated = Impulse(
    (scope) => {
      const validated = map(
        this._elements.getValue(scope),
        ({ _validated }) => {
          return _validated.getValue(scope)
        },
      )

      const onlyValidated = validated.find(isBoolean) ?? false

      for (const fieldValidated of validated) {
        if (fieldValidated !== onlyValidated) {
          return validated
        }
      }

      return onlyValidated
    },

    {
      compare: isImpulseFormListFlagEqual,
    },
  )

  public readonly _validatedVerbose = Impulse(
    (scope) => {
      return map(this._elements.getValue(scope), ({ _validatedVerbose }) => {
        return _validatedVerbose.getValue(scope)
      })
    },

    {
      compare: isImpulseFormListFlagVerboseEqual,
    },
  )

  public _forceValidated(scope: Scope): void {
    for (const element of this._elements.getValue(scope)) {
      element._forceValidated(scope)
    }
  }

  public readonly _dirty = Impulse(
    (scope) => {
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
        map(drop(initialElements, elements.length), ({ _dirtyOn }) => {
          return _dirtyOn.getValue(scope)
        }),
      )

      const onlyDirty = dirty.find(isBoolean) ?? false

      for (const fieldDirty of dirty) {
        if (fieldDirty !== onlyDirty) {
          return dirty
        }
      }

      return onlyDirty
    },

    {
      compare: isImpulseFormListFlagEqual,
    },
  )

  public readonly _dirtyVerbose = Impulse(
    (scope) => {
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
        map(drop(initialElements, elements.length), ({ _dirtyOnVerbose }) => {
          return _dirtyOnVerbose.getValue(scope)
        }),
      )
    },

    {
      compare: isImpulseFormListFlagVerboseEqual,
    },
  )

  public readonly _dirtyOn = Impulse(
    (scope) => {
      const dirtyOn = map(this._getInitialElements(scope), ({ _dirtyOn }) => {
        return _dirtyOn.getValue(scope)
      })

      const onlyDirty = dirtyOn.find(isBoolean) ?? false

      for (const fieldDirty of dirtyOn) {
        if (fieldDirty !== onlyDirty) {
          return dirtyOn
        }
      }

      return onlyDirty
    },

    {
      compare: isImpulseFormListFlagEqual,
    },
  )

  public readonly _dirtyOnVerbose = Impulse(
    (scope) => {
      return map(this._getInitialElements(scope), ({ _dirtyOnVerbose }) => {
        return _dirtyOnVerbose.getValue(scope)
      })
    },

    {
      compare: isImpulseFormListFlagVerboseEqual,
    },
  )

  public _reset(
    scope: Scope,
    resetter: undefined | ImpulseFormListInputSetter<TElement>,
  ): void {
    this._setInitial(scope, resetter ?? this._initial.getValue(scope))

    const nextElements = this._getInitialElements(scope)

    for (const element of nextElements) {
      element._reset(scope, undefined)
    }

    this._elements.setValue(
      map(nextElements, (element) => this._parentOf(element)),
    )
  }

  public _getChildren<TChildParams extends ImpulseFormParams>(
    scope: Scope,
  ): ReadonlyArray<
    ImpulseFormChild<TChildParams, ImpulseFormListParams<TElement>>
  > {
    return map(this._elements.getValue(scope), (element, index) => ({
      _state: element as unknown as ImpulseFormState<TChildParams>,
      _mapToChild: (output) => output.at(index),
    }))
  }
}
