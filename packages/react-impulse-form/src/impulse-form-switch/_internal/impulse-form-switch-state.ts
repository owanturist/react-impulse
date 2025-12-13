import { type Monitor, type ReadableSignal, Signal } from "@owanturist/signal"

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

import type { GetSignalFormParams } from "../../impulse-form/_internal/get-impulse-form-params"
import {
  type SignalFormChild,
  SignalFormState,
} from "../../impulse-form/_internal/impulse-form-state"
import type { SignalForm } from "../../impulse-form/impulse-form"
import type { SignalFormParams } from "../../impulse-form/impulse-form-params"
import type { ValidateStrategy } from "../../validate-strategy"
import type { FormSwitchBranch } from "../impulse-form-switch-branch"
import type { FormSwitchBranches } from "../impulse-form-switch-branches"
import type { FormSwitchError } from "../impulse-form-switch-error"
import type { FormSwitchErrorSetter } from "../impulse-form-switch-error-setter"
import type { FormSwitchErrorVerbose } from "../impulse-form-switch-error-verbose"
import type { FormSwitchFlag } from "../impulse-form-switch-flag"
import type { FormSwitchFlagSetter } from "../impulse-form-switch-flag-setter"
import type { FormSwitchFlagVerbose } from "../impulse-form-switch-flag-verbose"
import type { FormSwitchInput } from "../impulse-form-switch-input"
import type { FormSwitchInputSetter } from "../impulse-form-switch-input-setter"
import type { FormSwitchOutput } from "../impulse-form-switch-output"
import type { FormSwitchOutputVerbose } from "../impulse-form-switch-output-verbose"
import type { FormSwitchParams } from "../impulse-form-switch-params"
import type { FormSwitchValidateOn } from "../impulse-form-switch-validate-on"
import type { FormSwitchValidateOnSetter } from "../impulse-form-switch-validate-on-setter"
import type { FormSwitchValidateOnVerbose } from "../impulse-form-switch-validate-on-verbose"

import { FormSwitch } from "./impulse-form-switch"
import type { FormSwitchConciseParam } from "./impulse-form-switch-concise-param"
import type { FormSwitchVerboseParam } from "./impulse-form-switch-verbose-param"

type FormSwitchStateBranches<TBranches> = {
  [TBranch in keyof TBranches]: SignalFormState<GetSignalFormParams<TBranches[TBranch]>>
}

type ActiveSwitchStateBranch<TBranches> = FormSwitchBranch<
  keyof TBranches,
  FormSwitchStateBranches<TBranches>[keyof TBranches]
>

class FormSwitchState<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> extends SignalFormState<FormSwitchParams<TKind, TBranches>> {
  public readonly _host = Lazy(() => new FormSwitch(this))

  public readonly _active: SignalFormState<GetSignalFormParams<TKind>>
  public readonly _branches: FormSwitchStateBranches<TBranches>

  public constructor(
    parent: null | SignalFormState,
    active: SignalFormState<GetSignalFormParams<TKind>>,
    branches: FormSwitchStateBranches<TBranches>,
  ) {
    super(parent)

    this._active = this._parentOf(active)
    this._branches = mapValues(branches, (branch) => this._parentOf(branch))
  }

  public _getActiveBranch(monitor: Monitor): undefined | ActiveSwitchStateBranch<TBranches> {
    const kind = this._active._output.read(monitor)
    const value = isNull(kind) ? null : this._branches[kind]

    return value ? { kind, value } : undefined
  }

