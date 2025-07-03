import { z } from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormShape,
  ImpulseFormUnit,
  type ValidateStrategy,
} from "../../src"

it("composes ImpulseFormShape from ImpulseFormUnit", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    second: ImpulseFormUnit(0),
    third: ImpulseFormUnit([false]),
  })

  expectTypeOf(shape).toEqualTypeOf<
    ImpulseFormShape<{
      first: ImpulseFormUnit<string>
      second: ImpulseFormUnit<number>
      third: ImpulseFormUnit<Array<boolean>>
    }>
  >()

  const input = shape.getInput(scope)

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

  const value = shape.getOutput(scope)

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

it("composes ImpulseFormShape from ImpulseFormUnit with schema", ({
  scope,
}) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit("", {
      schema: z.string().min(1).pipe(z.coerce.boolean()),
    }),
    second: ImpulseFormUnit(0, {
      schema: z
        .number()
        .min(100)
        .transform((x) => x.toFixed(2)),
    }),
  })

  expectTypeOf(shape).toEqualTypeOf<
    ImpulseFormShape<{
      first: ImpulseFormUnit<string, ReadonlyArray<string>, boolean>
      second: ImpulseFormUnit<number, ReadonlyArray<string>, string>
    }>
  >()

  const value = shape.getOutput(scope)

  expectTypeOf(value).toEqualTypeOf<null | {
    readonly first: boolean
    readonly second: string
  }>()
  expect(value).toBeNull()
})

it("gives direct access to the fields", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    second: ImpulseFormUnit(0),
  })

  expect(shape.fields.first.getInput(scope)).toBe("")
  expect(shape.fields.second.getInput(scope)).toBe(0)
})

it("allows to specify none-form fields", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    id: 123,
    name: "john",
  })

  expectTypeOf(shape).toEqualTypeOf<
    ImpulseFormShape<{
      first: ImpulseFormUnit<string>
      id: number
      name: string
    }>
  >()

  const input = shape.getInput(scope)
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

  const value = shape.getOutput(scope)
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
})

it("refers to the same specs", () => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    second: ImpulseFormUnit(0),
    third: ImpulseFormShape({
      one: ImpulseFormUnit(true),
      two: ImpulseFormUnit([""]),
    }),
  })

  // @ts-expect-error it does not mind to ignore ts in tests
  expect(shape._spec._fields.first).toBe(shape.fields.first._spec)
  // @ts-expect-error it does not mind to ignore ts in tests
  expect(shape._spec._fields.second).toBe(shape.fields.second._spec)
  // @ts-expect-error it does not mind to ignore ts in tests
  expect(shape._spec._fields.third).toBe(shape.fields.third._spec)

  // @ts-expect-error it does not mind to ignore ts in tests
  expect(shape._spec._fields.third._fields.one).toBe(
    // @ts-expect-error it does not mind to ignore ts in tests
    shape.fields.third._spec._fields.one,
  )
  // @ts-expect-error it does not mind to ignore ts in tests
  expect(shape._spec._fields.third._fields.two).toBe(
    // @ts-expect-error it does not mind to ignore ts in tests
    shape.fields.third._spec._fields.two,
  )
})

it("refers to the same states", () => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    second: ImpulseFormUnit(0),
    third: ImpulseFormShape({
      one: ImpulseFormUnit(true),
      two: ImpulseFormUnit([""]),
    }),
  })

  // @ts-expect-error it does not mind to ignore ts in tests
  expect(shape._state._fields.first).toBe(shape.fields.first._state)
  // @ts-expect-error it does not mind to ignore ts in tests
  expect(shape._state._fields.second).toBe(shape.fields.second._state)
  // @ts-expect-error it does not mind to ignore ts in tests
  expect(shape._state._fields.third).toBe(shape.fields.third._state)

  // @ts-expect-error it does not mind to ignore ts in tests
  expect(shape._state._fields.third._fields.one).toBe(
    // @ts-expect-error it does not mind to ignore ts in tests
    shape.fields.third._state._fields.one,
  )
  // @ts-expect-error it does not mind to ignore ts in tests
  expect(shape._state._fields.third._fields.two).toBe(
    // @ts-expect-error it does not mind to ignore ts in tests
    shape.fields.third._state._fields.two,
  )
})

