import { z } from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import { FormShape, FormUnit, type ValidateStrategy } from "../../src"

it("composes FormShape from FormUnit", ({ monitor }) => {
  const shape = FormShape({
    first: FormUnit(""),
    second: FormUnit(0),
    third: FormUnit([false]),
  })

  expectTypeOf(shape).toEqualTypeOf<
    FormShape<{
      first: FormUnit<string>
      second: FormUnit<number>
      third: FormUnit<Array<boolean>>
    }>
  >()

  const input = shape.getInput(monitor)

  expectTypeOf(input).toEqualTypeOf<{
    readonly first: string
    readonly second: number
    readonly third: Array<boolean>
  }>()
  expect(input).toStrictEqual({
    first: "",
    second: 0,
    third: [false],
  })

  const value = shape.getOutput(monitor)

  expectTypeOf(value).toEqualTypeOf<null | {
    readonly first: string
    readonly second: number
    readonly third: Array<boolean>
  }>()
  expect(value).toStrictEqual({
    first: "",
    second: 0,
    third: [false],
  })
})

it("composes FormShape from FormUnit with schema", ({ monitor }) => {
  const shape = FormShape({
    first: FormUnit("", {
      schema: z.string().min(1).pipe(z.coerce.boolean()),
    }),
    second: FormUnit(0, {
      schema: z
        .number()
        .min(100)
        .transform((x) => x.toFixed(2)),
    }),
  })

  expectTypeOf(shape).toEqualTypeOf<
    FormShape<{
      first: FormUnit<string, ReadonlyArray<string>, boolean>
      second: FormUnit<number, ReadonlyArray<string>, string>
    }>
  >()

  const value = shape.getOutput(monitor)

  expectTypeOf(value).toEqualTypeOf<null | {
    readonly first: boolean
    readonly second: string
  }>()
  expect(value).toBeNull()
})

it("gives direct access to the fields", ({ monitor }) => {
  const shape = FormShape({
    first: FormUnit(""),
    second: FormUnit(0),
  })

  expect(shape.fields.first.getInput(monitor)).toBe("")
  expect(shape.fields.second.getInput(monitor)).toBe(0)
})

it("allows to specify none-form fields", ({ monitor }) => {
  const shape = FormShape({
    first: FormUnit(""),
    id: 123,
    name: "john",
  })

  expectTypeOf(shape).toEqualTypeOf<
    FormShape<{
      first: FormUnit<string>
      id: number
      name: string
    }>
  >()

  const input = shape.getInput(monitor)
  expectTypeOf(input).toEqualTypeOf<{
    readonly first: string
    readonly id: number
    readonly name: string
  }>()
  expect(input).toStrictEqual({
    first: "",
    id: 123,
    name: "john",
  })

  const value = shape.getOutput(monitor)
  expectTypeOf(value).toEqualTypeOf<null | {
    readonly first: string
    readonly id: number
    readonly name: string
  }>()
  expect(value).toStrictEqual({
    first: "",
    id: 123,
    name: "john",
  })

  expect(shape.fields.id(monitor)).toBe(123)
  expect(shape.fields.name(monitor)).toBe("john")
})

