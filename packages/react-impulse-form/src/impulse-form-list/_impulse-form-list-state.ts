import { drop } from "~/tools/drop"
import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { isString } from "~/tools/is-string"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"
import { map } from "~/tools/map"
import { map2 } from "~/tools/map2"

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
import {
  type ImpulseFormListError,
  isImpulseFormListErrorEqual,
} from "./impulse-form-list-error"
import type { ImpulseFormListErrorSetter } from "./impulse-form-list-error-setter"
import {
  type ImpulseFormListErrorVerbose,
  isImpulseFormListErrorVerboseEqual,
} from "./impulse-form-list-error-verbose"
import {
  type ImpulseFormListFlag,
  isImpulseFormListFlagEqual,
} from "./impulse-form-list-flag"
import type { ImpulseFormListFlagSetter } from "./impulse-form-list-flag-setter"
import {
  type ImpulseFormListFlagVerbose,
  isImpulseFormListFlagVerboseEqual,
} from "./impulse-form-list-flag-verbose"
import {
  type ImpulseFormListInitial,
  isImpulseFormListInitialEqual,
} from "./impulse-form-list-initial"
import {
  type ImpulseFormListInput,
  isImpulseFormListInputEqual,
} from "./impulse-form-list-input"
import type { ImpulseFormListInputSetter } from "./impulse-form-list-input-setter"
import {
  type ImpulseFormListOutput,
  isImpulseFormListOutputEqual,
} from "./impulse-form-list-output"
import {
  type ImpulseFormListOutputVerbose,
  isImpulseFormListOutputVerboseEqual,
} from "./impulse-form-list-output-verbose"
import { isImpulseFormListValidateOnEqual } from "./impulse-form-list-validate-on"
import type { ImpulseFormListValidateOnSetter } from "./impulse-form-list-validate-on-setter"
import {
  type ImpulseFormListValidateOnVerbose,
  isImpulseFormListValidateOnVerboseEqual,
} from "./impulse-form-list-validate-on-verbose"

export class ImpulseFormListState<
  TElement extends ImpulseForm = ImpulseForm,
