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

import { Impulse, type ReadonlyImpulse, type Scope } from "../dependencies"
import type { ImpulseForm, ImpulseFormParams } from "../impulse-form"
import type { GetImpulseFormParams } from "../impulse-form/get-impulse-form-params"
import { ImpulseFormState } from "../impulse-form/impulse-form-state"
import type { ValidateStrategy } from "../validate-strategy"

import { ImpulseFormSwitch } from "./_impulse-form-switch"
import type { ImpulseFormSwitchConciseParam } from "./_impulse-form-switch-concise-param"
import type { ImpulseFormSwitchFlag } from "./_impulse-form-switch-flag"
import type { ImpulseFormSwitchFlagSetter } from "./_impulse-form-switch-flag-setter"
import type { ImpulseFormSwitchFlagVerbose } from "./_impulse-form-switch-flag-verbose"
import type { ImpulseFormSwitchInput } from "./_impulse-form-switch-input"
import type { ImpulseFormSwitchInputSetter } from "./_impulse-form-switch-input-setter"
import type { ImpulseFormSwitchOutput } from "./_impulse-form-switch-output"
import type { ImpulseFormSwitchOutputVerbose } from "./_impulse-form-switch-output-verbose"
import type { ImpulseFormSwitchParams } from "./_impulse-form-switch-params"
import type { ImpulseFormSwitchValidateOn } from "./_impulse-form-switch-validate-on"
import type { ImpulseFormSwitchValidateOnSetter } from "./_impulse-form-switch-validate-on-setter"
import type { ImpulseFormSwitchValidateOnVerbose } from "./_impulse-form-switch-validate-on-verbose"
import type { ImpulseFormSwitchVerboseParam } from "./_impulse-form-switch-verbose-param"
import type { ImpulseFormSwitchBranch } from "./impulse-form-switch-branch"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

console.log("TODO verify it does not import anything from the SHAPE")

type ImpulseFormSwitchStateBranches<TBranches> = {
  [TBranch in keyof TBranches]: ImpulseFormState<
    GetImpulseFormParams<TBranches[TBranch]>
  >
}

type ActiveSwitchBranch<TBranches> = ImpulseFormSwitchBranch<
  keyof TBranches,
  ImpulseFormSwitchStateBranches<TBranches>[keyof TBranches]
>

