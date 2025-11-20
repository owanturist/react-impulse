import type { Scope } from "react-impulse"
import { z } from "zod"

import { params } from "~/tools/params"

import {
  ImpulseFormShape,
  type ImpulseFormShapeFields,
  type ImpulseFormShapeOptions,
  ImpulseFormUnit,
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

function setup(
  options?: ImpulseFormShapeOptions<{
    first: ImpulseFormUnit<string>
    second: ImpulseFormUnit<number>
    third: ImpulseFormShape<{
      one: ImpulseFormUnit<boolean, ReadonlyArray<string>>
      two: ImpulseFormUnit<Array<string>, ReadonlyArray<string>>
    }>
    fourth: Array<string>
  }>,
) {
  return ImpulseFormShape(
    {
      first: ImpulseFormUnit("", {
        validate: (input) => [null, input],
      }),
      second: ImpulseFormUnit(0, {
        validate: (input) => [null, input],
      }),
      third: ImpulseFormShape({
        one: ImpulseFormUnit(true, {
          schema: z.boolean(),
        }),
        two: ImpulseFormUnit([""], {
          schema: z.array(z.string()),
        }),
      }),
      fourth: ["anything"],
    },
    options,
  )
}

function isValidatedDefault<TFields extends ImpulseFormShapeFields>(
  scope: Scope,
  shape: ImpulseFormShape<TFields>,
) {
  return shape.isValidated(scope)
}

function isValidatedConcise<TFields extends ImpulseFormShapeFields>(
  scope: Scope,
  shape: ImpulseFormShape<TFields>,
) {
  return shape.isValidated(scope, params._first)
}

function isValidatedVerbose<TFields extends ImpulseFormShapeFields>(
  scope: Scope,
  shape: ImpulseFormShape<TFields>,
) {
  return shape.isValidated(scope, params._second)
}

it("matches the type signature", () => {
  const form = setup()

  expectTypeOf(form.isValidated).toEqualTypeOf<{
    (scope: Scope): boolean

    <TResult>(
      scope: Scope,
      select: (concise: RootIsValidatedConcise, verbose: RootIsValidatedVerbose) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.fields.third.isValidated).toEqualTypeOf<{
    (scope: Scope): boolean

    <TResult>(
      scope: Scope,
      select: (concise: ThirdIsValidatedConcise, verbose: ThirdIsValidatedVerbose) => TResult,
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
    expect(ImpulseFormShape({}).isValidated(scope)).toBe(false)
  })
})

describe("isValidated(scope, (concise) => concise)", () => {
  const isValidated = isValidatedConcise

  it("selects concise value", ({ scope }) => {
    const shape = setup()

    expectTypeOf(isValidated(scope, shape)).toEqualTypeOf<RootIsValidatedConcise>()

    expectTypeOf(isValidated(scope, shape.fields.third)).toEqualTypeOf<ThirdIsValidatedConcise>()
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
    expect(isValidated(scope, ImpulseFormShape({}))).toBe(false)
  })
})

describe("isValidated(scope, (_, verbose) => verbose)", () => {
  const isValidated = isValidatedVerbose

  it("selects verbose value", ({ scope }) => {
    const shape = setup()

    expectTypeOf(isValidated(scope, shape)).toEqualTypeOf<RootIsValidatedVerbose>()

    expectTypeOf(isValidated(scope, shape.fields.third)).toEqualTypeOf<ThirdIsValidatedVerbose>()
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
    expect(isValidated(scope, ImpulseFormShape({}))).toStrictEqual({})
  })
})

describe("isValidated(..)", () => {
  it("overrides fields' initial value", ({ scope }) => {
    const shape = ImpulseFormShape(
      {
        one: ImpulseFormUnit(true, {
          schema: z.boolean(),
          validateOn: "onInit",
        }),
        two: ImpulseFormUnit("", {
          schema: z.string(),
          validateOn: "onSubmit",
        }),
      },
      {
        validateOn: "onTouch",
      },
    )

    expect(shape.isValidated(scope)).toBe(false)
  })
})