> extends ImpulseFormState<ImpulseFormListParams<TElement>> {
  public readonly _host = Lazy(() => new ImpulseFormList(this))

  private readonly _elements: Impulse<
    ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>>
  >

  private readonly _initialElements: Impulse<
    ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>>
  >

  public constructor(
    parent: null | ImpulseFormState,
    initial: ImpulseFormListInitial<TElement>,
    elements: ReadonlyArray<ImpulseFormState<GetImpulseFormParams<TElement>>>,
  ) {
    super(parent)

    this._elements = Impulse(
      map2(elements, untrack(initial), (el, elInitial) => {
        return el._childOf(this, elInitial)
      }),
      {
        compare: isShallowArrayEqual,
      },
    )

    this._initialElements = Impulse(
      map2(elements, untrack(initial), (el, elInitial) => {
        return el._childOf(null, elInitial)
      }),
      {
        compare: isShallowArrayEqual,
      },
    )
  }

  public _childOf(
    parent: ImpulseFormState,
    initial: ImpulseFormListInitial<TElement>,
  ): ImpulseFormListState<TElement> {
    return new ImpulseFormListState(parent, initial, untrack(this._elements))
  }

  public _extractInitial(): ImpulseFormListInitial<TElement> {
    const initialElements = untrack(this._initialElements)

    return Impulse(
      map(initialElements, (element) => element._extractInitial()),
      {
        compare: isImpulseFormListInitialEqual,
      },
    )
  }

  public _getElements(scope: Scope): ReadonlyArray<TElement> {
    return map(
      this._elements.getValue(scope),
      ({ _host }) => _host() as TElement,
    )
  }

  public setElements(elements: ReadonlyArray<TElement>): void {
    const nextElements = map(elements, ({ _state }) => {
      if (this._hasSameRoot(_state)) {
        return _state
      }

      const initial = _state._extractInitial()

      return _state._childOf(this, initial)
    })

    this._elements.setValue(nextElements)
  }

  public readonly _initial = Impulse(
    (scope) => {
      const initial = this._initialElements
        .getValue(scope)
        .map(({ _initial }) => _initial.getValue(scope))

      return initial as ImpulseFormListInput<TElement>
    },

    {
      compare: isImpulseFormListInputEqual,
    },
  )

  public _setInitial(
    scope: Scope,
    setter: ImpulseFormListInputSetter<TElement>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._initial.getValue(scope), this._input.getValue(scope))
      : setter

    this._initialElements.setValue((initialElements) => {
      return map2(
        [
          ...initialElements,
          ...drop(this._elements.getValue(scope), initialElements.length),
        ],

        setters,

        (element, initial) => {
          if (!isUndefined(initial)) {
            element._setInitial(scope, initial)
          }

          return element
        },
      )
    })
  }

  public readonly _input = Impulse(
    (scope) => {
      const input = this._elements.getValue(scope).map(({ _input }) => {
        return _input.getValue(scope)
      })

      return input as ImpulseFormListInput<TElement>
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

    this._elements.getValue(scope).forEach((element, index) => {
      const input = setters.at(index)

      if (!isUndefined(input)) {
        element._setInput(scope, input)
      }
    })
  }

  public readonly _error = Impulse(
    (scope) => {
      const error = this._elements.getValue(scope).map(({ _error }) => {
        return _error.getValue(scope)
      })

      if (error.every(isNull)) {
        return null
      }

      return error as ImpulseFormListError<TElement>
    },
    {
      compare: isImpulseFormListErrorEqual,
    },
  )

  public readonly _errorVerbose = Impulse(
    (scope) => {
      const errorVerbose = this._elements
        .getValue(scope)
        .map(({ _errorVerbose }) => {
          return _errorVerbose.getValue(scope)
        })

      return errorVerbose as ImpulseFormListErrorVerbose<TElement>
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

    this._elements.getValue(scope).forEach((element, index) => {
      const error = isNull(setters) ? setters : setters.at(index)

      if (!isUndefined(error)) {
        element._setError(scope, error)
      }
    })
  }

  public readonly _validateOn = Impulse(
    (scope) => {
      const validateOn = this._elements
        .getValue(scope)
        .map(({ _validateOn }) => {
          return _validateOn.getValue(scope)
        })

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
      const validateOnVerbose = this._elements
        .getValue(scope)
        .map(({ _validateOnVerbose }) => _validateOnVerbose.getValue(scope))

      return validateOnVerbose as ImpulseFormListValidateOnVerbose<TElement>
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

    this._elements.getValue(scope).forEach((element, index) => {
      const validateOn = isString(setters) ? setters : setters.at(index)

      if (!isUndefined(validateOn)) {
        element._setValidateOn(scope, validateOn)
      }
    })
  }

  public readonly _touched = Impulse(
    (scope) => {
      const touched = this._elements.getValue(scope).map(({ _touched }) => {
        return _touched.getValue(scope)
      })

      const onlyTouched = touched.find(isBoolean) ?? false

      for (const fieldTouched of touched) {
        if (fieldTouched !== onlyTouched) {
          return touched as ImpulseFormListFlag<TElement>
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
      const touchedVerbose = this._elements
        .getValue(scope)
        .map(({ _touchedVerbose }) => {
          return _touchedVerbose.getValue(scope)
        })

      return touchedVerbose as ImpulseFormListFlagVerbose<TElement>
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

    this._elements.getValue(scope).map((element, index) => {
      const touched = isBoolean(setters) ? setters : setters.at(index)

      if (!isUndefined(touched)) {
        element._setTouched(scope, touched)
      }
    })
  }

  public readonly _output = Impulse(
    (scope) => {
      const output = this._elements.getValue(scope).map(({ _output }) => {
        return _output.getValue(scope)
      })

      if (output.some(isNull)) {
        return null
      }

      return output as ImpulseFormListOutput<TElement>
    },
    {
      compare: isImpulseFormListOutputEqual,
    },
  )

  public readonly _outputVerbose = Impulse(
    (scope) => {
      const outputVerbose = this._elements
        .getValue(scope)
        .map(({ _outputVerbose }) => {
          return _outputVerbose.getValue(scope)
        })

      return outputVerbose as ImpulseFormListOutputVerbose<TElement>
    },
    {
      compare: isImpulseFormListOutputVerboseEqual,
    },
  )

  public readonly _valid = Impulse(
    (scope) => {
      const valid = this._elements.getValue(scope).map(({ _valid }) => {
        return _valid.getValue(scope)
      })

      const onlyValid = valid.find(isBoolean) ?? false

      for (const fieldValid of valid) {
        if (fieldValid !== onlyValid) {
          return valid as ImpulseFormListFlag<TElement>
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
      const validVerbose = this._elements
        .getValue(scope)
        .map(({ _validVerbose }) => _validVerbose.getValue(scope))

      return validVerbose as ImpulseFormListFlagVerbose<TElement>
    },

    {
      compare: isImpulseFormListFlagVerboseEqual,
    },
  )

  public readonly _invalid = Impulse(
    (scope) => {
      const invalid = this._elements.getValue(scope).map(({ _invalid }) => {
        return _invalid.getValue(scope)
      })

      const onlyInvalid = invalid.find(isBoolean) ?? false

      for (const fieldInvalid of invalid) {
        if (fieldInvalid !== onlyInvalid) {
          return invalid as ImpulseFormListFlag<TElement>
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
      const invalidVerbose = this._elements
        .getValue(scope)
        .map(({ _invalidVerbose }) => {
          return _invalidVerbose.getValue(scope)
        })

      return invalidVerbose as ImpulseFormListFlagVerbose<TElement>
    },

    {
      compare: isImpulseFormListFlagVerboseEqual,
    },
  )

  public readonly _validated = Impulse(
    (scope) => {
      const validated = this._elements.getValue(scope).map(({ _validated }) => {
        return _validated.getValue(scope)
      })

      const onlyValidated = validated.find(isBoolean) ?? false

      for (const fieldValidated of validated) {
        if (fieldValidated !== onlyValidated) {
          return validated as ImpulseFormListFlag<TElement>
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
      const validatedVerbose = this._elements
        .getValue(scope)
        .map(({ _validatedVerbose }) => _validatedVerbose.getValue(scope))

      return validatedVerbose as ImpulseFormListFlagVerbose<TElement>
    },

    {
      compare: isImpulseFormListFlagVerboseEqual,
    },
  )

  public _forceValidated(scope: Scope): void {
    this._elements.getValue(scope).forEach((element) => {
      element._forceValidated(scope)
    })
  }

  public readonly _dirty = Impulse(
    (scope) => {
      const dirty = this._elements.getValue(scope).map(({ _dirty }) => {
        return _dirty.getValue(scope)
      })

      const onlyDirty = dirty.find(isBoolean) ?? false

      for (const fieldDirty of dirty) {
        if (fieldDirty !== onlyDirty) {
          return dirty as ImpulseFormListFlag<TElement>
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
      const dirtyVerbose = this._elements
        .getValue(scope)
        .map(({ _dirtyVerbose }) => {
          return _dirtyVerbose.getValue(scope)
        })

      return dirtyVerbose as ImpulseFormListFlagVerbose<TElement>
    },

    {
      compare: isImpulseFormListFlagVerboseEqual,
    },
  )

  public _reset(
    scope: Scope,
    resetter: undefined | ImpulseFormListInputSetter<TElement>,
  ): void {
    const resetters = isFunction(resetter)
      ? resetter(this._initial.getValue(scope), this._input.getValue(scope))
      : resetter

    this._elements.getValue(scope).forEach((field, index) => {
      field._reset(scope, resetters?.at(index))
    })
  }

  public _getChildren<TChildParams extends ImpulseFormParams>(
    scope: Scope,
  ): ReadonlyArray<
    ImpulseFormChild<TChildParams, ImpulseFormListParams<TElement>>
  > {
    return this._elements.getValue(scope).map((element, index) => ({
      _state: element,
      _mapToChild: (output) => output.at(index),
    }))
  }
}
