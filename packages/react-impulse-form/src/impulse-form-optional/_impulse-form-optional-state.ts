import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"

import { Impulse, type ReadonlyImpulse, type Scope } from "../dependencies"
import type { ImpulseForm, ImpulseFormParams } from "../impulse-form"
import type { GetImpulseFormParams } from "../impulse-form/get-impulse-form-params"
import {
  type ImpulseFormChild,
  ImpulseFormState,
} from "../impulse-form/impulse-form-state"
import { toConcise } from "../to-concise"
import type { ValidateStrategy } from "../validate-strategy"

import { ImpulseFormOptional } from "./_impulse-form-optional"
import type { ImpulseFormOptionalParams } from "./_impulse-form-optional-params"
import type { ImpulseFormOptionalError } from "./impulse-form-optional-error"
import type { ImpulseFormOptionalErrorSetter } from "./impulse-form-optional-error-setter"
import type { ImpulseFormOptionalErrorVerbose } from "./impulse-form-optional-error-verbose"
import type { ImpulseFormOptionalFlag } from "./impulse-form-optional-flag"
import type { ImpulseFormOptionalFlagSetter } from "./impulse-form-optional-flag-setter"
import type { ImpulseFormOptionalFlagVerbose } from "./impulse-form-optional-flag-verbose"
import type { ImpulseFormOptionalInput } from "./impulse-form-optional-input"
import type { ImpulseFormOptionalInputSetter } from "./impulse-form-optional-input-setter"
import type { ImpulseFormOptionalOutput } from "./impulse-form-optional-output"
import type { ImpulseFormOptionalOutputVerbose } from "./impulse-form-optional-output-verbose"
import type { ImpulseFormOptionalValidateOn } from "./impulse-form-optional-validate-on"
import type { ImpulseFormOptionalValidateOnSetter } from "./impulse-form-optional-validate-on-setter"
import type { ImpulseFormOptionalValidateOnVerbose } from "./impulse-form-optional-validate-on-verbose"

export class ImpulseFormOptionalState<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> extends ImpulseFormState<ImpulseFormOptionalParams<TEnabled, TElement>> {
  public readonly _host = Lazy(() => new ImpulseFormOptional(this))

  public readonly _enabled: ImpulseFormState<GetImpulseFormParams<TEnabled>>
  public readonly _element: ImpulseFormState<GetImpulseFormParams<TElement>>

  public constructor(
    parent: null | ImpulseFormState,
    enabled: ImpulseFormState<GetImpulseFormParams<TEnabled>>,
    element: ImpulseFormState<GetImpulseFormParams<TElement>>,
  ) {
    super(parent)

    this._enabled = this._parentOf(enabled)
    this._element = this._parentOf(element)
  }

  private _isEnabled(scope: Scope): boolean {
    return this._enabled._output.getValue(scope) === true
  }

  private _getEnabledElement(
    scope: Scope,
  ): undefined | ImpulseFormState<GetImpulseFormParams<TElement>> {
    return this._isEnabled(scope) ? this._element : undefined
  }

  public _childOf(
    parent: null | ImpulseFormState,
  ): ImpulseFormOptionalState<TEnabled, TElement> {
    return new ImpulseFormOptionalState(parent, this._enabled, this._element)
  }

  private _toConcise<TConcise>(
    scope: Scope,
    extract: (form: ImpulseFormState) => ReadonlyImpulse<TConcise>,
    isConcise: (value: unknown) => value is TConcise,
    fallbackDisabled?: TConcise,
  ): TConcise | { enabled: TConcise; element: TConcise } {
    const enabled = extract(this._enabled).getValue(scope)
    const enabledElement = this._getEnabledElement(scope)

    if (!enabledElement) {
      return !isConcise(enabled) && !isUndefined(fallbackDisabled)
        ? { enabled, element: fallbackDisabled }
        : enabled
    }

    const element = extract(enabledElement).getValue(scope)

    return toConcise([enabled, element], isConcise, enabled, {
      enabled,
      element,
    }) as TConcise | { enabled: TConcise; element: TConcise }
  }

