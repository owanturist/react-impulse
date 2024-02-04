import {
  type ImpulseFormShapeOptions,
  type ValidateStrategy,
  type Setter,
  ImpulseFormShape,
  ImpulseFormValue,
} from "../../src"

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

describe("ImpulseFormShape#setValidateOn(..)", () => {
  it("matches the type signature", () => {
    const shape = setup()

    type ThirdValidateStrategy = {
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

    expectTypeOf(shape.setValidateOn).toEqualTypeOf<
      (setter: RootValidateOnSetter) => void
    >()
    expectTypeOf(shape.fields.third.setValidateOn).toEqualTypeOf<
      (setter: ThirdValidateOnSetter) => void
    >()
  })

  it("sets the ValidateStrategy to ALL fields", ({ scope }) => {
    const shape = setup()

    shape.setValidateOn("onSubmit")
    expect(shape.getValidateOn(scope)).toBe("onSubmit")

    shape.fields.third.setValidateOn("onChange")
    expect(shape.getValidateOn(scope)).toStrictEqual({
      first: "onSubmit",
      second: "onSubmit",
      third: "onChange",
    })
  })

  it("sets the ValidateStrategy to SPECIFIC fields", ({ scope }) => {
    const shape = setup()

    shape.setValidateOn({
      first: "onSubmit",
      third: {
        one: "onInit",
      },
    })
    expect(shape.getValidateOn(scope)).toStrictEqual({
      first: "onSubmit",
      second: "onTouch",
      third: {
        one: "onInit",
        two: "onTouch",
      },
    })

    shape.fields.third.setValidateOn({
      two: "onChange",
    })
    expect(shape.getValidateOn(scope)).toStrictEqual({
      first: "onSubmit",
      second: "onTouch",
      third: {
        one: "onInit",
        two: "onChange",
      },
    })
  })

  it("receives the current validateOn value", ({ scope }) => {
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

    expect(shape.getValidateOn(scope)).toStrictEqual({
      first: "onSubmit",
      second: "onTouch",
      third: {
        one: "onInit",
        two: "onChange",
      },
    })
  })
})