describe("FormShapeOptions.touched", () => {
  it("specifies initial touched", ({ monitor }) => {
    const shape = FormShape(
      {
        first: FormUnit(""),
        second: FormUnit(0),
        third: FormShape({
          one: FormUnit(true),
          two: FormUnit([""]),
        }),
        fourth: ["anything"],
      },
      {
        touched: {
          first: true,
          third: true,
        },
      },
    )

    expect(shape.isTouched(monitor, params._second)).toStrictEqual({
      first: true,
      second: false,
      third: {
        one: true,
        two: true,
      },
    })
  })

  it("gets current touched from setters", ({ monitor }) => {
    const shape = FormShape(
      {
        first: FormUnit("", { touched: true }),
        second: FormUnit(0),
        third: FormShape(
          {
            one: FormUnit(true),
            two: FormUnit([""]),
          },
          {
            touched: true,
          },
        ),
        fourth: ["anything"],
      },
      {
        touched: (root) => {
          expectTypeOf(root).toEqualTypeOf<{
            readonly first: boolean
            readonly second: boolean
            readonly third: {
              readonly one: boolean
              readonly two: boolean
            }
          }>()

          expect(root).toStrictEqual({
            first: true,
            second: false,
            third: {
              one: true,
              two: true,
            },
          })

          return {
            first: (first) => {
              expectTypeOf(first).toEqualTypeOf<boolean>()
              expect(first).toBe(true)

              return !first
            },
            second: (second) => {
              expectTypeOf(second).toEqualTypeOf<boolean>()
              expect(second).toBe(false)

              return !second
            },
            third: (third) => {
              expectTypeOf(third).toEqualTypeOf<{
                readonly one: boolean
                readonly two: boolean
              }>()
              expect(third).toStrictEqual({
                one: true,
                two: true,
              })

              return {
                one: (one) => {
                  expectTypeOf(one).toEqualTypeOf<boolean>()
                  expect(one).toBe(true)

                  return !one
                },
                two: (two) => {
                  expectTypeOf(two).toEqualTypeOf<boolean>()
                  expect(two).toBe(true)

                  return !two
                },
              }
            },
          }
        },
      },
    )

    expect(shape.isTouched(monitor, params._second)).toStrictEqual({
      first: false,
      second: true,
      third: {
        one: false,
        two: false,
      },
    })
  })
})

describe("FormShapeOptions.error", () => {
  it("specifies initial error", ({ monitor }) => {
    const shape = FormShape(
      {
        first: FormUnit("", { schema: z.string() }),
        second: FormUnit(0),
        third: FormShape({
          one: FormUnit(true, { error: ["some"] }),
          two: FormUnit([""]),
        }),
        fourth: ["anything"],
      },
      {
        error: {
          first: ["another"],
          third: null,
        },
      },
    )

    expect(shape.getError(monitor, params._second)).toStrictEqual({
      first: ["another"],
      second: null,
      third: {
        one: null,
        two: null,
      },
    })
  })

  it("gets current error from setters", ({ monitor }) => {
    const shape = FormShape(
      {
        first: FormUnit("", { error: 1 }),
        second: FormUnit(0, {
          validate: (input) => (input > 0 ? [null, input] : ["must be positive", null]),
        }),
        third: FormShape(
          {
            one: FormUnit(true, { schema: z.boolean() }),
            two: FormUnit([""], { schema: z.array(z.string()) }),
          },
          {
            error: {
              one: ["one"],
              two: ["two"],
            },
          },
        ),
        fourth: ["anything"],
      },
      {
        error: (root) => {
          expectTypeOf(root).toEqualTypeOf<{
            readonly first: null | number
            readonly second: null | string
            readonly third: {
              readonly one: null | ReadonlyArray<string>
              readonly two: null | ReadonlyArray<string>
            }
          }>()

          expect(root).toStrictEqual({
            first: 1,
            second: null,
            third: {
              one: ["one"],
              two: ["two"],
            },
          })

          return {
            first: (first) => {
              expectTypeOf(first).toEqualTypeOf<null | number>()
              expect(first).toStrictEqual(1)

              return 2
            },
            second: (second) => {
              expectTypeOf(second).toEqualTypeOf<null | string>()
              expect(second).toStrictEqual(null)

              return "2"
            },
            third: (third) => {
              expectTypeOf(third).toEqualTypeOf<{
                readonly one: null | ReadonlyArray<string>
                readonly two: null | ReadonlyArray<string>
              }>()
              expect(third).toStrictEqual({
                one: ["one"],
                two: ["two"],
              })

              return {
                one: (one) => {
                  expectTypeOf(one).toEqualTypeOf<null | ReadonlyArray<string>>()
                  expect(one).toStrictEqual(["one"])

                  return [...one!, "1"]
                },
                two: (two) => {
                  expectTypeOf(two).toEqualTypeOf<null | ReadonlyArray<string>>()
                  expect(two).toStrictEqual(["two"])

                  return [...two!, "2"]
                },
              }
            },
          }
        },
      },
    )

    expect(shape.getError(monitor, params._second)).toStrictEqual({
      first: 2,
      second: "2",
      third: {
        one: ["one", "1"],
        two: ["two", "2"],
      },
    })
  })
})