  private _toVerbose(
    scope: Scope,
    extract: (form: ImpulseFormState) => ReadonlyImpulse<unknown>,
  ): ImpulseFormOptionalInput<TEnabled, TElement> {
    const enabled = extract(this._enabled).getValue(scope)
    const element = extract(this._element).getValue(scope)

    return { enabled, element } as ImpulseFormOptionalInput<TEnabled, TElement>
  }

  // I N I T I A L

  public readonly _initial = Impulse(
    (scope): ImpulseFormOptionalInput<TEnabled, TElement> => {
      return this._toVerbose(scope, ({ _initial }) => _initial)
    },
  )

  public _setInitial(
    scope: Scope,
    setter: ImpulseFormOptionalInputSetter<TEnabled, TElement>,
  ): void {
    const { enabled, element } = isFunction(setter)
      ? setter(this._initial.getValue(scope), this._input.getValue(scope))
      : setter

    if (!isUndefined(enabled)) {
      this._enabled._setInitial(scope, enabled)
    }

    if (!isUndefined(element)) {
      this._element._setInitial(scope, element)
    }
  }

  public _replaceInitial(
    scope: Scope,
    state: undefined | ImpulseFormOptionalState<TEnabled, TElement>,
    isMounting: boolean,
  ): void {
    this._enabled._replaceInitial(scope, state?._enabled, isMounting)
    this._element._replaceInitial(scope, state?._element, isMounting)
  }

  // I N P U T

  public readonly _input = Impulse(
    (scope): ImpulseFormOptionalInput<TEnabled, TElement> => {
      return this._toVerbose(scope, ({ _input }) => _input)
    },
  )

  public _setInput(
    scope: Scope,
    setter: ImpulseFormOptionalInputSetter<TEnabled, TElement>,
  ): void {
    const { enabled, element } = isFunction(setter)
      ? setter(this._input.getValue(scope), this._initial.getValue(scope))
      : setter

    if (!isUndefined(enabled)) {
      this._enabled._setInput(scope, enabled)
    }

    if (!isUndefined(element)) {
      this._element._setInput(scope, element)
    }
  }

  // E R R O R

  public readonly _error = Impulse(
    (scope): ImpulseFormOptionalError<TEnabled, TElement> => {
      return this._toConcise<null>(
        scope,
        ({ _error }) => _error,
        isNull,
        null,
      ) as ImpulseFormOptionalError<TEnabled, TElement>
    },
  )

  public readonly _errorVerbose = Impulse(
    (scope): ImpulseFormOptionalErrorVerbose<TEnabled, TElement> => {
      return this._toVerbose(
        scope,
        ({ _errorVerbose }) => _errorVerbose,
      ) as ImpulseFormOptionalErrorVerbose<TEnabled, TElement>
    },
  )

  public _setError(
    scope: Scope,
    setter: ImpulseFormOptionalErrorSetter<TEnabled, TElement>,
  ): void {
    const resolved = isFunction(setter)
      ? setter(this._errorVerbose.getValue(scope))
      : setter

    const [enabledSetter, elementSetter] = isNull(resolved)
      ? [null, null]
      : [resolved.enabled, resolved.element]

    if (!isUndefined(enabledSetter)) {
      this._enabled._setError(scope, enabledSetter)
    }

    if (!isUndefined(elementSetter)) {
      this._getEnabledElement(scope)?._setError(scope, elementSetter)
    }
  }

  // V A L I D A T E   O N

  public readonly _validateOn = Impulse(
    (scope): ImpulseFormOptionalValidateOn<TEnabled, TElement> => {
      return this._toConcise<ValidateStrategy>(
        scope,
        ({ _validateOn }) => _validateOn,
        isString as (value: unknown) => value is ValidateStrategy,
      ) as ImpulseFormOptionalValidateOn<TEnabled, TElement>
    },
  )