describe("ImpulseFormShapeOptions.touched", () => {
  it("specifies initial touched", ({ scope }) => {
    const shape = ImpulseFormShape(
      {
        first: ImpulseFormUnit(""),
        second: ImpulseFormUnit(0),
        third: ImpulseFormShape({
          one: ImpulseFormUnit(true),
          two: ImpulseFormUnit([""]),
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

    expect(shape.isTouched(scope, params._second)).toStrictEqual({
      first: true,
      second: false,
      third: {
        one: true,
        two: true,
      },
    })
  })

  it("gets current touched from setters", ({ scope }) => {
    const shape = ImpulseFormShape(
      {
        first: ImpulseFormUnit("", { touched: true }),
        second: ImpulseFormUnit(0),
        third: ImpulseFormShape(
          {
            one: ImpulseFormUnit(true),
            two: ImpulseFormUnit([""]),
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

    expect(shape.isTouched(scope, params._second)).toStrictEqual({
      first: false,
      second: true,
      third: {
        one: false,
        two: false,
      },
    })
  })
})

describe("ImpulseFormShapeOptions.error", () => {
  it("specifies initial error", ({ scope }) => {
    const shape = ImpulseFormShape(
      {
        first: ImpulseFormUnit("", { schema: z.string() }),
        second: ImpulseFormUnit(0),
        third: ImpulseFormShape({
          one: ImpulseFormUnit(true, { error: ["some"] }),
          two: ImpulseFormUnit([""]),
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

    expect(shape.getError(scope, params._second)).toStrictEqual({
      first: ["another"],
      second: null,
      third: {
        one: null,
        two: null,
      },
    })
  })

  it("gets current error from setters", ({ scope }) => {
    const shape = ImpulseFormShape(
      {
        first: ImpulseFormUnit("", { error: 1 }),
        second: ImpulseFormUnit(0, {
          validate: (input) =>
            input > 0 ? [null, input] : ["must be positive", null],
        }),
        third: ImpulseFormShape(
          {
            one: ImpulseFormUnit(true, { schema: z.boolean() }),
            two: ImpulseFormUnit([""], { schema: z.array(z.string()) }),
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
                  expectTypeOf(
                    one,
                  ).toEqualTypeOf<null | ReadonlyArray<string>>()
                  expect(one).toStrictEqual(["one"])

                  return [...one!, "1"]
                },
                two: (two) => {
                  expectTypeOf(
                    two,
                  ).toEqualTypeOf<null | ReadonlyArray<string>>()
                  expect(two).toStrictEqual(["two"])

                  return [...two!, "2"]
                },
              }
            },
          }
        },
      },
    )

    expect(shape.getError(scope, params._second)).toStrictEqual({
      first: 2,
      second: "2",
      third: {
        one: ["one", "1"],
        two: ["two", "2"],
      },
    })
  })
})

describe("ImpulseFormShapeOptions.initial", () => {
  it("specifies initial value", ({ scope }) => {
    const shape = ImpulseFormShape(
      {
        first: ImpulseFormUnit(""),
        second: ImpulseFormUnit(0),
        third: ImpulseFormShape({
          one: ImpulseFormUnit(true),
          two: ImpulseFormUnit([""]),
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

    expect(shape.getInitial(scope)).toStrictEqual({
      first: "1",
      second: 0,
      third: {
        one: false,
        two: [""],
      },
      fourth: ["anything"],
    })
    expect(shape.getInput(scope)).toStrictEqual({
      first: "",
      second: 0,
      third: {
        one: true,
        two: [""],
      },
      fourth: ["anything"],
    })
  })

  it("gets current initial value from setters", ({ scope }) => {
    const shape = ImpulseFormShape(
      {
        first: ImpulseFormUnit("", { initial: "1" }),
        second: ImpulseFormUnit(0),
        third: ImpulseFormShape({
          one: ImpulseFormUnit(true, { initial: false }),
          two: ImpulseFormUnit([""], { initial: ["two"] }),
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

              return first + "-first"
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

    expect(shape.getInitial(scope)).toStrictEqual({
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

describe("ImpulseFormShapeOptions.input", () => {
  it("specifies initial value", ({ scope }) => {
    const shape = ImpulseFormShape(
      {
        first: ImpulseFormUnit(""),
        second: ImpulseFormUnit(0),
        third: ImpulseFormShape({
          one: ImpulseFormUnit(true),
          two: ImpulseFormUnit([""]),
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

    expect(shape.getInitial(scope)).toStrictEqual({
      first: "",
      second: 0,
      third: {
        one: true,
        two: [""],
      },
      fourth: ["anything"],
    })
    expect(shape.getInput(scope)).toStrictEqual({
      first: "1",
      second: 0,
      third: {
        one: false,
        two: [""],
      },
      fourth: ["anything"],
    })
  })

  it("gets current initial value from setters", ({ scope }) => {
    const shape = ImpulseFormShape(
      {
        first: ImpulseFormUnit("1"),
        second: ImpulseFormUnit(0),
        third: ImpulseFormShape({
          one: ImpulseFormUnit(false),
          two: ImpulseFormUnit(["two"]),
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

              return first + "-first"
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

    expect(shape.getInput(scope)).toStrictEqual({
      first: "1-first",
      second: 2,
      third: {
        one: true,
        two: ["two", "three"],
      },
      fourth: ["anything"],
    })
  })

  it("does not override the initial value", ({ scope }) => {
    const shape = ImpulseFormShape(
      {
        first: ImpulseFormUnit(""),
        second: ImpulseFormUnit(0),
        third: ImpulseFormShape({
          one: ImpulseFormUnit(true),
          two: ImpulseFormUnit([""]),
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

    expect(shape.getInitial(scope)).toStrictEqual({
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

describe("ImpulseFormShapeOptions.validateOn", () => {
  it("specifies initial validateOn", ({ scope }) => {
    const shape = ImpulseFormShape(
      {
        first: ImpulseFormUnit("", { schema: z.string() }),
        second: ImpulseFormUnit(0),
        third: ImpulseFormShape({
          one: ImpulseFormUnit(true, { error: ["some"] }),
          two: ImpulseFormUnit([""]),
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

    expect(shape.getValidateOn(scope, params._second)).toStrictEqual({
      first: "onInit",
      second: "onTouch",
      third: {
        one: "onChange",
        two: "onChange",
      },
    })
  })

  it("gets current validateOn from setters", ({ scope }) => {
    const shape = ImpulseFormShape(
      {
        first: ImpulseFormUnit("", {
          validateOn: "onChange",
          schema: z.string(),
        }),
        second: ImpulseFormUnit(0, {
          validate: (input) => {
            return input > 0 ? [null, input] : ["must be positive", null]
          },
        }),
        third: ImpulseFormShape(
          {
            one: ImpulseFormUnit(true, { schema: z.boolean() }),
            two: ImpulseFormUnit([""], { schema: z.array(z.string()) }),
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

    expect(shape.getValidateOn(scope, params._second)).toStrictEqual({
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
    ImpulseFormShape<{
      first: ImpulseFormUnit<string>
      second: ImpulseFormUnit<number>
      third: ImpulseFormShape<{
        one: ImpulseFormUnit<boolean>
        two: ImpulseFormUnit<Array<string>>
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
                  readonly two?: Setter<
                    Array<string>,
                    [Array<string>, Array<string>]
                  >
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
                  readonly two?: Setter<
                    Array<string>,
                    [Array<string>, Array<string>]
                  >
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

it("clones the fields", ({ scope }) => {
  const shape = ImpulseFormShape({
    one: ImpulseFormUnit("1"),
    two: ImpulseFormUnit(2),
  })
  const root = ImpulseFormShape({
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

  expect(root.isTouched(scope, (_, verbose) => verbose)).toStrictEqual({
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