describe("FormShapeOptions.initial", () => {
  it("specifies initial value", ({ monitor }) => {
    const shape = FormShape(
      {
        first: FormUnit(""),
        second: FormUnit(0),
        third: FormShape({
          one: FormUnit(true),
          two: FormUnit([""]),
        }),
        fourth: ["anything"],
      },
      {
        initial: {
          first: "1",
          third: {
            one: false,
          },
        },
      },
    )

    expect(shape.getInitial(monitor)).toStrictEqual({
      first: "1",
      second: 0,
      third: {
        one: false,
        two: [""],
      },
      fourth: ["anything"],
    })
    expect(shape.getInput(monitor)).toStrictEqual({
      first: "",
      second: 0,
      third: {
        one: true,
        two: [""],
      },
      fourth: ["anything"],
    })
  })

  it("gets current initial value from setters", ({ monitor }) => {
    const shape = FormShape(
      {
        first: FormUnit("", { initial: "1" }),
        second: FormUnit(0),
        third: FormShape({
          one: FormUnit(true, { initial: false }),
          two: FormUnit([""], { initial: ["two"] }),
        }),
        fourth: ["anything"],
      },
      {
        initial: (root) => {
          expectTypeOf(root).toEqualTypeOf<{
            readonly first: string
            readonly second: number
            readonly third: {
              readonly one: boolean
              readonly two: Array<string>
            }
            readonly fourth: Array<string>
          }>()
          expect(root).toStrictEqual({
            first: "1",
            second: 0,
            third: {
              one: false,
              two: ["two"],
            },
            fourth: ["anything"],
          })

          return {
            first: (first) => {
              expectTypeOf(first).toEqualTypeOf<string>()
              expect(first).toBe("1")

              return `${first}-first`
            },
            second: (second) => {
              expectTypeOf(second).toEqualTypeOf<number>()
              expect(second).toBe(0)

              return second + 2
            },
            third: (third) => {
              expectTypeOf(third).toEqualTypeOf<{
                readonly one: boolean
                readonly two: Array<string>
              }>()
              expect(third).toStrictEqual({
                one: false,
                two: ["two"],
              })

              return {
                one: (one) => {
                  expectTypeOf(one).toEqualTypeOf<boolean>()
                  expect(one).toBe(false)

                  return !one
                },
                two: (two) => {
                  expectTypeOf(two).toEqualTypeOf<Array<string>>()
                  expect(two).toStrictEqual(["two"])

                  return [...two, "three"]
                },
              }
            },
          }
        },
      },
    )

    expect(shape.getInitial(monitor)).toStrictEqual({
      first: "1-first",
      second: 2,
      third: {
        one: true,
        two: ["two", "three"],
      },
      fourth: ["anything"],
    })
  })
})