  public readonly _validateOnVerbose = Impulse(
    (scope): ImpulseFormOptionalValidateOnVerbose<TEnabled, TElement> => {
      return this._toVerbose(
        scope,
        ({ _validateOnVerbose }) => _validateOnVerbose,
      ) as ImpulseFormOptionalValidateOnVerbose<TEnabled, TElement>
    },
  )

  public _setValidateOn(
    scope: Scope,
    setter: ImpulseFormOptionalValidateOnSetter<TEnabled, TElement>,
  ): void {
    const resolved = isFunction(setter)
      ? setter(this._validateOnVerbose.getValue(scope))
      : setter

    const [enabledSetter, elementSetter] = isString(resolved)
      ? [resolved, this._isEnabled(scope) ? resolved : undefined]
      : [resolved.enabled, resolved.element]

    if (!isUndefined(enabledSetter)) {
      this._enabled._setValidateOn(scope, enabledSetter)
    }

    if (!isUndefined(elementSetter)) {
      this._element._setValidateOn(scope, elementSetter)
    }
  }

  // T O U C H E D

  public readonly _touched = Impulse(
    (scope): ImpulseFormOptionalFlag<TEnabled, TElement> => {
      return this._toConcise<boolean>(
        scope,
        ({ _touched }) => _touched,
        isBoolean,
      ) as ImpulseFormOptionalFlag<TEnabled, TElement>
    },
  )

  public readonly _touchedVerbose = Impulse(
    (scope): ImpulseFormOptionalFlagVerbose<TEnabled, TElement> => {
      return this._toVerbose(
        scope,
        ({ _touchedVerbose }) => _touchedVerbose,
      ) as ImpulseFormOptionalFlagVerbose<TEnabled, TElement>
    },
  )

  public _setTouched(
    scope: Scope,
    setter: ImpulseFormOptionalFlagSetter<TEnabled, TElement>,
  ): void {
    const resolved = isFunction(setter)
      ? setter(this._touchedVerbose.getValue(scope))
      : setter

    const [enabledSetter, elementSetter] = isBoolean(resolved)
      ? [resolved, this._isEnabled(scope) ? resolved : undefined]
      : [resolved.enabled, resolved.element]

    if (!isUndefined(enabledSetter)) {
      this._enabled._setTouched(scope, enabledSetter)
    }

    if (!isUndefined(elementSetter)) {
      this._element._setTouched(scope, elementSetter)
    }
  }

  // O U T P U T

  public readonly _output = Impulse(
    (scope): null | ImpulseFormOptionalOutput<TElement> => {
      const enabled = this._enabled._output.getValue(scope)

      if (enabled === false) {
        return undefined
      }

      if (isNull(enabled)) {
        return null
      }

      const value = this._element._output.getValue(scope)

      if (isNull(value)) {
        return null
      }

      return value
    },
  )

  public readonly _outputVerbose = Impulse(
    (scope): ImpulseFormOptionalOutputVerbose<TEnabled, TElement> => {
      return this._toVerbose(scope, ({ _output }) => _output)
    },
  )

  // V A L I D

  public readonly _valid = Impulse(
    (scope): ImpulseFormOptionalFlag<TEnabled, TElement> => {
      return this._toConcise<boolean>(
        scope,
        ({ _valid }) => _valid,
        isBoolean,
      ) as ImpulseFormOptionalFlag<TEnabled, TElement>
    },
  )

  public readonly _validVerbose = Impulse(
    (scope): ImpulseFormOptionalFlagVerbose<TEnabled, TElement> => {
      return this._toVerbose(
        scope,
        ({ _validVerbose }) => _validVerbose,
      ) as ImpulseFormOptionalFlagVerbose<TEnabled, TElement>
    },
  )

  // I N V A L I D

  public readonly _invalid = Impulse(
    (scope): ImpulseFormOptionalFlag<TEnabled, TElement> => {
      return this._toConcise<boolean>(
        scope,
        ({ _invalid }) => _invalid,
        isBoolean,
      ) as ImpulseFormOptionalFlag<TEnabled, TElement>
    },
  )

