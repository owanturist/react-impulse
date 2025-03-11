import type { Scope } from "react-impulse"

import {
  type ImpulseFormShapeOptions,
  type ImpulseFormShapeFields,
  ImpulseFormShape,
  ImpulseFormValue,
} from "../../src"

interface ThirdIsValidatedVerbose {
  readonly one: boolean
  readonly two: boolean
}

interface RootIsValidatedVerbose {
  readonly first: boolean
  readonly second: boolean
  readonly third: ThirdIsValidatedVerbose
}

type ThirdIsValidatedConcise = boolean | ThirdIsValidatedVerbose

type RootIsValidatedConcise =
  | boolean
  | {
      readonly first: boolean
      readonly second: boolean
      readonly third: ThirdIsValidatedConcise
    }

const setup = (
  options?: ImpulseFormShapeOptions<{
    first: ImpulseFormValue<string>
    second: ImpulseFormValue<number>
    third: ImpulseFormShape<{
      one: ImpulseFormValue<boolean>
      two: ImpulseFormValue<Array<string>>
    }>
    fourth: Array<string>
  }>,
) => {
  return ImpulseFormShape.of(
    {
      first: ImpulseFormValue.of(""),
      second: ImpulseFormValue.of(0),
      third: ImpulseFormShape.of({
        one: ImpulseFormValue.of(true),
        two: ImpulseFormValue.of([""]),
      }),
      fourth: ["anything"],
    },
    options,
  )
}

const isValidatedDefault = <TFields extends ImpulseFormShapeFields>(
  scope: Scope,
  shape: ImpulseFormShape<TFields>,
) => shape.isValidated(scope)

const isValidatedConcise = <TFields extends ImpulseFormShapeFields>(
  scope: Scope,
  shape: ImpulseFormShape<TFields>,
) => shape.isValidated(scope, (concise) => concise)

const isValidatedVerbose = <TFields extends ImpulseFormShapeFields>(
  scope: Scope,
  shape: ImpulseFormShape<TFields>,
) => shape.isValidated(scope, (_, verbose) => verbose)

it("matches the type signature", () => {
  const form = setup()

  expectTypeOf(form.isValidated).toEqualTypeOf<{
    (scope: Scope): boolean

    <TResult>(
      scope: Scope,
      select: (
        concise: RootIsValidatedConcise,
        verbose: RootIsValidatedVerbose,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.fields.third.isValidated).toEqualTypeOf<{
    (scope: Scope): boolean

    <TResult>(
      scope: Scope,
      select: (
        concise: ThirdIsValidatedConcise,
        verbose: ThirdIsValidatedVerbose,
      ) => TResult,
    ): TResult
  }>()
})

describe("isValidated(scope)", () => {
  const isValidated = isValidatedDefault

  it("returns boolean value", ({ scope }) => {
    const shape = setup()

    expectTypeOf(isValidated(scope, shape)).toBeBoolean()
    expectTypeOf(isValidated(scope, shape.fields.third)).toBeBoolean()
  })

  it("returns false when NONE are validated", ({ scope }) => {
    const shape = setup()

    expect(isValidated(scope, shape)).toBe(false)
    expect(isValidated(scope, shape.fields.third)).toBe(false)
  })

  it("returns false when SOME are validated", ({ scope }) => {
    const shape = setup({
      touched: {
        first: true,
        third: {
          one: true,
        },
      },
    })

    expect(isValidated(scope, shape)).toBe(false)
    expect(isValidated(scope, shape.fields.third)).toBe(false)
  })

  it("returns true when ALL are validated", ({ scope }) => {
    const shape = setup({
      touched: true,
    })

    expect(isValidated(scope, shape)).toBe(true)
    expect(shape.fields.third.isValidated(scope)).toBe(true)
  })

  it("returns false for empty shape", ({ scope }) => {
    expect(ImpulseFormShape.of({}).isValidated(scope)).toBe(false)
  })
})

describe("isValidated(scope, (concise) => concise)", () => {
  const isValidated = isValidatedConcise

  it("selects concise value", ({ scope }) => {
    const shape = setup()

    expectTypeOf(
      isValidated(scope, shape),
    ).toEqualTypeOf<RootIsValidatedConcise>()

    expectTypeOf(
      isValidated(scope, shape.fields.third),
    ).toEqualTypeOf<ThirdIsValidatedConcise>()
  })

  it("returns false when NONE are validated", ({ scope }) => {
    const shape = setup()

    expect(isValidated(scope, shape)).toBe(false)
    expect(isValidated(scope, shape.fields.third)).toBe(false)
  })

  it("returns concise object when SOME are validated", ({ scope }) => {
    const shape = setup({
      touched: {
        first: true,
        third: {
          one: true,
        },
      },
    })

    expect(isValidated(scope, shape)).toStrictEqual({
      first: true,
      second: false,
      third: {
        one: true,
        two: false,
      },
    })
    expect(isValidated(scope, shape.fields.third)).toStrictEqual({
      one: true,
      two: false,
    })
  })

  it("returns true when ALL are validated", ({ scope }) => {
    const shape = setup({
      touched: true,
    })

    expect(isValidated(scope, shape)).toBe(true)
    expect(isValidated(scope, shape.fields.third)).toBe(true)
  })

  it("returns false for empty shape", ({ scope }) => {
    expect(isValidated(scope, ImpulseFormShape.of({}))).toBe(false)
  })
})

describe("isValidated(scope, (_, verbose) => verbose)", () => {
  const isValidated = isValidatedVerbose

  it("selects verbose value", ({ scope }) => {
    const shape = setup()

    expectTypeOf(
      isValidated(scope, shape),
    ).toEqualTypeOf<RootIsValidatedVerbose>()

    expectTypeOf(
      isValidated(scope, shape.fields.third),
    ).toEqualTypeOf<ThirdIsValidatedVerbose>()
  })

  it("returns verbose object when NONE are validated", ({ scope }) => {
    const shape = setup()

    expect(isValidated(scope, shape)).toStrictEqual({
      first: false,
      second: false,
      third: {
        one: false,
        two: false,
      },
    })
    expect(isValidated(scope, shape.fields.third)).toStrictEqual({
      one: false,
      two: false,
    })
  })

  it("returns verbose object when SOME are validated", ({ scope }) => {
    const shape = setup({
      touched: {
        first: true,
        third: {
          one: true,
        },
      },
    })

    expect(isValidated(scope, shape)).toStrictEqual({
      first: true,
      second: false,
      third: {
        one: true,
        two: false,
      },
    })
    expect(isValidated(scope, shape.fields.third)).toStrictEqual({
      one: true,
      two: false,
    })
  })

  it("returns verbose object when ALL are validated", ({ scope }) => {
    const shape = setup({
      touched: true,
    })

    expect(isValidated(scope, shape)).toStrictEqual({
      first: true,
      second: true,
      third: {
        one: true,
        two: true,
      },
    })
    expect(isValidated(scope, shape.fields.third)).toStrictEqual({
      one: true,
      two: true,
    })
  })

  it("returns an empty object for empty shape", ({ scope }) => {
    expect(isValidated(scope, ImpulseFormShape.of({}))).toStrictEqual({})
  })
})

describe("isValidated(..)", () => {
  it("overrides fields' initial value", ({ scope }) => {
    const shape = ImpulseFormShape.of(
      {
        one: ImpulseFormValue.of(true, { validateOn: "onInit" }),
        two: ImpulseFormValue.of("", { validateOn: "onSubmit" }),
      },
      {
        validateOn: "onTouch",
      },
    )

    expect(shape.isValidated(scope)).toBe(false)
  })
})
