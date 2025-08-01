import { forEntries } from "~/tools/for-entries"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isTrue } from "~/tools/is-true"
import { isTruthy } from "~/tools/is-truthy"
import { isUndefined } from "~/tools/is-undefined"
import { keys } from "~/tools/keys"
import { mapValues } from "~/tools/map-values"
import { params } from "~/tools/params"

import { type Scope, batch } from "../dependencies"
import { ImpulseForm, isImpulseForm } from "../impulse-form"
import { ImpulseFormShape } from "../impulse-form-shape"

import type { ImpulseFormSwitchError } from "./_impulse-form-switch-error"
import type { ImpulseFormSwitchErrorSetter } from "./_impulse-form-switch-error-setter"
import type { ImpulseFormSwitchErrorVerbose } from "./_impulse-form-switch-error-verbose"
import type { ImpulseFormSwitchFlag } from "./_impulse-form-switch-flag"
import type { ImpulseFormSwitchFlagSetter } from "./_impulse-form-switch-flag-setter"
import type { ImpulseFormSwitchFlagVerbose } from "./_impulse-form-switch-flag-verbose"
import type { ImpulseFormSwitchInput } from "./_impulse-form-switch-input"
import type { ImpulseFormSwitchInputSetter } from "./_impulse-form-switch-input-setter"
import type { ImpulseFormSwitchKindParams } from "./_impulse-form-switch-kind-params"
import type { ImpulseFormSwitchOutput } from "./_impulse-form-switch-output"
import type { ImpulseFormSwitchOutputVerbose } from "./_impulse-form-switch-output-verbose"
import type { ImpulseFormSwitchParams } from "./_impulse-form-switch-params"
import type { ImpulseFormSwitchValidateOn } from "./_impulse-form-switch-validate-on"
import type { ImpulseFormSwitchValidateOnSetter } from "./_impulse-form-switch-validate-on-setter"
import type { ImpulseFormSwitchValidateOnVerbose } from "./_impulse-form-switch-validate-on-verbose"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export class ImpulseFormSwitch<
  TKind extends ImpulseForm<ImpulseFormSwitchKindParams<keyof TBranches>>,
  TBranches extends ImpulseFormSwitchBranches = ImpulseFormSwitchBranches,
