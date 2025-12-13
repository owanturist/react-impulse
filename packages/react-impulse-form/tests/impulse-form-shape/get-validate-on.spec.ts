import type { Monitor } from "@owanturist/signal"

import { params } from "~/tools/params"

import {
  FormShape,
  type FormShapeFields,
  type FormShapeOptions,
  FormUnit,
  type ValidateStrategy,
} from "../../src"

interface ThirdValidateStrategyVerbose {
  readonly one: ValidateStrategy
  readonly two: ValidateStrategy
}

interface RootValidateStrategyVerbose {
  readonly first: ValidateStrategy
  readonly second: ValidateStrategy
  readonly third: ThirdValidateStrategyVerbose
}

type ThirdValidateStrategyConcise = ValidateStrategy | ThirdValidateStrategyVerbose

type RootValidateStrategyConcise =
  | ValidateStrategy
  | {
      readonly first: ValidateStrategy
      readonly second: ValidateStrategy
      readonly third: ThirdValidateStrategyConcise
    }

function setup(
  options?: FormShapeOptions<{
    first: FormUnit<string>
    second: FormUnit<number>
    third: FormShape<{
      one: FormUnit<boolean>
      two: FormUnit<Array<string>>
    }>
    fourth: Array<string>
  }>,
) {
  return FormShape(
    {
      first: FormUnit("", { validate: (input) => [null, input] }),
      second: FormUnit(0, { validate: (input) => [null, input] }),
      third: FormShape({
        one: FormUnit(true, { validate: (input) => [null, input] }),
        two: FormUnit([""], { validate: (input) => [null, input] }),
      }),
      fourth: ["anything"],
    },
    options,
  )
}

function getValidateOnDefault<TFields extends FormShapeFields>(
  monitor: Monitor,
  shape: FormShape<TFields>,
) {
  return shape.getValidateOn(monitor)
}

function getValidateOnConcise<TFields extends FormShapeFields>(
  monitor: Monitor,
  shape: FormShape<TFields>,
) {
  return shape.getValidateOn(monitor, params._first)
}

function getValidateOnVerbose<TFields extends FormShapeFields>(
  monitor: Monitor,
  shape: FormShape<TFields>,
) {
  return shape.getValidateOn(monitor, params._second)
}

it("matches the type signature", () => {
  const form = setup()

  expectTypeOf(form.getValidateOn).toEqualTypeOf<{
    (monitor: Monitor): RootValidateStrategyConcise

    <TResult>(
      monitor: Monitor,
      select: (
        concise: RootValidateStrategyConcise,
        verbose: RootValidateStrategyVerbose,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.fields.third.getValidateOn).toEqualTypeOf<{
    (monitor: Monitor): ThirdValidateStrategyConcise

    <TResult>(
      monitor: Monitor,
      select: (
        concise: ThirdValidateStrategyConcise,
        verbose: ThirdValidateStrategyVerbose,
      ) => TResult,
    ): TResult
  }>()
})

describe.each([
  ["getValidateOn(monitor)", getValidateOnDefault],
  ["getValidateOn(monitor, (concise) => concise)", getValidateOnConcise],
])("%s", (_, getValidateOn) => {
  it("returns concise value", ({ monitor }) => {
    const shape = setup()

    expectTypeOf(getValidateOn(monitor, shape)).toEqualTypeOf<RootValidateStrategyConcise>()

    expectTypeOf(
      getValidateOn(monitor, shape.fields.third),
    ).toEqualTypeOf<ThirdValidateStrategyConcise>()
  })

  it("returns ValidateStrategy when ALL fields have the SAME validateOn", ({ monitor }) => {
    const shape = setup({
      validateOn: "onSubmit",
    })

    expect(getValidateOn(monitor, shape)).toBe("onSubmit")
    expect(getValidateOn(monitor, shape.fields.third)).toBe("onSubmit")
  })

  it("returns concise object when SOME fields have DIFFERENT validateOn", ({ monitor }) => {
    const shape = setup({
      validateOn: {
        first: (x) => (x === "onTouch" ? "onSubmit" : "onChange"),
        third: {
          one: "onInit",
        },
      },
    })

    expect(getValidateOn(monitor, shape)).toStrictEqual({
      first: "onSubmit",
      second: "onTouch",
      third: {
        one: "onInit",
        two: "onTouch",
      },
    })
    expect(getValidateOn(monitor, shape.fields.third)).toStrictEqual({
      one: "onInit",
      two: "onTouch",
    })
  })

  it("returns onTouch for empty shape", ({ monitor }) => {
    expect(getValidateOn(monitor, FormShape({}))).toBe("onTouch")
  })
})

describe("getValidateOn(monitor, (_, verbose) => verbose)", () => {
  const getValidateOn = getValidateOnVerbose

  it("returns verbose value", ({ monitor }) => {
    const shape = setup()

    expectTypeOf(getValidateOn(monitor, shape)).toEqualTypeOf<RootValidateStrategyVerbose>()

    expectTypeOf(
      getValidateOn(monitor, shape.fields.third),
    ).toEqualTypeOf<ThirdValidateStrategyVerbose>()
  })

  it("returns verbose object when ALL fields have the SAME validateOn", ({ monitor }) => {
    const shape = setup({
      validateOn: "onSubmit",
    })

    expect(getValidateOn(monitor, shape)).toStrictEqual({
      first: "onSubmit",
      second: "onSubmit",
      third: {
        one: "onSubmit",
        two: "onSubmit",
      },
    })
    expect(getValidateOn(monitor, shape.fields.third)).toStrictEqual({
      one: "onSubmit",
      two: "onSubmit",
    })
  })

  it("returns verbose object when SOME fields have DIFFERENT validateOn", ({ monitor }) => {
    const shape = setup({
      validateOn: {
        first: (x) => (x === "onTouch" ? "onSubmit" : "onChange"),
        third: {
          one: "onInit",
        },
      },
    })

    expect(getValidateOn(monitor, shape)).toStrictEqual({
      first: "onSubmit",
      second: "onTouch",
      third: {
        one: "onInit",
        two: "onTouch",
      },
    })
    expect(getValidateOn(monitor, shape.fields.third)).toStrictEqual({
      one: "onInit",
      two: "onTouch",
    })
  })

  it("returns an empty object for empty shape", ({ monitor }) => {
    expect(getValidateOn(monitor, FormShape({}))).toStrictEqual({})
  })
})
