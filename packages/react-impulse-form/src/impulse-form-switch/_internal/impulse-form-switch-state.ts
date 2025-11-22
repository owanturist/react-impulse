import { Impulse, type ReadonlyImpulse, type Scope } from "react-impulse"

import { entries } from "~/tools/entries"
import { hasProperty } from "~/tools/has-property"
import { isBoolean } from "~/tools/is-boolean"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isString } from "~/tools/is-string"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"
import { mapValues } from "~/tools/map-values"
import { values } from "~/tools/values"

import type { GetImpulseFormParams } from "../../impulse-form/_internal/get-impulse-form-params"
import {
  type ImpulseFormChild,
  ImpulseFormState,
} from "../../impulse-form/_internal/impulse-form-state"
import type { ImpulseForm } from "../../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../../impulse-form/impulse-form-params"
import type { ValidateStrategy } from "../../validate-strategy"
import type { ImpulseFormSwitchBranch } from "../impulse-form-switch-branch"
import type { ImpulseFormSwitchBranches } from "../impulse-form-switch-branches"
import type { ImpulseFormSwitchError } from "../impulse-form-switch-error"
import type { ImpulseFormSwitchErrorSetter } from "../impulse-form-switch-error-setter"
import type { ImpulseFormSwitchErrorVerbose } from "../impulse-form-switch-error-verbose"
import type { ImpulseFormSwitchFlag } from "../impulse-form-switch-flag"
import type { ImpulseFormSwitchFlagSetter } from "../impulse-form-switch-flag-setter"
import type { ImpulseFormSwitchFlagVerbose } from "../impulse-form-switch-flag-verbose"
import type { ImpulseFormSwitchInput } from "../impulse-form-switch-input"
import type { ImpulseFormSwitchInputSetter } from "../impulse-form-switch-input-setter"
import type { ImpulseFormSwitchOutput } from "../impulse-form-switch-output"
import type { ImpulseFormSwitchOutputVerbose } from "../impulse-form-switch-output-verbose"
import type { ImpulseFormSwitchParams } from "../impulse-form-switch-params"
import type { ImpulseFormSwitchValidateOn } from "../impulse-form-switch-validate-on"
import type { ImpulseFormSwitchValidateOnSetter } from "../impulse-form-switch-validate-on-setter"
import type { ImpulseFormSwitchValidateOnVerbose } from "../impulse-form-switch-validate-on-verbose"

import { ImpulseFormSwitch } from "./impulse-form-switch"
import type { ImpulseFormSwitchConciseParam } from "./impulse-form-switch-concise-param"
import type { ImpulseFormSwitchVerboseParam } from "./impulse-form-switch-verbose-param"

type ImpulseFormSwitchStateBranches<TBranches> = {
  [TBranch in keyof TBranches]: ImpulseFormState<GetImpulseFormParams<TBranches[TBranch]>>
}

type ActiveSwitchStateBranch<TBranches> = ImpulseFormSwitchBranch<
  keyof TBranches,
  ImpulseFormSwitchStateBranches<TBranches>[keyof TBranches]
>

class ImpulseFormSwitchState<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> extends ImpulseFormState<ImpulseFormSwitchParams<TKind, TBranches>> {
  public readonly _host = Lazy(() => new ImpulseFormSwitch(this))

  public readonly _active: ImpulseFormState<GetImpulseFormParams<TKind>>
  public readonly _branches: ImpulseFormSwitchStateBranches<TBranches>

  public constructor(
    parent: null | ImpulseFormState,
    active: ImpulseFormState<GetImpulseFormParams<TKind>>,
    branches: ImpulseFormSwitchStateBranches<TBranches>,
  ) {
    super(parent)

    this._active = this._parentOf(active)
    this._branches = mapValues(branches, (branch) => this._parentOf(branch))
  }

  public _getActiveBranch(scope: Scope): undefined | ActiveSwitchStateBranch<TBranches> {
    const kind = this._active._output.getValue(scope)
    const value = isNull(kind) ? null : this._branches[kind]

    return value ? { kind, value } : undefined
  }

