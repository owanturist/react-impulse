import type { Scope } from "react-impulse"
import z from "zod"

import type { Setter } from "~/tools/setter"

import { ImpulseFormShape, ImpulseFormSwitch, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const branches = {
    first: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  }

  const form = ImpulseFormSwitch("first", branches)

  interface InputSchema {
    readonly first: boolean
    readonly second: {
      readonly name: string
      readonly age: number
    }
  }

  type InputSetter = Setter<
    {
      readonly first?: Setter<boolean, [boolean, boolean]>
      readonly second?: Setter<
        {
          readonly name?: Setter<string, [string, string]>
          readonly age?: Setter<number, [number, number]>
        },
        [
          {
            readonly name: string
            readonly age: number
          },
          {
            readonly name: string
            readonly age: number
          },
        ]
      >
    },
    [InputSchema, InputSchema]
  >

  it("matches setter type for ImpulseFormSwitchOptions.input", () => {
    expectTypeOf<typeof ImpulseFormSwitch<typeof branches>>()
      .parameter(2)
      .exclude<undefined>()
      .toHaveProperty("input")
      .toEqualTypeOf<undefined | InputSetter>()
  })

  it("matches schema type for getInput(scope)", ({ scope }) => {
    // eslint-disable-next-line vitest/valid-expect
    expectTypeOf(form.getInput).parameters.toEqualTypeOf<[Scope]>()
    expectTypeOf(form.getInput(scope)).toEqualTypeOf<InputSchema>()
  })

  it("matches setter type for setInput(setter)", () => {
    expectTypeOf(form.setInput).toEqualTypeOf<(setter: InputSetter) => void>()
  })
})

it("initiates with children input", ({ scope }) => {
  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  expect(form.getInput(scope)).toStrictEqual({
    first: true,
    second: {
      name: "name",
      age: 18,
    },
  })
})

it("initiates with overridden input", ({ scope }) => {
  const form = ImpulseFormSwitch(
    "first",
    {
      first: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      second: ImpulseFormShape({
        name: ImpulseFormUnit("name"),
        age: ImpulseFormUnit(18),
      }),
    },
    {
      input: {
        first: false,
        second: {
          name: "overridden",
          age: 20,
        },
      },
    },
  )

  expect(form.getInput(scope)).toStrictEqual({
    first: false,
    second: {
      name: "overridden",
      age: 20,
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    first: true,
    second: {
      name: "name",
      age: 18,
    },
  })
})

it("passes input and initial to setter", ({ scope }) => {
  const form = ImpulseFormSwitch(
    "first",
    {
      first: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      second: ImpulseFormShape({
        name: ImpulseFormUnit("name"),
        age: ImpulseFormUnit(18),
      }),
    },
    {
      input: (input, initial) => {
        expect(input).toStrictEqual({
          first: true,
          second: {
            name: "name",
            age: 18,
          },
        })
        expect(initial).toStrictEqual({
          first: true,
          second: {
            name: "name",
            age: 18,
          },
        })

        return {
          first: (firstInput, firstInitial) => {
            expect(firstInput).toBe(true)
            expect(firstInitial).toBe(true)

            return false
          },

          second: (secondInput, secondInitial) => {
            expect(secondInput).toStrictEqual({
              name: "name",
              age: 18,
            })
            expect(secondInitial).toStrictEqual({
              name: "name",
              age: 18,
            })

            return {
              name: (nameInput, nameInitial) => {
                expect(nameInput).toBe("name")
                expect(nameInitial).toBe("name")

                return "updated"
              },

              age: (ageInput, ageInitial) => {
                expect(ageInput).toBe(18)
                expect(ageInitial).toBe(18)

                return 30
              },
            }
          },
        }
      },
    },
  )

  expect(form.getInput(scope)).toStrictEqual({
    first: false,
    second: {
      name: "updated",
      age: 30,
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    first: true,
    second: {
      name: "name",
      age: 18,
    },
  })
})

it("sets input", ({ scope }) => {
  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  form.setInput({
    first: false,
    second: {
      name: "updated",
      age: 25,
    },
  })

  expect(form.getInput(scope)).toStrictEqual({
    first: false,
    second: {
      name: "updated",
      age: 25,
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    first: true,
    second: {
      name: "name",
      age: 18,
    },
  })
})

it("sets partial input", ({ scope }) => {
  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  form.setInput({
    second: {
      age: 25,
    },
  })

  expect(form.getInput(scope)).toStrictEqual({
    first: true,
    second: {
      name: "name",
      age: 25,
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    first: true,
    second: {
      name: "name",
      age: 18,
    },
  })
})

it("sets input with setter", ({ scope }) => {
  expect.assertions(12)

  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  form.setInput((input, initial) => {
    expect(input).toStrictEqual({
      first: true,
      second: {
        name: "name",
        age: 18,
      },
    })
    expect(initial).toStrictEqual({
      first: true,
      second: {
        name: "name",
        age: 18,
      },
    })

    return {
      first: (firstInput, firstInitial) => {
        expect(firstInput).toBe(true)
        expect(firstInitial).toBe(true)

        return false
      },

      second: (secondInput, secondInitial) => {
        expect(secondInput).toStrictEqual({
          name: "name",
          age: 18,
        })
        expect(secondInitial).toStrictEqual({
          name: "name",
          age: 18,
        })

        return {
          name: (nameInput, nameInitial) => {
            expect(nameInput).toBe("name")
            expect(nameInitial).toBe("name")

            return "updated"
          },

          age: (ageInput, ageInitial) => {
            expect(ageInput).toBe(18)
            expect(ageInitial).toBe(18)

            return 30
          },
        }
      },
    }
  })

  expect(form.getInput(scope)).toStrictEqual({
    first: false,
    second: {
      name: "updated",
      age: 30,
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    first: true,
    second: {
      name: "name",
      age: 18,
    },
  })
})
