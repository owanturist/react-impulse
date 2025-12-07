import type { Monitor } from "@owanturist/signal"
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
  monitor: Monitor,
  shape: ImpulseFormShape<TFields>,
) {
  return shape.isValidated(monitor)
}

function isValidatedConcise<TFields extends ImpulseFormShapeFields>(
  monitor: Monitor,
  shape: ImpulseFormShape<TFields>,
) {
  return shape.isValidated(monitor, params._first)
}

function isValidatedVerbose<TFields extends ImpulseFormShapeFields>(
  monitor: Monitor,
  shape: ImpulseFormShape<TFields>,
) {
  return shape.isValidated(monitor, params._second)
}

it("matches the type signature", () => {
  const form = setup()

  expectTypeOf(form.isValidated).toEqualTypeOf<{
    (monitor: Monitor): boolean

    <TResult>(
      monitor: Monitor,
      select: (concise: RootIsValidatedConcise, verbose: RootIsValidatedVerbose) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.fields.third.isValidated).toEqualTypeOf<{
    (monitor: Monitor): boolean

    <TResult>(
      monitor: Monitor,
      select: (concise: ThirdIsValidatedConcise, verbose: ThirdIsValidatedVerbose) => TResult,
    ): TResult
  }>()
})

describe("isValidated(monitor)", () => {
  const isValidated = isValidatedDefault

  it("returns boolean value", ({ monitor }) => {
    const shape = setup()

    expectTypeOf(isValidated(monitor, shape)).toBeBoolean()
    expectTypeOf(isValidated(monitor, shape.fields.third)).toBeBoolean()
  })

  it("returns false when NONE are validated", ({ monitor }) => {
    const shape = setup()

    expect(isValidated(monitor, shape)).toBe(false)
    expect(isValidated(monitor, shape.fields.third)).toBe(false)
  })

  it("returns false when SOME are validated", ({ monitor }) => {
    const shape = setup({
      touched: {
        first: true,
        third: {
          one: true,
        },
      },
    })

    expect(isValidated(monitor, shape)).toBe(false)
    expect(isValidated(monitor, shape.fields.third)).toBe(false)
  })

  it("returns true when ALL are validated", ({ monitor }) => {
    const shape = setup({
      touched: true,
    })

    expect(isValidated(monitor, shape)).toBe(true)
    expect(shape.fields.third.isValidated(monitor)).toBe(true)
  })

  it("returns false for empty shape", ({ monitor }) => {
    expect(ImpulseFormShape({}).isValidated(monitor)).toBe(false)
  })
})

describe("isValidated(monitor, (concise) => concise)", () => {
  const isValidated = isValidatedConcise

  it("selects concise value", ({ monitor }) => {
    const shape = setup()

    expectTypeOf(isValidated(monitor, shape)).toEqualTypeOf<RootIsValidatedConcise>()

    expectTypeOf(isValidated(monitor, shape.fields.third)).toEqualTypeOf<ThirdIsValidatedConcise>()
  })

  it("returns false when NONE are validated", ({ monitor }) => {
    const shape = setup()

    expect(isValidated(monitor, shape)).toBe(false)
    expect(isValidated(monitor, shape.fields.third)).toBe(false)
  })

  it("returns concise object when SOME are validated", ({ monitor }) => {
    const shape = setup({
      touched: {
        first: true,
        third: {
          one: true,
        },
      },
    })

    expect(isValidated(monitor, shape)).toStrictEqual({
      first: true,
      second: false,
      third: {
        one: true,
        two: false,
      },
    })
    expect(isValidated(monitor, shape.fields.third)).toStrictEqual({
      one: true,
      two: false,
    })
  })

  it("returns true when ALL are validated", ({ monitor }) => {
    const shape = setup({
      touched: true,
    })

    expect(isValidated(monitor, shape)).toBe(true)
    expect(isValidated(monitor, shape.fields.third)).toBe(true)
  })

  it("returns false for empty shape", ({ monitor }) => {
    expect(isValidated(monitor, ImpulseFormShape({}))).toBe(false)
  })
})

describe("isValidated(monitor, (_, verbose) => verbose)", () => {
  const isValidated = isValidatedVerbose

  it("selects verbose value", ({ monitor }) => {
    const shape = setup()

    expectTypeOf(isValidated(monitor, shape)).toEqualTypeOf<RootIsValidatedVerbose>()

    expectTypeOf(isValidated(monitor, shape.fields.third)).toEqualTypeOf<ThirdIsValidatedVerbose>()
  })

  it("returns verbose object when NONE are validated", ({ monitor }) => {
    const shape = setup()

    expect(isValidated(monitor, shape)).toStrictEqual({
      first: false,
      second: false,
      third: {
        one: false,
        two: false,
      },
    })
    expect(isValidated(monitor, shape.fields.third)).toStrictEqual({
      one: false,
      two: false,
    })
  })

  it("returns verbose object when SOME are validated", ({ monitor }) => {
    const shape = setup({
      touched: {
        first: true,
        third: {
          one: true,
        },
      },
    })

    expect(isValidated(monitor, shape)).toStrictEqual({
      first: true,
      second: false,
      third: {
        one: true,
        two: false,
      },
    })
    expect(isValidated(monitor, shape.fields.third)).toStrictEqual({
      one: true,
      two: false,
    })
  })

  it("returns verbose object when ALL are validated", ({ monitor }) => {
    const shape = setup({
      touched: true,
    })

    expect(isValidated(monitor, shape)).toStrictEqual({
      first: true,
      second: true,
      third: {
        one: true,
        two: true,
      },
    })
    expect(isValidated(monitor, shape.fields.third)).toStrictEqual({
      one: true,
      two: true,
    })
  })

  it("returns an empty object for empty shape", ({ monitor }) => {
    expect(isValidated(monitor, ImpulseFormShape({}))).toStrictEqual({})
  })
})

describe("isValidated(..)", () => {
  it("overrides fields' initial value", ({ monitor }) => {
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

    expect(shape.isValidated(monitor)).toBe(false)
  })
})