describe("FormShapeOptions.input", () => {
  it("specifies initial value", ({ monitor }) => {
    const shape = FormShape(
      {
        first: FormUnit(""),
        second: FormUnit(0),
        third: FormShape({
          one: FormUnit(true),
          two: FormUnit([""]),
        }),
        fourth: ["anything"],
      },
      {
        input: {
          first: "1",
          third: {
            one: false,
          },
        },
      },
    )

    expect(shape.getInitial(monitor)).toStrictEqual({
      first: "",
      second: 0,
      third: {
        one: true,
        two: [""],
      },
      fourth: ["anything"],
    })
    expect(shape.getInput(monitor)).toStrictEqual({
      first: "1",
      second: 0,
      third: {
        one: false,
        two: [""],
      },
      fourth: ["anything"],
    })
  })

  it("gets current initial value from setters", ({ monitor }) => {
    const shape = FormShape(
      {
        first: FormUnit("1"),
        second: FormUnit(0),
        third: FormShape({
          one: FormUnit(false),
          two: FormUnit(["two"]),
        }),
        fourth: ["anything"],
      },
      {
        input: (root) => {
          expectTypeOf(root).toEqualTypeOf<{
            readonly first: string
            readonly second: number
            readonly third: {
              readonly one: boolean
              readonly two: Array<string>
            }
            readonly fourth: Array<string>
          }>()
          expect(root).toStrictEqual({
            first: "1",
            second: 0,
            third: {
              one: false,
              two: ["two"],
            },
            fourth: ["anything"],
          })

          return {
            first: (first) => {
              expectTypeOf(first).toEqualTypeOf<string>()
              expect(first).toBe("1")

              return `${first}-first`
            },
            second: (second) => {
              expectTypeOf(second).toEqualTypeOf<number>()
              expect(second).toBe(0)

              return second + 2
            },
            third: (third) => {
              expectTypeOf(third).toEqualTypeOf<{
                readonly one: boolean
                readonly two: Array<string>
              }>()
              expect(third).toStrictEqual({
                one: false,
                two: ["two"],
              })

              return {
                one: (one) => {
                  expectTypeOf(one).toEqualTypeOf<boolean>()
                  expect(one).toBe(false)

                  return !one
                },
                two: (two) => {
                  expectTypeOf(two).toEqualTypeOf<Array<string>>()
                  expect(two).toStrictEqual(["two"])

                  return [...two, "three"]
                },
              }
            },
          }
        },
      },
    )

    expect(shape.getInput(monitor)).toStrictEqual({
      first: "1-first",
      second: 2,
      third: {
        one: true,
        two: ["two", "three"],
      },
      fourth: ["anything"],
    })
  })

  it("does not override the initial value", ({ monitor }) => {
    const shape = FormShape(
      {
        first: FormUnit(""),
        second: FormUnit(0),
        third: FormShape({
          one: FormUnit(true),
          two: FormUnit([""]),
        }),
        fourth: ["anything"],
      },
      {
        input: {
          first: "1",
          third: {
            one: false,
          },
        },
      },
    )

    expect(shape.getInitial(monitor)).toStrictEqual({
      first: "",
      second: 0,
      third: {
        one: true,
        two: [""],
      },
      fourth: ["anything"],
    })
  })
})

describe("FormShapeOptions.validateOn", () => {
  it("specifies initial validateOn", ({ monitor }) => {
    const shape = FormShape(
      {
        first: FormUnit("", { schema: z.string() }),
        second: FormUnit(0, { validate: (input) => [null, input] }),
        third: FormShape({
          one: FormUnit(true, { error: ["some"] }),
          two: FormUnit([""]),
        }),
        fourth: ["anything"],
      },
      {
        validateOn: {
          first: "onInit",
          third: "onChange",
        },
      },
    )

    expect(shape.getValidateOn(monitor, params._second)).toStrictEqual({
      first: "onInit",
      second: "onTouch",
      third: {
        one: "onChange",
        two: "onChange",
      },
    })
  })

  it("gets current validateOn from setters", ({ monitor }) => {
    const shape = FormShape(
      {
        first: FormUnit("", {
          validateOn: "onChange",
          schema: z.string(),
        }),
        second: FormUnit(0, {
          validate: (input) => (input > 0 ? [null, input] : ["must be positive", null]),
        }),
        third: FormShape(
          {
            one: FormUnit(true, { schema: z.boolean() }),
            two: FormUnit([""], { schema: z.array(z.string()) }),
          },
          {
            validateOn: {
              one: "onSubmit",
              two: "onInit",
            },
          },
        ),
        fourth: ["anything"],
      },
      {
        validateOn: (root) => {
          expectTypeOf(root).toEqualTypeOf<{
            readonly first: ValidateStrategy
            readonly second: ValidateStrategy
            readonly third: {
              readonly one: ValidateStrategy
              readonly two: ValidateStrategy
            }
          }>()

          expect(root).toStrictEqual({
            first: "onChange",
            second: "onTouch",
            third: {
              one: "onSubmit",
              two: "onInit",
            },
          })

          return {
            first: (first) => {
              expectTypeOf(first).toEqualTypeOf<ValidateStrategy>()
              expect(first).toStrictEqual("onChange")

              return "onTouch"
            },
            second: (second) => {
              expectTypeOf(second).toEqualTypeOf<ValidateStrategy>()
              expect(second).toStrictEqual("onTouch")

              return "onSubmit"
            },
            third: (third) => {
              expectTypeOf(third).toEqualTypeOf<{
                readonly one: ValidateStrategy
                readonly two: ValidateStrategy
              }>()
              expect(third).toStrictEqual({
                one: "onSubmit",
                two: "onInit",
              })

              return {
                one: (one) => {
                  expectTypeOf(one).toEqualTypeOf<ValidateStrategy>()
                  expect(one).toStrictEqual("onSubmit")

                  return "onInit"
                },
                two: (two) => {
                  expectTypeOf(two).toEqualTypeOf<ValidateStrategy>()
                  expect(two).toStrictEqual("onInit")

                  return "onChange"
                },
              }
            },
          }
        },
      },
    )

    expect(shape.getValidateOn(monitor, params._second)).toStrictEqual({
      first: "onTouch",
      second: "onSubmit",
      third: {
        one: "onInit",
        two: "onChange",
      },
    })
  })
})