  private _toConcise<TKey extends keyof SignalFormParams, TConcise>(
    monitor: Monitor,
    extract: (form: SignalFormState) => ReadableSignal<TConcise>,
    isConcise: (value: unknown) => value is TConcise,
    fallbackInvalid?: TConcise,
  ): FormSwitchConciseParam<TKind, TBranches, TKey, TConcise> {
    const activeBranch = this._getActiveBranch(monitor)
    const activeConcise = extract(this._active).read(monitor)

    if (!activeBranch) {
      return isConcise(activeConcise) || isUndefined(fallbackInvalid)
        ? activeConcise
        : { active: activeConcise, branch: fallbackInvalid }
    }

    const branchConcise = extract(activeBranch.value).read(monitor)

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

  private _toVerbose<TKey extends keyof SignalFormParams>(
    monitor: Monitor,
    extract: (form: SignalFormState) => ReadableSignal<unknown>,
  ): FormSwitchVerboseParam<TKind, TBranches, TKey> {
    const active = extract(this._active).read(monitor)
    const branches = mapValues(this._branches, (branch) => extract(branch).read(monitor))

    return { active, branches }
  }

  public _childOf(parent: null | SignalFormState): FormSwitchState<TKind, TBranches> {
    return new FormSwitchState(parent, this._active, this._branches)
  }

  // I N I T I A L

  public readonly _initial = Signal(
    (monitor): FormSwitchInput<TKind, TBranches> =>
      this._toVerbose<"input.schema">(monitor, ({ _initial }) => _initial),
  )

  public _setInitial(monitor: Monitor, setter: FormSwitchInputSetter<TKind, TBranches>): void {
    const initial = Lazy(() => this._initial.read(monitor))
    const input = Lazy(() => this._input.read(monitor))

    const { active, branches: branchesSetter } = isFunction(setter)
      ? setter(initial(), input())
      : setter

    if (!isUndefined(active)) {
      this._active._setInitial(monitor, active)
    }

    const branches = isFunction(branchesSetter)
      ? branchesSetter(initial().branches, input().branches)
      : branchesSetter

    for (const [kind, branch] of entries(this._branches)) {
      if (hasProperty(branches, kind) && !isUndefined(branches[kind])) {
        branch._setInitial(monitor, branches[kind])
      }
    }
  }

  public _replaceInitial(
    monitor: Monitor,
    state: undefined | FormSwitchState<TKind, TBranches>,
    isMounting: boolean,
  ): void {
    this._active._replaceInitial(monitor, state?._active, isMounting)

    for (const [key, branch] of entries(this._branches)) {
      branch._replaceInitial(monitor, state?._branches[key], isMounting)
    }
  }

  // I N P U T

  public readonly _input = Signal(
    (monitor): FormSwitchInput<TKind, TBranches> =>
      this._toVerbose<"input.schema">(monitor, ({ _input }) => _input),
  )

  public _setInput(monitor: Monitor, setter: FormSwitchInputSetter<TKind, TBranches>): void {
    const initial = Lazy(() => this._initial.read(monitor))
    const input = Lazy(() => this._input.read(monitor))

    const { active, branches: branchesSetter } = isFunction(setter)
      ? setter(input(), initial())
      : setter

    if (!isUndefined(active)) {
      this._active._setInput(monitor, active)
    }

    const branches = isFunction(branchesSetter)
      ? branchesSetter(input().branches, initial().branches)
      : branchesSetter

    for (const [kind, branch] of entries(this._branches)) {
      if (hasProperty(branches, kind) && !isUndefined(branches[kind])) {
        branch._setInput(monitor, branches[kind])
      }
    }
  }

  // E R R O R

  public readonly _error = Signal(
    (monitor): FormSwitchError<TKind, TBranches> =>
      this._toConcise<"error.schema", null>(monitor, ({ _error }) => _error, isNull, null),
  )

  public readonly _errorVerbose = Signal(
    (monitor): FormSwitchErrorVerbose<TKind, TBranches> =>
      this._toVerbose<"error.schema.verbose">(monitor, ({ _errorVerbose }) => _errorVerbose),
  )

  public _setError(monitor: Monitor, setter: FormSwitchErrorSetter<TKind, TBranches>): void {
    const verbose = Lazy(() => this._errorVerbose.read(monitor))
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
      this._active._setError(monitor, activeSetter)
    }

    for (const [kind, branch] of entries(this._branches)) {
      const resolvedBranchSetter = isNull(branchesSetter)
        ? branchesSetter
        : hasProperty(branchesSetter, kind)
          ? branchesSetter[kind]
          : undefined

      if (!isUndefined(resolvedBranchSetter)) {
        branch._setError(monitor, resolvedBranchSetter)
      }
    }

    if (!isUndefined(branchSetter)) {
      const activeBranch = this._getActiveBranch(monitor)

      const activeBranchSetter = isFunction(branchSetter)
        ? activeBranch
          ? branchSetter({
              kind: activeBranch.kind,
              value: activeBranch.value._errorVerbose.read(monitor),
            })
          : undefined
        : branchSetter

      if (isNull(activeBranchSetter)) {
        activeBranch?.value._setError(monitor, activeBranchSetter)
      } else if (!isUndefined(activeBranchSetter)) {
        const { kind, value } = activeBranchSetter as FormSwitchBranch<keyof TBranches, unknown>

        const targetBranch = hasProperty(this._branches, kind) ? this._branches[kind] : undefined

        if (targetBranch) {
          targetBranch._setError(monitor, value)
        }
      }
    }
  }

