import type { Setter } from "~/tools/setter"

import {
  ImpulseFormShape,
  type ImpulseFormShapeOptions,
  ImpulseFormUnit,
  type ValidateStrategy,
} from "../../src"

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
      first: ImpulseFormUnit("", { validate: (input) => [null, input] }),
      second: ImpulseFormUnit(0, { validate: (input) => [null, input] }),
      third: ImpulseFormShape({
        one: ImpulseFormUnit(true, { validate: (input) => [null, input] }),
        two: ImpulseFormUnit([""], { validate: (input) => [null, input] }),
      }),
      fourth: ["anything"],
    },
    options,
  )
}

it("matches the type signature", () => {
  const form = setup()

  interface ThirdValidateStrategy {
    readonly one: ValidateStrategy
    readonly two: ValidateStrategy
  }

  type ThirdValidateOnSetter = Setter<
    | ValidateStrategy
    | {
        readonly one?: Setter<ValidateStrategy>
        readonly two?: Setter<ValidateStrategy>
      },
    [ThirdValidateStrategy]
  >

  type RootValidateOnSetter = Setter<
    | ValidateStrategy
    | {
        readonly first?: Setter<ValidateStrategy>
        readonly second?: Setter<ValidateStrategy>
        readonly third?: ThirdValidateOnSetter
      },
    [
      {
        readonly first: ValidateStrategy
        readonly second: ValidateStrategy
        readonly third: ThirdValidateStrategy
      },
    ]
  >

  expectTypeOf(form.setValidateOn).toEqualTypeOf<(setter: RootValidateOnSetter) => void>()

  expectTypeOf(form.fields.third.setValidateOn).toEqualTypeOf<
    (setter: ThirdValidateOnSetter) => void
  >()
})

describe("setValidateOn(..)", () => {
  it("sets the ValidateStrategy to ALL fields", ({ monitor }) => {
    const shape = setup()

    shape.setValidateOn("onSubmit")
    expect(shape.getValidateOn(monitor)).toBe("onSubmit")

    shape.fields.third.setValidateOn("onChange")
    expect(shape.getValidateOn(monitor)).toStrictEqual({
      first: "onSubmit",
      second: "onSubmit",
      third: "onChange",
    })
  })

  it("sets the ValidateStrategy to SPECIFIC fields", ({ monitor }) => {
    const shape = setup()

    shape.setValidateOn({
      first: "onSubmit",
      third: {
        one: "onInit",
      },
    })
    expect(shape.getValidateOn(monitor)).toStrictEqual({
      first: "onSubmit",
      second: "onTouch",
      third: {
        one: "onInit",
        two: "onTouch",
      },
    })

    shape.fields.third.setValidateOn({
      one: undefined,
      two: "onChange",
    })
    expect(shape.getValidateOn(monitor)).toStrictEqual({
      first: "onSubmit",
      second: "onTouch",
      third: {
        one: "onInit",
        two: "onChange",
      },
    })
  })

  it("receives the current validateOn value", ({ monitor }) => {
    const shape = setup({
      validateOn: {
        first: "onInit",
        second: "onSubmit",
        third: {
          one: "onChange",
          two: "onTouch",
        },
      },
    })

    shape.setValidateOn((root) => {
      expect(root).toStrictEqual({
        first: "onInit",
        second: "onSubmit",
        third: {
          one: "onChange",
          two: "onTouch",
        },
      })

      return {
        first: (first) => {
          expect(first).toBe("onInit")

          return "onSubmit"
        },

        second: (second) => {
          expect(second).toBe("onSubmit")

          return "onTouch"
        },

        third: (third) => {
          expect(third).toStrictEqual({
            one: "onChange",
            two: "onTouch",
          })

          return {
            one: (one) => {
              expect(one).toBe("onChange")

              return "onInit"
            },

            two: (two) => {
              expect(two).toBe("onTouch")

              return "onChange"
            },
          }
        },
      }
    })

    expect(shape.getValidateOn(monitor)).toStrictEqual({
      first: "onSubmit",
      second: "onTouch",
      third: {
        one: "onInit",
        two: "onChange",
      },
    })
  })
})