it("follows the options type", () => {
  expectTypeOf(
    FormShape<{
      first: FormUnit<string>
      second: FormUnit<number>
      third: FormShape<{
        one: FormUnit<boolean>
        two: FormUnit<Array<string>>
      }>
      fourth: Array<string>
    }>,
  )
    .parameter(1)
    .toMatchTypeOf<
      | undefined
      | {
          touched?: Setter<
            | boolean
            | {
                readonly first?: Setter<boolean>
                readonly second?: Setter<boolean>
                readonly third?: Setter<
                  | boolean
                  | {
                      readonly one?: Setter<boolean>
                      readonly two?: Setter<boolean>
                    },
                  [
                    {
                      readonly one: boolean
                      readonly two: boolean
                    },
                  ]
                >
              },
            [
              {
                readonly first: boolean
                readonly second: boolean
                readonly third: {
                  readonly one: boolean
                  readonly two: boolean
                }
              },
            ]
          >

          initial?: Setter<
            {
              readonly first?: Setter<string, [string, string]>
              readonly second?: Setter<number, [number, number]>
              readonly third?: Setter<
                {
                  readonly one?: Setter<boolean, [boolean, boolean]>
                  readonly two?: Setter<Array<string>, [Array<string>, Array<string>]>
                },
                [
                  {
                    readonly one: boolean
                    readonly two: Array<string>
                  },
                  {
                    readonly one: boolean
                    readonly two: Array<string>
                  },
                ]
              >
            },
            [
              {
                readonly first: string
                readonly second: number
                readonly third: {
                  readonly one: boolean
                  readonly two: Array<string>
                }
                readonly fourth: Array<string>
              },
              {
                readonly first: string
                readonly second: number
                readonly third: {
                  readonly one: boolean
                  readonly two: Array<string>
                }
                readonly fourth: Array<string>
              },
            ]
          >

          input?: Setter<
            {
              readonly first?: Setter<string, [string, string]>
              readonly second?: Setter<number, [number, number]>
              readonly third?: Setter<
                {
                  readonly one?: Setter<boolean, [boolean, boolean]>
                  readonly two?: Setter<Array<string>, [Array<string>, Array<string>]>
                },
                [
                  {
                    readonly one: boolean
                    readonly two: Array<string>
                  },
                  {
                    readonly one: boolean
                    readonly two: Array<string>
                  },
                ]
              >
            },
            [
              {
                readonly first: string
                readonly second: number
                readonly third: {
                  readonly one: boolean
                  readonly two: Array<string>
                }
                readonly fourth: Array<string>
              },
              {
                readonly first: string
                readonly second: number
                readonly third: {
                  readonly one: boolean
                  readonly two: Array<string>
                }
                readonly fourth: Array<string>
              },
            ]
          >
        }
    >()
})

it("clones the fields", ({ monitor }) => {
  const shape = FormShape({
    one: FormUnit("1"),
    two: FormUnit(2),
  })
  const root = FormShape({
    first: shape,
    second: shape,
  })

  expect(root.fields.first).not.toBe(shape)
  expect(root.fields.second).not.toBe(shape)
  expect(root.fields.first.fields.one).not.toBe(shape.fields.one)
  expect(root.fields.first.fields.two).not.toBe(shape.fields.two)

  expect(root.fields.first).not.toBe(root.fields.second)
  expect(root.fields.first.fields.one).not.toBe(root.fields.second.fields.one)
  expect(root.fields.first.fields.two).not.toBe(root.fields.second.fields.two)

  root.fields.first.fields.one.setTouched(true)

  expect(root.isTouched(monitor, (_, verbose) => verbose)).toStrictEqual({
    first: {
      one: true,
      two: false,
    },
    second: {
      one: false,
      two: false,
    },
  })
})