  private _toConcise<TKey extends keyof ImpulseFormParams, TConcise>(
    scope: Scope,
    extract: (form: ImpulseFormState) => ReadonlyImpulse<TConcise>,
    isConcise: (value: unknown) => value is TConcise,
    fallbackInvalid?: TConcise,
  ): ImpulseFormSwitchConciseParam<TKind, TBranches, TKey, TConcise> {
    const activeBranch = this._getActiveBranch(scope)
    const activeConcise = extract(this._active).getValue(scope)

    if (!activeBranch) {
      return isConcise(activeConcise) || isUndefined(fallbackInvalid)
        ? activeConcise
        : { active: activeConcise, branch: fallbackInvalid }
    }

    const branchConcise = extract(activeBranch.value).getValue(scope)

    if (isConcise(branchConcise) && isConcise(activeConcise) && branchConcise === activeConcise) {
      return activeConcise
    }

    return {
      active: activeConcise,
      branch: isConcise(branchConcise)
        ? branchConcise
        : {
            kind: activeBranch.kind,
            value: branchConcise,
          },
    }
  }

  private _toVerbose<TKey extends keyof ImpulseFormParams>(
    scope: Scope,
    extract: (form: ImpulseFormState) => ReadonlyImpulse<unknown>,
  ): ImpulseFormSwitchVerboseParam<TKind, TBranches, TKey> {
    const active = extract(this._active).getValue(scope)
    const branches = mapValues(this._branches, (branch) => extract(branch).getValue(scope))

    return { active, branches }
  }

  public _childOf(parent: null | ImpulseFormState): ImpulseFormSwitchState<TKind, TBranches> {
    return new ImpulseFormSwitchState(parent, this._active, this._branches)
  }

  // I N I T I A L

  public readonly _initial = Impulse(
    (scope): ImpulseFormSwitchInput<TKind, TBranches> =>
      this._toVerbose<"input.schema">(scope, ({ _initial }) => _initial),
  )

  public _setInitial(scope: Scope, setter: ImpulseFormSwitchInputSetter<TKind, TBranches>): void {
    const initial = Lazy(() => this._initial.getValue(scope))
    const input = Lazy(() => this._input.getValue(scope))

    const { active, branches: branchesSetter } = isFunction(setter)
      ? setter(initial(), input())
      : setter

    if (!isUndefined(active)) {
      this._active._setInitial(scope, active)
    }

    const branches = isFunction(branchesSetter)
      ? branchesSetter(initial().branches, input().branches)
      : branchesSetter

    for (const [kind, branch] of entries(this._branches)) {
      if (hasProperty(branches, kind) && !isUndefined(branches[kind])) {
        branch._setInitial(scope, branches[kind])
      }
    }
  }

  public _replaceInitial(
    scope: Scope,
    state: undefined | ImpulseFormSwitchState<TKind, TBranches>,
    isMounting: boolean,
  ): void {
    this._active._replaceInitial(scope, state?._active, isMounting)

    for (const [key, branch] of entries(this._branches)) {
      branch._replaceInitial(scope, state?._branches[key], isMounting)
    }
  }

  // I N P U T

  public readonly _input = Impulse(
    (scope): ImpulseFormSwitchInput<TKind, TBranches> =>
      this._toVerbose<"input.schema">(scope, ({ _input }) => _input),
  )

  public _setInput(scope: Scope, setter: ImpulseFormSwitchInputSetter<TKind, TBranches>): void {
    const initial = Lazy(() => this._initial.getValue(scope))
    const input = Lazy(() => this._input.getValue(scope))

    const { active, branches: branchesSetter } = isFunction(setter)
      ? setter(input(), initial())
      : setter

    if (!isUndefined(active)) {
      this._active._setInput(scope, active)
    }

    const branches = isFunction(branchesSetter)
      ? branchesSetter(input().branches, initial().branches)
      : branchesSetter

    for (const [kind, branch] of entries(this._branches)) {
      if (hasProperty(branches, kind) && !isUndefined(branches[kind])) {
        branch._setInput(scope, branches[kind])
      }
    }
  }

  // E R R O R