  // V A L I D A T E   O N

  public readonly _validateOn = Signal(
    (monitor): FormSwitchValidateOn<TKind, TBranches> =>
      this._toConcise<"validateOn.schema", ValidateStrategy>(
        monitor,
        ({ _validateOn }) => _validateOn,
        isString as (value: unknown) => value is ValidateStrategy,
      ),
  )

  public readonly _validateOnVerbose = Signal(
    (monitor): FormSwitchValidateOnVerbose<TKind, TBranches> =>
      this._toVerbose<"validateOn.schema.verbose">(
        monitor,
        ({ _validateOnVerbose }) => _validateOnVerbose,
      ),
  )

  public _setValidateOn(
    monitor: Monitor,
    setter: FormSwitchValidateOnSetter<TKind, TBranches>,
  ): void {
    const verbose = Lazy(() => this._validateOnVerbose.read(monitor))
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
      this._active._setValidateOn(monitor, activeSetter)
    }

    for (const [kind, branch] of entries(this._branches)) {
      const resolvedBranchSetter = isString(branchesSetter)
        ? branchesSetter
        : hasProperty(branchesSetter, kind)
          ? branchesSetter[kind]
          : undefined

      if (!isUndefined(resolvedBranchSetter)) {
        branch._setValidateOn(monitor, resolvedBranchSetter)
      }
    }