> extends ImpulseForm<ImpulseFormSwitchParams<TKind, TBranches>> {
  public readonly active: TKind

  private readonly _branches: ImpulseFormShape<TBranches>

  public get branches(): Readonly<TBranches> {
    return this._branches.fields
  }

  public constructor(
    root: null | ImpulseForm,
    active: TKind,
    branches: TBranches,
  ) {
    super(root)

    this.active = ImpulseForm._childOf(this, active)

    // TODO continue from here do not use ImpulseFormShape here, because it will not work with branches
    this._branches = ImpulseForm._childOf(
      this,
      ImpulseFormShape<TBranches>(branches),
    )
  }

  protected override _submitWith(
    output: ImpulseFormSwitchOutput<TBranches>,
  ): ReadonlyArray<void | Promise<unknown>> {}

  protected override _getFocusFirstInvalid(scope: Scope): VoidFunction | null {}

  protected _childOf(
    parent: null | ImpulseForm,
  ): ImpulseFormSwitch<TBranches> {}

  protected _setInitial(
    initial: undefined | ImpulseFormSwitch<TBranches>,
    isRoot: boolean,
  ): void {}

  protected _setValidated(isValidated: boolean): void {}

  protected _isDirty<TResult>(
    scope: Scope,
    select?: (
      concise: ImpulseFormSwitchFlag<TBranches>,
      verbose: ImpulseFormSwitchFlagVerbose<TBranches>,
      dirty: ImpulseFormSwitchFlagVerbose<TBranches>,
    ) => TResult,
  ): TResult {
    const kinds = select ? keys(this._branches) : [this.active.getValue(scope)]

    let isAllDirty = true
    let isNoneDirty = true
    // make it easier for TS
    const isDirtyConcise = {} as Record<keyof TBranches, unknown>
    const isDirtyVerbose = {} as Record<keyof TBranches, unknown>
    const isDirtyDirty = {} as Record<keyof TBranches, unknown>

    for (const key of kinds) {
      const field = this._branches[key]

      const [concise, verbose, dirty] = ImpulseForm._isDirty(
        scope,
        field,
        params,
      )

      isAllDirty = isAllDirty && concise === true
      isNoneDirty = isNoneDirty && concise === false
      isDirtyConcise[key] = concise
      isDirtyVerbose[key] = verbose
      isDirtyDirty[key] = dirty
    }

    if (select == null) {
      return !isNoneDirty as TResult
    }

    return select(
      isNoneDirty
        ? false
        : isAllDirty
          ? true
          : (isDirtyConcise as unknown as ImpulseFormSwitchFlag<TBranches>),
      isDirtyVerbose as unknown as ImpulseFormSwitchFlagVerbose<TBranches>,
      isDirtyDirty as unknown as ImpulseFormSwitchFlagVerbose<TBranches>,
    )
  }

  public getError(scope: Scope): ImpulseFormSwitchError<TBranches>
  public getError<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchError<TBranches>,
      verbose: ImpulseFormSwitchErrorVerbose<TBranches>,
    ) => TResult,
  ): TResult
  public getError<TResult = ImpulseFormSwitchError<TBranches>>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchError<TBranches>,
      verbose: ImpulseFormSwitchErrorVerbose<TBranches>,
    ) => TResult = params._first as typeof select,
  ): TResult {}

  public setError(setter: ImpulseFormSwitchErrorSetter<TBranches>): void {}

  public isValidated(scope: Scope): boolean

  public isValidated<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TBranches>,
      verbose: ImpulseFormSwitchFlagVerbose<TBranches>,
    ) => TResult,
  ): TResult
  public isValidated<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TBranches>,
      verbose: ImpulseFormSwitchFlagVerbose<TBranches>,
    ) => TResult = isTrue as unknown as typeof select,
  ): TResult {}

  public getValidateOn(scope: Scope): ImpulseFormSwitchValidateOn<TBranches>
  public getValidateOn<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchValidateOn<TBranches>,
      verbose: ImpulseFormSwitchValidateOnVerbose<TBranches>,
    ) => TResult,
  ): TResult
  public getValidateOn<TResult = ImpulseFormSwitchValidateOn<TBranches>>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchValidateOn<TBranches>,
      verbose: ImpulseFormSwitchValidateOnVerbose<TBranches>,
    ) => TResult = params._first as typeof select,
  ): TResult {}

  public setValidateOn(
    validateOn: ImpulseFormSwitchValidateOnSetter<TBranches>,
  ): void {}

  public isTouched(scope: Scope): boolean
  public isTouched<TResult>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TBranches>,
      verbose: ImpulseFormSwitchFlagVerbose<TBranches>,
    ) => TResult,
  ): TResult
  public isTouched<TResult = boolean>(
    scope: Scope,
    select: (
      concise: ImpulseFormSwitchFlag<TBranches>,
      verbose: ImpulseFormSwitchFlagVerbose<TBranches>,
    ) => TResult = isTruthy as unknown as typeof select,
  ): TResult {}

  public setTouched(touched: ImpulseFormSwitchFlagSetter<TBranches>): void {}

  public reset(
    resetter: ImpulseFormSwitchInputSetter<TBranches> = params._first as typeof resetter,
  ): void {}

  public getOutput(
    scope: Scope,
  ): null | ImpulseFormSwitchOutput<TKind, TBranches>
  public getOutput<TResult>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormSwitchOutput<TKind, TBranches>,
      verbose: ImpulseFormSwitchOutputVerbose<TKind, TBranches>,
    ) => TResult,
  ): TResult
  public getOutput<TResult = null | ImpulseFormSwitchOutput<TKind, TBranches>>(
    scope: Scope,
    select: (
      concise: null | ImpulseFormSwitchOutput<TKind, TBranches>,
      verbose: ImpulseFormSwitchOutputVerbose<TKind, TBranches>,
    ) => TResult = params._first as typeof select,
  ): TResult {
    const active = this.active.getOutput(scope)

    let allValid = true
    // make it easier for TS
    const branchesConcise = {} as Record<string, unknown>
    const branchesVerbose = {} as Record<string, unknown>

    forEntries(this.branches, (branch, kind) => {
      if (isImpulseForm(branch)) {
        const output = branch.getOutput(scope, (concise, verbose) => ({
          concise,
          verbose,
        }))

        allValid = allValid && !isNull(output.concise)
        branchesConcise[kind] = output.concise
        branchesVerbose[kind] = output.verbose
      } else {
        branchesConcise[kind] = branch
        branchesVerbose[kind] = branch
      }
    })

    const conciseBranchValue =
      isNull(active) || isNull(branchesConcise) ? null : branchesConcise[active]

    const concise = isNull(conciseBranchValue)
      ? null
      : { kind: active, value: conciseBranchValue }

    const verbose = { active, branches: branchesVerbose }

    return select(concise, verbose)
  }

  public getInput(scope: Scope): ImpulseFormSwitchInput<TKind, TBranches> {
    return {
      active: this.active.getInput(scope),
      branches: this._branches.getInput(scope),
    }
  }

  public setInput(
    setter: ImpulseFormSwitchInputSetter<TKind, TBranches>,
  ): void {
    batch((scope) => {
      const { active, branches } = isFunction(setter)
        ? setter(this.getInput(scope), this.getInitial(scope))
        : setter

      if (!isUndefined(active)) {
        this.active.setInput(active)
      }

      if (!isUndefined(branches)) {
        this._branches.setInput(branches)
      }
    })
  }

  public getInitial(scope: Scope): ImpulseFormSwitchInput<TKind, TBranches> {
    return {
      active: this.active.getInitial(scope),
      branches: this._branches.getInitial(scope),
    }
  }

  public setInitial(
    setter: ImpulseFormSwitchInputSetter<TKind, TBranches>,
  ): void {
    batch((scope) => {
      const { active, branches } = isFunction(setter)
        ? setter(this.getInitial(scope), this.getInput(scope))
        : setter

      if (!isUndefined(active)) {
        this.active.setInitial(active)
      }

      if (!isUndefined(branches)) {
        this._branches.setInitial(branches)
      }
    })
  }
}