  public readonly _error = Impulse(
    (scope): ImpulseFormSwitchError<TKind, TBranches> =>
      this._toConcise<"error.schema", null>(scope, ({ _error }) => _error, isNull, null),
  )

  public readonly _errorVerbose = Impulse(
    (scope): ImpulseFormSwitchErrorVerbose<TKind, TBranches> =>
      this._toVerbose<"error.schema.verbose">(scope, ({ _errorVerbose }) => _errorVerbose),
  )

  public _setError(scope: Scope, setter: ImpulseFormSwitchErrorSetter<TKind, TBranches>): void {
    const verbose = Lazy(() => this._errorVerbose.getValue(scope))
    const resolved = isFunction(setter) ? setter(verbose()) : setter

    const [activeSetter, branchSetter, branchesSetter] = isNull(resolved)
      ? [resolved, resolved, undefined]
      : [
          resolved.active,

          hasProperty(resolved, "branch") ? resolved.branch : undefined,

          hasProperty(resolved, "branches")
            ? isFunction(resolved.branches)
              ? resolved.branches(verbose().branches)
              : resolved.branches
            : undefined,
        ]

    if (!isUndefined(activeSetter)) {
      this._active._setError(scope, activeSetter)
    }

    for (const [kind, branch] of entries(this._branches)) {
      const resolvedBranchSetter = isNull(branchesSetter)
        ? branchesSetter
        : hasProperty(branchesSetter, kind)
          ? branchesSetter[kind]
          : undefined

      if (!isUndefined(resolvedBranchSetter)) {
        branch._setError(scope, resolvedBranchSetter)
      }
    }

    if (!isUndefined(branchSetter)) {
      const activeBranch = this._getActiveBranch(scope)

      const activeBranchSetter = isFunction(branchSetter)
        ? activeBranch
          ? branchSetter({
              kind: activeBranch.kind,
              value: activeBranch.value._errorVerbose.getValue(scope),
            })
          : undefined
        : branchSetter

      if (isNull(activeBranchSetter)) {
        activeBranch?.value._setError(scope, activeBranchSetter)
      } else if (!isUndefined(activeBranchSetter)) {
        const { kind, value } = activeBranchSetter as ImpulseFormSwitchBranch<
          keyof TBranches,
          unknown
        >

        const targetBranch = hasProperty(this._branches, kind) ? this._branches[kind] : undefined

        if (targetBranch) {
          targetBranch._setError(scope, value)
        }
      }
    }
  }

  // V A L I D A T E   O N

  public readonly _validateOn = Impulse(
    (scope): ImpulseFormSwitchValidateOn<TKind, TBranches> =>
      this._toConcise<"validateOn.schema", ValidateStrategy>(
        scope,
        ({ _validateOn }) => _validateOn,
        isString as (value: unknown) => value is ValidateStrategy,
      ),
  )

  public readonly _validateOnVerbose = Impulse(
    (scope): ImpulseFormSwitchValidateOnVerbose<TKind, TBranches> =>
      this._toVerbose<"validateOn.schema.verbose">(
        scope,
        ({ _validateOnVerbose }) => _validateOnVerbose,
      ),
  )

  public _setValidateOn(
    scope: Scope,
    setter: ImpulseFormSwitchValidateOnSetter<TKind, TBranches>,
  ): void {
    const verbose = Lazy(() => this._validateOnVerbose.getValue(scope))
    const resolved = isFunction(setter) ? setter(verbose()) : setter

    const [activeSetter, branchSetter, branchesSetter] = isString(resolved)
      ? [resolved, resolved, undefined]
      : [
          resolved.active,

          hasProperty(resolved, "branch") ? resolved.branch : undefined,

          hasProperty(resolved, "branches")
            ? isFunction(resolved.branches)
              ? resolved.branches(verbose().branches)
              : resolved.branches
            : undefined,
        ]

    if (!isUndefined(activeSetter)) {
      this._active._setValidateOn(scope, activeSetter)
    }

    for (const [kind, branch] of entries(this._branches)) {
      const resolvedBranchSetter = isString(branchesSetter)
        ? branchesSetter
        : hasProperty(branchesSetter, kind)
          ? branchesSetter[kind]
          : undefined

      if (!isUndefined(resolvedBranchSetter)) {
        branch._setValidateOn(scope, resolvedBranchSetter)
      }
    }

    if (!isUndefined(branchSetter)) {
      const activeBranch = this._getActiveBranch(scope)

      const activeBranchSetter = isFunction(branchSetter)
        ? activeBranch
          ? branchSetter({
              kind: activeBranch.kind,
              value: activeBranch.value._validateOnVerbose.getValue(scope),
            })
          : undefined
        : branchSetter

      if (isString(activeBranchSetter)) {
        activeBranch?.value._setValidateOn(scope, activeBranchSetter)
      } else if (!isUndefined(activeBranchSetter)) {
        const { kind, value } = activeBranchSetter as ImpulseFormSwitchBranch<
          keyof TBranches,
          unknown
        >
        const targetBranch = hasProperty(this._branches, kind) ? this._branches[kind] : undefined

        if (targetBranch) {
          targetBranch._setValidateOn(scope, value)
        }
      }
    }
  }