    if (!isUndefined(branchSetter)) {
      const activeBranch = this._getActiveBranch(monitor)

      const activeBranchSetter = isFunction(branchSetter)
        ? activeBranch
          ? branchSetter({
              kind: activeBranch.kind,
              value: activeBranch.value._validateOnVerbose.read(monitor),
            })
          : undefined
        : branchSetter

      if (isString(activeBranchSetter)) {
        activeBranch?.value._setValidateOn(monitor, activeBranchSetter)
      } else if (!isUndefined(activeBranchSetter)) {
        const { kind, value } = activeBranchSetter as FormSwitchBranch<keyof TBranches, unknown>
        const targetBranch = hasProperty(this._branches, kind) ? this._branches[kind] : undefined

        if (targetBranch) {
          targetBranch._setValidateOn(monitor, value)
        }
      }
    }
  }

  // T O U C H E D

  public readonly _touched = Signal(
    (monitor): FormSwitchFlag<TKind, TBranches> =>
      this._toConcise<"flag.schema", boolean>(monitor, ({ _touched }) => _touched, isBoolean),
  )

  public readonly _touchedVerbose = Signal(
    (monitor): FormSwitchFlagVerbose<TKind, TBranches> =>
      this._toVerbose<"flag.schema.verbose">(monitor, ({ _touchedVerbose }) => _touchedVerbose),
  )

  public _setTouched(monitor: Monitor, setter: FormSwitchFlagSetter<TKind, TBranches>): void {
    const verbose = Lazy(() => this._touchedVerbose.read(monitor))
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
      this._active._setTouched(monitor, activeSetter)
    }

    for (const [kind, branch] of entries(this._branches)) {
      const resolvedBranchSetter = isBoolean(branchesSetter)
        ? branchesSetter
        : hasProperty(branchesSetter, kind)
          ? branchesSetter[kind]
          : undefined

      if (!isUndefined(resolvedBranchSetter)) {
        branch._setTouched(monitor, resolvedBranchSetter)
      }
    }

    if (!isUndefined(branchSetter)) {
      const activeBranch = this._getActiveBranch(monitor)

      const activeBranchSetter = isFunction(branchSetter)
        ? activeBranch
          ? branchSetter({
              kind: activeBranch.kind,
              value: activeBranch.value._touchedVerbose.read(monitor),
            })
          : undefined
        : branchSetter

      if (isBoolean(activeBranchSetter)) {
        activeBranch?.value._setTouched(monitor, activeBranchSetter)
      } else if (!isUndefined(activeBranchSetter)) {
        const { kind, value } = activeBranchSetter as FormSwitchBranch<keyof TBranches, unknown>
        const targetBranch = hasProperty(this._branches, kind) ? this._branches[kind] : undefined

        if (targetBranch) {
          targetBranch._setTouched(monitor, value)
        }
      }
    }
  }

  // O U T P U T

  public readonly _output = Signal((monitor): null | FormSwitchOutput<TKind, TBranches> => {
    const activeBranch = this._getActiveBranch(monitor)

    if (!activeBranch) {
      return null
    }

    const value = activeBranch.value._output.read(monitor)

    if (isNull(value)) {
      return null
    }

    return {
      kind: activeBranch.kind,
      value,
    }
  })

  public readonly _outputVerbose = Signal(
    (monitor): FormSwitchOutputVerbose<TKind, TBranches> =>
      this._toVerbose(monitor, ({ _output }) => _output),
  )

  // V A L I D

  public readonly _valid = Signal(
    (monitor): FormSwitchFlag<TKind, TBranches> =>
      this._toConcise<"flag.schema", boolean>(monitor, ({ _valid }) => _valid, isBoolean),
  )

  public readonly _validVerbose = Signal(
    (monitor): FormSwitchFlagVerbose<TKind, TBranches> =>
      this._toVerbose<"flag.schema.verbose">(monitor, ({ _validVerbose }) => _validVerbose),
  )

  // I N V A L I D

  public readonly _invalid = Signal(
    (monitor): FormSwitchFlag<TKind, TBranches> =>
      this._toConcise<"flag.schema", boolean>(monitor, ({ _invalid }) => _invalid, isBoolean),
  )

  public readonly _invalidVerbose = Signal(
    (monitor): FormSwitchFlagVerbose<TKind, TBranches> =>
      this._toVerbose<"flag.schema.verbose">(monitor, ({ _invalidVerbose }) => _invalidVerbose),
  )

  // V A L I D A T E D

  public readonly _validated = Signal(
    (monitor): FormSwitchFlag<TKind, TBranches> =>
      this._toConcise<"flag.schema", boolean>(monitor, ({ _validated }) => _validated, isBoolean),
  )

  public readonly _validatedVerbose = Signal(
    (monitor): FormSwitchFlagVerbose<TKind, TBranches> =>
      this._toVerbose<"flag.schema.verbose">(monitor, ({ _validatedVerbose }) => _validatedVerbose),
  )

  public _forceValidated(monitor: Monitor): void {
    this._active._forceValidated(monitor)
    this._getActiveBranch(monitor)?.value._forceValidated(monitor)
  }

  // D I R T Y

  public readonly _dirty = Signal(
    (monitor): FormSwitchFlag<TKind, TBranches> =>
      this._toConcise<"flag.schema", boolean>(monitor, ({ _dirty }) => _dirty, isBoolean),
  )

  public readonly _dirtyVerbose = Signal(
    (monitor): FormSwitchFlagVerbose<TKind, TBranches> =>
      this._toVerbose<"flag.schema.verbose">(monitor, ({ _dirtyVerbose }) => _dirtyVerbose),
  )

  public readonly _dirtyOn = Signal(
    (monitor): FormSwitchFlag<TKind, TBranches> =>
      this._toConcise<"flag.schema", boolean>(monitor, ({ _dirtyOn }) => _dirtyOn, isBoolean),
  )

  public readonly _dirtyOnVerbose = Signal(
    (monitor): FormSwitchFlagVerbose<TKind, TBranches> =>
      this._toVerbose<"flag.schema.verbose">(monitor, ({ _dirtyOnVerbose }) => _dirtyOnVerbose),
  )

  // R E S E T

  public _reset(
    monitor: Monitor,
    resetter: undefined | FormSwitchInputSetter<TKind, TBranches>,
  ): void {
    if (!isUndefined(resetter)) {
      this._setInitial(monitor, resetter)
    }

    this._active._reset(monitor, undefined)

    for (const branch of values(this._branches)) {
      branch._reset(monitor, undefined)
    }
  }

  // C H I L D R E N

  public _getChildren<TChildParams extends SignalFormParams>(
    monitor: Monitor,
  ): ReadonlyArray<SignalFormChild<TChildParams, FormSwitchParams<TKind, TBranches>>> {
    const activeChild: SignalFormChild<TChildParams, FormSwitchParams<TKind, TBranches>> = {
      _state: this._active as unknown as SignalFormState<TChildParams>,
      _mapToChild: (output) => output.kind,
    }

    const activeBranch = this._getActiveBranch(monitor)

    if (!activeBranch) {
      return [activeChild]
    }

    return [
      activeChild,
      {
        _state: activeBranch.value as unknown as SignalFormState<TChildParams>,
        _mapToChild: (output) => output.value,
      },
    ]
  }
}

export { FormSwitchState }