  public readonly _invalidVerbose = Impulse(
    (scope): ImpulseFormOptionalFlagVerbose<TEnabled, TElement> => {
      return this._toVerbose(
        scope,
        ({ _invalidVerbose }) => _invalidVerbose,
      ) as ImpulseFormOptionalFlagVerbose<TEnabled, TElement>
    },
  )

  // V A L I D A T E D

  public readonly _validated = Impulse(
    (scope): ImpulseFormOptionalFlag<TEnabled, TElement> => {
      return this._toConcise<boolean>(
        scope,
        ({ _validated }) => _validated,
        isBoolean,
      ) as ImpulseFormOptionalFlag<TEnabled, TElement>
    },
  )

  public readonly _validatedVerbose = Impulse(
    (scope): ImpulseFormOptionalFlagVerbose<TEnabled, TElement> => {
      return this._toVerbose(
        scope,
        ({ _validatedVerbose }) => _validatedVerbose,
      ) as ImpulseFormOptionalFlagVerbose<TEnabled, TElement>
    },
  )

  public _forceValidated(scope: Scope): void {
    this._enabled._forceValidated(scope)
    this._element._forceValidated(scope)
  }

  // D I R T Y

  public readonly _dirty = Impulse(
    (scope): ImpulseFormOptionalFlag<TEnabled, TElement> => {
      return this._toConcise<boolean>(
        scope,
        ({ _dirty }) => _dirty,
        isBoolean,
      ) as ImpulseFormOptionalFlag<TEnabled, TElement>
    },
  )

  public readonly _dirtyVerbose = Impulse(
    (scope): ImpulseFormOptionalFlagVerbose<TEnabled, TElement> => {
      return this._toVerbose(
        scope,
        ({ _dirtyVerbose }) => _dirtyVerbose,
      ) as ImpulseFormOptionalFlagVerbose<TEnabled, TElement>
    },
  )

  public readonly _dirtyOn = Impulse(
    (scope): ImpulseFormOptionalFlag<TEnabled, TElement> => {
      return this._toConcise<boolean>(
        scope,
        ({ _dirtyOn }) => _dirtyOn,
        isBoolean,
      ) as ImpulseFormOptionalFlag<TEnabled, TElement>
    },
  )

  public readonly _dirtyOnVerbose = Impulse(
    (scope): ImpulseFormOptionalFlagVerbose<TEnabled, TElement> => {
      return this._toVerbose(
        scope,
        ({ _dirtyOnVerbose }) => _dirtyOnVerbose,
      ) as ImpulseFormOptionalFlagVerbose<TEnabled, TElement>
    },
  )

  // R E S E T

  public _reset(
    scope: Scope,
    resetter: undefined | ImpulseFormOptionalInputSetter<TEnabled, TElement>,
  ): void {
    if (!isUndefined(resetter)) {
      this._setInitial(scope, resetter)
    }

    this._enabled._reset(scope, undefined)
    this._element._reset(scope, undefined)
  }

  // C H I L D R E N

  public _getChildren<TChildParams extends ImpulseFormParams>(
    scope: Scope,
  ): ReadonlyArray<
    ImpulseFormChild<
      TChildParams,
      ImpulseFormOptionalParams<TEnabled, TElement>
    >
  > {
    const enabledValue = this._enabled._output.getValue(scope)

    const enabledChild: ImpulseFormChild<
      TChildParams,
      ImpulseFormOptionalParams<TEnabled, TElement>
    > = {
      _state: this._enabled as unknown as ImpulseFormState<TChildParams>,
      _mapToChild: () =>
        enabledValue as unknown as TChildParams["output.schema"],
    }

    if (enabledValue !== true) {
      return [enabledChild]
    }

    return [
      enabledChild,
      {
        _state: this._element as unknown as ImpulseFormState<TChildParams>,
        _mapToChild: (output) => output,
      },
    ]
  }
}