  // T O U C H E D

  public readonly _touched = Impulse(
    (scope): ImpulseFormSwitchFlag<TKind, TBranches> =>
      this._toConcise<"flag.schema", boolean>(scope, ({ _touched }) => _touched, isBoolean),
  )

  public readonly _touchedVerbose = Impulse(
    (scope): ImpulseFormSwitchFlagVerbose<TKind, TBranches> =>
      this._toVerbose<"flag.schema.verbose">(scope, ({ _touchedVerbose }) => _touchedVerbose),
  )

  public _setTouched(scope: Scope, setter: ImpulseFormSwitchFlagSetter<TKind, TBranches>): void {
    const verbose = Lazy(() => this._touchedVerbose.getValue(scope))
    const resolved = isFunction(setter) ? setter(verbose()) : setter

    const [activeSetter, branchSetter, branchesSetter] = isBoolean(resolved)
      ? [resolved, resolved, undefined]
      : [
          resolved.active,

          hasProperty(resolved, "branch") ? resolved.branch : undefined,

          hasProperty(resolved, "branches")
            ? isFunction(resolved.branches)
              ? resolved.branches(verbose().branches)
              : resolved.branches
            : undefined,
        ]

    if (!isUndefined(activeSetter)) {
      this._active._setTouched(scope, activeSetter)
    }

    for (const [kind, branch] of entries(this._branches)) {
      const resolvedBranchSetter = isBoolean(branchesSetter)
        ? branchesSetter
        : hasProperty(branchesSetter, kind)
          ? branchesSetter[kind]
          : undefined

      if (!isUndefined(resolvedBranchSetter)) {
        branch._setTouched(scope, resolvedBranchSetter)
      }
    }

    if (!isUndefined(branchSetter)) {
      const activeBranch = this._getActiveBranch(scope)

      const activeBranchSetter = isFunction(branchSetter)
        ? activeBranch
          ? branchSetter({
              kind: activeBranch.kind,
              value: activeBranch.value._touchedVerbose.getValue(scope),
            })
          : undefined
        : branchSetter

      if (isBoolean(activeBranchSetter)) {
        activeBranch?.value._setTouched(scope, activeBranchSetter)
      } else if (!isUndefined(activeBranchSetter)) {
        const { kind, value } = activeBranchSetter as ImpulseFormSwitchBranch<
          keyof TBranches,
          unknown
        >
        const targetBranch = hasProperty(this._branches, kind) ? this._branches[kind] : undefined

        if (targetBranch) {
          targetBranch._setTouched(scope, value)
        }
      }
    }
  }

  // O U T P U T

  public readonly _output = Impulse((scope): null | ImpulseFormSwitchOutput<TKind, TBranches> => {
    const activeBranch = this._getActiveBranch(scope)

    if (!activeBranch) {
      return null
    }

    const value = activeBranch.value._output.getValue(scope)

    if (isNull(value)) {
      return null
    }

    return {
      kind: activeBranch.kind,
      value,
    }
  })

  public readonly _outputVerbose = Impulse(
    (scope): ImpulseFormSwitchOutputVerbose<TKind, TBranches> =>
      this._toVerbose(scope, ({ _output }) => _output),
  )