export class ImpulseFormSwitchState<
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

  private _getActiveBranch(
    scope: Scope,
  ): undefined | ActiveSwitchBranch<TBranches> {
    const kind = this._active._output.getValue(scope)
    const value = isNull(kind) ? null : this._branches[kind]

    return value ? { kind, value } : undefined
  }

  private _toConcise<TKey extends keyof ImpulseFormParams, TConcise>(
    scope: Scope,
    extract: (form: ImpulseFormState) => ReadonlyImpulse<TConcise>,
  ): ImpulseFormSwitchConciseParam<TKind, TBranches, TKey, TConcise> {
    const activeBranch = this._getActiveBranch(scope)
    const activeConcise = extract(this._active).getValue(scope)

    if (!activeBranch) {
      return activeConcise
    }

    const branchConcise = extract(activeBranch.value).getValue(scope)

    if (branchConcise === activeConcise) {
      return activeConcise
    }

    return {
      active: activeConcise,
      branch: {
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
    const branches = mapValues(this._branches, (branch) => {
      return extract(branch).getValue(scope)
    })

    return { active, branches }
  }

  public _childOf(
    parent: null | ImpulseFormState,
  ): ImpulseFormSwitchState<TKind, TBranches> {
    return new ImpulseFormSwitchState(parent, this._active, this._branches)
  }

  // I N I T I A L

  public readonly _initial = Impulse(
    (scope): ImpulseFormSwitchInput<TKind, TBranches> => {
      return this._toVerbose<"input.schema">(scope, ({ _initial }) => _initial)
    },
  )

  public _setInitial(
    scope: Scope,
    setter: ImpulseFormSwitchInputSetter<TKind, TBranches>,
  ): void {
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
    (scope): ImpulseFormSwitchInput<TKind, TBranches> => {
      return this._toVerbose<"input.schema">(scope, ({ _input }) => _input)
    },
  )

  public _setInput(
    scope: Scope,
    setter: ImpulseFormSwitchInputSetter<TKind, TBranches>,
  ): void {
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

  public readonly _error = Impulse((scope): ImpulseFormShapeError<TFields> => {
    const error = mapValues(this._fields, ({ _error }) => {
      return _error.getValue(scope)
    })

    if (values(error).every(isNull)) {
      return null
    }

    return error as ImpulseFormShapeError<TFields>
  })

  public readonly _errorVerbose = Impulse(
    (scope): ImpulseFormShapeErrorVerbose<TFields> => {
      const errorVerbose = mapValues(this._fields, ({ _errorVerbose }) => {
        return _errorVerbose.getValue(scope)
      })

      return errorVerbose as ImpulseFormShapeErrorVerbose<TFields>
    },
  )

  public _setError(
    scope: Scope,
    setter: ImpulseFormShapeErrorSetter<TFields>,
  ): void {
    const setters = isFunction(setter)
      ? setter(this._errorVerbose.getValue(scope))
      : setter

    for (const [key, field] of entries(this._fields)) {
      if (isNull(setters)) {
        field._setError(scope, setters)
      } else if (hasProperty(setters, key) && !isUndefined(setters[key])) {
        field._setError(scope, setters[key])
      }
    }
  }

  // V A L I D A T E   O N

  public readonly _validateOn = Impulse(
    (scope): ImpulseFormSwitchValidateOn<TKind, TBranches> => {
      return this._toConcise<"validateOn.schema", ValidateStrategy>(
        scope,
        ({ _validateOn }) => _validateOn,
      )
    },
  )

  public readonly _validateOnVerbose = Impulse(
    (scope): ImpulseFormSwitchValidateOnVerbose<TKind, TBranches> => {
      return this._toVerbose<"validateOn.schema.verbose">(
        scope,
        ({ _validateOnVerbose }) => _validateOnVerbose,
      )
    },
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
        const targetBranch = this._branches[activeBranchSetter.kind]

        if (targetBranch) {
          targetBranch._setValidateOn(scope, activeBranchSetter.value)
        }
      }
    }
  }

  // T O U C H E D

  public readonly _touched = Impulse(
    (scope): ImpulseFormSwitchFlag<TKind, TBranches> => {
      return this._toConcise<"flag.schema", boolean>(
        scope,
        ({ _touched }) => _touched,
      )
    },
  )

  public readonly _touchedVerbose = Impulse(
    (scope): ImpulseFormSwitchFlagVerbose<TKind, TBranches> => {
      return this._toVerbose<"flag.schema.verbose">(
        scope,
        ({ _touchedVerbose }) => _touchedVerbose,
      )
    },
  )

  public _setTouched(
    scope: Scope,
    setter: ImpulseFormSwitchFlagSetter<TKind, TBranches>,
  ): void {
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
        const targetBranch = this._branches[activeBranchSetter.kind]

        if (targetBranch) {
          targetBranch._setTouched(scope, activeBranchSetter.value)
        }
      }
    }
  }

  // O U T P U T

  public readonly _output = Impulse(
    (scope): null | ImpulseFormSwitchOutput<TKind, TBranches> => {
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
    },
  )

  public readonly _outputVerbose = Impulse(
    (scope): ImpulseFormSwitchOutputVerbose<TKind, TBranches> => {
      return this._toVerbose(scope, ({ _output }) => _output)
    },
  )

  // V A L I D

  public readonly _valid = Impulse(
    (scope): ImpulseFormSwitchFlag<TKind, TBranches> => {
      return this._toConcise<"flag.schema", boolean>(
        scope,
        ({ _valid }) => _valid,
      )
    },
  )

  public readonly _validVerbose = Impulse(
    (scope): ImpulseFormSwitchFlagVerbose<TKind, TBranches> => {
      return this._toVerbose<"flag.schema.verbose">(
        scope,
        ({ _validVerbose }) => _validVerbose,
      )
    },
  )

  // I N V A L I D

  public readonly _invalid = Impulse((scope): ImpulseFormShapeFlag<TFields> => {
    const invalid = mapValues(this._fields, ({ _invalid }) => {
      return _invalid.getValue(scope)
    })

    const allInvalid = values(invalid)
    const onlyInvalid = allInvalid.find(isBoolean) ?? false

    for (const fieldInvalid of allInvalid) {
      if (fieldInvalid !== onlyInvalid) {
        return invalid as ImpulseFormShapeFlag<TFields>
      }
    }

    return onlyInvalid
  })

  public readonly _invalidVerbose = Impulse(
    (scope): ImpulseFormShapeFlagVerbose<TFields> => {
      const invalidVerbose = mapValues(this._fields, ({ _invalidVerbose }) => {
        return _invalidVerbose.getValue(scope)
      })

      return invalidVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },
  )

  // V A L I D A T E D

  public readonly _validated = Impulse(
    (scope): ImpulseFormShapeFlag<TFields> => {
      const validated = mapValues(this._fields, ({ _validated }) => {
        return _validated.getValue(scope)
      })

      const allValidated = values(validated)
      const onlyValidated = allValidated.find(isBoolean) ?? false

      for (const fieldValidated of allValidated) {
        if (fieldValidated !== onlyValidated) {
          return validated as ImpulseFormShapeFlag<TFields>
        }
      }

      return onlyValidated
    },
  )

  public readonly _validatedVerbose = Impulse(
    (scope): ImpulseFormShapeFlagVerbose<TFields> => {
      const validatedVerbose = mapValues(
        this._fields,
        ({ _validatedVerbose }) => _validatedVerbose.getValue(scope),
      )

      return validatedVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },
  )

  public _forceValidated(scope: Scope): void {
    for (const field of values(this._fields)) {
      field._forceValidated(scope)
    }
  }

  // D I R T Y

  public readonly _dirty = Impulse(
    (scope): ImpulseFormSwitchFlag<TKind, TBranches> => {
      return this._toConcise<"flag.schema", boolean>(
        scope,
        ({ _dirty }) => _dirty,
      )
    },
  )

  public readonly _dirtyVerbose = Impulse(
    (scope): ImpulseFormSwitchFlagVerbose<TKind, TBranches> => {
      return this._toVerbose<"flag.schema.verbose">(
        scope,
        ({ _dirtyVerbose }) => _dirtyVerbose,
      )
    },
  )

  public readonly _dirtyOn = Impulse((scope): ImpulseFormShapeFlag<TFields> => {
    const dirtyOn = mapValues(this._fields, ({ _dirtyOn }) => {
      return _dirtyOn.getValue(scope)
    })

    const allDirty = values(dirtyOn)
    const onlyDirty = allDirty.find(isBoolean) ?? false

    for (const fieldDirty of allDirty) {
      if (fieldDirty !== onlyDirty) {
        return dirtyOn as ImpulseFormShapeFlag<TFields>
      }
    }

    return onlyDirty
  })

  public readonly _dirtyOnVerbose = Impulse(
    (scope): ImpulseFormShapeFlagVerbose<TFields> => {
      const dirtyOnVerbose = mapValues(this._fields, ({ _dirtyOnVerbose }) => {
        return _dirtyOnVerbose.getValue(scope)
      })

      return dirtyOnVerbose as ImpulseFormShapeFlagVerbose<TFields>
    },
  )

  // R E S E T

  public _reset(
    scope: Scope,
    resetter: undefined | ImpulseFormShapeInputSetter<TFields>,
  ): void {
    const resetters = isFunction(resetter)
      ? resetter(this._initial.getValue(scope), this._input.getValue(scope))
      : resetter

    for (const [key, field] of entries(this._fields)) {
      field._reset(
        scope,
        hasProperty(resetters, key) ? resetters[key] : undefined,
      )
    }
  }

  // C H I L D R E N

  public _getChildren<TChildParams extends ImpulseFormParams>(): ReadonlyArray<
    ImpulseFormChild<TChildParams, ImpulseFormShapeParams<TFields>>
  > {
    return map(entries(this._fields), ([key, field]) => ({
      _state: field as unknown as ImpulseFormState<TChildParams>,
      _mapToChild: (output) => {
        return output[key as keyof ImpulseFormShapeOutput<TFields>]
      },
    }))
  }
}
