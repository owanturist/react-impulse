import type { Scope } from "react-impulse"

import {
  ImpulseFormShape,
  type ImpulseFormShapeFields,
  type ImpulseFormShapeOptions,
  ImpulseFormUnit,
  type ValidateStrategy,
} from "../../src"
import { arg } from "../common"

interface ThirdValidateStrategyVerbose {
  readonly one: ValidateStrategy
  readonly two: ValidateStrategy
}

interface RootValidateStrategyVerbose {
  readonly first: ValidateStrategy
  readonly second: ValidateStrategy
  readonly third: ThirdValidateStrategyVerbose
}

type ThirdValidateStrategyConcise =
  | ValidateStrategy
  | ThirdValidateStrategyVerbose

type RootValidateStrategyConcise =
  | ValidateStrategy
  | {
      readonly first: ValidateStrategy
      readonly second: ValidateStrategy
      readonly third: ThirdValidateStrategyConcise
    }

function setup(
  options?: ImpulseFormShapeOptions<{
    first: ImpulseFormUnit<string>
    second: ImpulseFormUnit<number>
    third: ImpulseFormShape<{
      one: ImpulseFormUnit<boolean>
      two: ImpulseFormUnit<Array<string>>
    }>
    fourth: Array<string>
  }>,
) {
  return ImpulseFormShape(
    {
      first: ImpulseFormUnit(""),
      second: ImpulseFormUnit(0),
      third: ImpulseFormShape({
        one: ImpulseFormUnit(true),
        two: ImpulseFormUnit([""]),
      }),
      fourth: ["anything"],
    },
    options,
  )
}

function getValidateOnDefault<TFields extends ImpulseFormShapeFields>(
  scope: Scope,
  shape: ImpulseFormShape<TFields>,
) {
  return shape.getValidateOn(scope)
}

function getValidateOnConcise<TFields extends ImpulseFormShapeFields>(
  scope: Scope,
  shape: ImpulseFormShape<TFields>,
) {
  return shape.getValidateOn(scope, arg(0))
}

function getValidateOnVerbose<TFields extends ImpulseFormShapeFields>(
  scope: Scope,
  shape: ImpulseFormShape<TFields>,
) {
  return shape.getValidateOn(scope, arg(1))
}

it("matches the type signature", () => {
  const form = setup()

  expectTypeOf(form.getValidateOn).toEqualTypeOf<{
    (scope: Scope): RootValidateStrategyConcise

    <TResult>(
      scope: Scope,
      select: (
        concise: RootValidateStrategyConcise,
        verbose: RootValidateStrategyVerbose,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.fields.third.getValidateOn).toEqualTypeOf<{
    (scope: Scope): ThirdValidateStrategyConcise

    <TResult>(
      scope: Scope,
      select: (
        concise: ThirdValidateStrategyConcise,
        verbose: ThirdValidateStrategyVerbose,
      ) => TResult,
    ): TResult
  }>()
})

describe.each([
  ["getValidateOn(scope)", getValidateOnDefault],
  ["getValidateOn(scope, (concise) => concise)", getValidateOnConcise],
])("%s", (_, getValidateOn) => {
  it("returns concise value", ({ scope }) => {
    const shape = setup()

    expectTypeOf(
      getValidateOn(scope, shape),
    ).toEqualTypeOf<RootValidateStrategyConcise>()

    expectTypeOf(
      getValidateOn(scope, shape.fields.third),
    ).toEqualTypeOf<ThirdValidateStrategyConcise>()
  })

  it("returns ValidateStrategy when ALL fields have the SAME validateOn", ({
    scope,
  }) => {
    const shape = setup({
      validateOn: "onSubmit",
    })

    expect(getValidateOn(scope, shape)).toBe("onSubmit")
    expect(getValidateOn(scope, shape.fields.third)).toBe("onSubmit")
  })

  it("returns concise object when SOME fields have DIFFERENT validateOn", ({
    scope,
  }) => {
    const shape = setup({
      validateOn: {
        first: (x) => (x === "onTouch" ? "onSubmit" : "onChange"),
        third: {
          one: "onInit",
        },
      },
    })

    expect(getValidateOn(scope, shape)).toStrictEqual({
      first: "onSubmit",
      second: "onTouch",
      third: {
        one: "onInit",
        two: "onTouch",
      },
    })
    expect(getValidateOn(scope, shape.fields.third)).toStrictEqual({
      one: "onInit",
      two: "onTouch",
    })
  })

  it("returns onTouch for empty shape", ({ scope }) => {
    expect(getValidateOn(scope, ImpulseFormShape({}))).toBe("onTouch")
  })
})

describe("getValidateOn(scope, (_, verbose) => verbose)", () => {
  const getValidateOn = getValidateOnVerbose

  it("returns verbose value", ({ scope }) => {
    const shape = setup()

    expectTypeOf(
      getValidateOn(scope, shape),
    ).toEqualTypeOf<RootValidateStrategyVerbose>()

    expectTypeOf(
      getValidateOn(scope, shape.fields.third),
    ).toEqualTypeOf<ThirdValidateStrategyVerbose>()
  })

  it("returns verbose object when ALL fields have the SAME validateOn", ({
    scope,
  }) => {
    const shape = setup({
      validateOn: "onSubmit",
    })

    expect(getValidateOn(scope, shape)).toStrictEqual({
      first: "onSubmit",
      second: "onSubmit",
      third: {
        one: "onSubmit",
        two: "onSubmit",
      },
    })
    expect(getValidateOn(scope, shape.fields.third)).toStrictEqual({
      one: "onSubmit",
      two: "onSubmit",
    })
  })

  it("returns verbose object when SOME fields have DIFFERENT validateOn", ({
    scope,
  }) => {
    const shape = setup({
      validateOn: {
        first: (x) => (x === "onTouch" ? "onSubmit" : "onChange"),
        third: {
          one: "onInit",
        },
      },
    })

    expect(getValidateOn(scope, shape)).toStrictEqual({
      first: "onSubmit",
      second: "onTouch",
      third: {
        one: "onInit",
        two: "onTouch",
      },
    })
    expect(getValidateOn(scope, shape.fields.third)).toStrictEqual({
      one: "onInit",
      two: "onTouch",
    })
  })

  it("returns an empty object for empty shape", ({ scope }) => {
    expect(getValidateOn(scope, ImpulseFormShape({}))).toStrictEqual({})
  })
})