  // V A L I D

  public readonly _valid = Impulse(
    (scope): ImpulseFormSwitchFlag<TKind, TBranches> =>
      this._toConcise<"flag.schema", boolean>(scope, ({ _valid }) => _valid, isBoolean),
  )

  public readonly _validVerbose = Impulse(
    (scope): ImpulseFormSwitchFlagVerbose<TKind, TBranches> =>
      this._toVerbose<"flag.schema.verbose">(scope, ({ _validVerbose }) => _validVerbose),
  )

  // I N V A L I D

  public readonly _invalid = Impulse(
    (scope): ImpulseFormSwitchFlag<TKind, TBranches> =>
      this._toConcise<"flag.schema", boolean>(scope, ({ _invalid }) => _invalid, isBoolean),
  )

  public readonly _invalidVerbose = Impulse(
    (scope): ImpulseFormSwitchFlagVerbose<TKind, TBranches> =>
      this._toVerbose<"flag.schema.verbose">(scope, ({ _invalidVerbose }) => _invalidVerbose),
  )

  // V A L I D A T E D

  public readonly _validated = Impulse(
    (scope): ImpulseFormSwitchFlag<TKind, TBranches> =>
      this._toConcise<"flag.schema", boolean>(scope, ({ _validated }) => _validated, isBoolean),
  )

  public readonly _validatedVerbose = Impulse(
    (scope): ImpulseFormSwitchFlagVerbose<TKind, TBranches> =>
      this._toVerbose<"flag.schema.verbose">(scope, ({ _validatedVerbose }) => _validatedVerbose),
  )

  public _forceValidated(scope: Scope): void {
    this._active._forceValidated(scope)
    this._getActiveBranch(scope)?.value._forceValidated(scope)
  }

  // D I R T Y

  public readonly _dirty = Impulse(
    (scope): ImpulseFormSwitchFlag<TKind, TBranches> =>
      this._toConcise<"flag.schema", boolean>(scope, ({ _dirty }) => _dirty, isBoolean),
  )

  public readonly _dirtyVerbose = Impulse(
    (scope): ImpulseFormSwitchFlagVerbose<TKind, TBranches> =>
      this._toVerbose<"flag.schema.verbose">(scope, ({ _dirtyVerbose }) => _dirtyVerbose),
  )

  public readonly _dirtyOn = Impulse(
    (scope): ImpulseFormSwitchFlag<TKind, TBranches> =>
      this._toConcise<"flag.schema", boolean>(scope, ({ _dirtyOn }) => _dirtyOn, isBoolean),
  )

  public readonly _dirtyOnVerbose = Impulse(
    (scope): ImpulseFormSwitchFlagVerbose<TKind, TBranches> =>
      this._toVerbose<"flag.schema.verbose">(scope, ({ _dirtyOnVerbose }) => _dirtyOnVerbose),
  )

  // R E S E T

  public _reset(
    scope: Scope,
    resetter: undefined | ImpulseFormSwitchInputSetter<TKind, TBranches>,
  ): void {
    if (!isUndefined(resetter)) {
      this._setInitial(scope, resetter)
    }

    this._active._reset(scope, undefined)

    for (const branch of values(this._branches)) {
      branch._reset(scope, undefined)
    }
  }

  // C H I L D R E N

  public _getChildren<TChildParams extends ImpulseFormParams>(
    scope: Scope,
  ): ReadonlyArray<ImpulseFormChild<TChildParams, ImpulseFormSwitchParams<TKind, TBranches>>> {
    const activeChild: ImpulseFormChild<TChildParams, ImpulseFormSwitchParams<TKind, TBranches>> = {
      _state: this._active as unknown as ImpulseFormState<TChildParams>,
      _mapToChild: (output) => output.kind,
    }

    const activeBranch = this._getActiveBranch(scope)

    if (!activeBranch) {
      return [activeChild]
    }

    return [
      activeChild,
      {
        _state: activeBranch.value as unknown as ImpulseFormState<TChildParams>,
        _mapToChild: (output) => output.value,
      },
    ]
  }
}

export { ImpulseFormSwitchState }
