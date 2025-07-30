import type { Scope } from "react-impulse"
import z from "zod"

import type { Setter } from "~/tools/setter"

import { ImpulseFormShape, ImpulseFormSwitch, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const active = ImpulseFormUnit("", {
    schema: z.enum(["first", "second"]),
  })

  const branches = {
    first: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  }

  const form = ImpulseFormSwitch(active, branches)

  interface InputSchema {
    readonly active: string
    readonly branches: {
      readonly first: boolean
      readonly second: {
        readonly name: string
        readonly age: number
      }
    }
  }

  type InputSetter = Setter<
    {
      readonly active?: Setter<string, [string, string]>
      readonly branches?: Setter<
        {
          readonly first?: Setter<boolean, [boolean, boolean]>
          readonly second?: Setter<
            {
              readonly name?: Setter<string, [string, string]>
              readonly age?: Setter<number, [number, number]>
            },
            [
              InputSchema["branches"]["second"],
              InputSchema["branches"]["second"],
            ]
          >
        },
        [InputSchema["branches"], InputSchema["branches"]]
      >
    },
    [InputSchema, InputSchema]
  >

  it("matches setter type for ImpulseFormSwitchOptions.input", () => {
    expectTypeOf<typeof ImpulseFormSwitch<typeof active, typeof branches>>()
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

  it("ensures the active type is a union of branch keys", () => {
    const form_1 = ImpulseFormSwitch(
      ImpulseFormUnit("first" as const),
      branches,
    )
    // @ts-expect-error - active must be a union of branch keys
    const form_2 = ImpulseFormSwitch(ImpulseFormUnit("first"), branches)

    expectTypeOf(form_1.active).toEqualTypeOf<ImpulseFormUnit<"first">>()
    expectTypeOf(form_2.active).not.toEqualTypeOf<ImpulseFormUnit<"first">>()
  })
})

it("initiates with children input", ({ scope }) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit("first" as const), {
    first: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  expect(form.getInput(scope)).toStrictEqual({
    active: "first",
    branches: {
      first: true,
      second: {
        name: "name",
        age: 18,
      },
    },
  })
})

it("initiates with overridden input", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["first", "second"]),
    }),
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
        active: "random",
        branches: {
          first: false,
          second: {
            name: "overridden",
            age: 20,
          },
        },
      },
    },
  )

  expect(form.getInput(scope)).toStrictEqual({
    active: "random",
    branches: {
      first: false,
      second: {
        name: "overridden",
        age: 20,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "",
    branches: {
      first: true,
      second: {
        name: "name",
        age: 18,
      },
    },
  })
})

it("passes input and initial to setter", ({ scope }) => {
  expect.assertions(16)

  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["first", "second"]),
    }),
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
          active: "",
          branches: {
            first: true,
            second: {
              name: "name",
              age: 18,
            },
          },
        })
        expect(initial).toStrictEqual({
          active: "",
          branches: {
            first: true,
            second: {
              name: "name",
              age: 18,
            },
          },
        })

        return {
          active: (activeInput, activeInitial) => {
            expect(activeInput).toBe("")
            expect(activeInitial).toBe("")

            return "first"
          },

          branches: (branchesInput, branchesInitial) => {
            expect(branchesInput).toStrictEqual({
              first: true,
              second: {
                name: "name",
                age: 18,
              },
            })
            expect(branchesInitial).toStrictEqual({
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
        }
      },
    },
  )

  expect(form.getInput(scope)).toStrictEqual({
    active: "first",
    branches: {
      first: false,
      second: {
        name: "updated",
        age: 30,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "",
    branches: {
      first: true,
      second: {
        name: "name",
        age: 18,
      },
    },
  })
})

it("sets input", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["first", "second"]),
    }),
    {
      first: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      second: ImpulseFormShape({
        name: ImpulseFormUnit("name"),
        age: ImpulseFormUnit(18),
      }),
    },
  )

  form.setInput({
    active: "another",
    branches: {
      first: false,
      second: {
        name: "updated",
        age: 25,
      },
    },
  })

  expect(form.getInput(scope)).toStrictEqual({
    active: "another",
    branches: {
      first: false,
      second: {
        name: "updated",
        age: 25,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "",
    branches: {
      first: true,
      second: {
        name: "name",
        age: 18,
      },
    },
  })
})

it("sets partial input", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["first", "second"]),
    }),
    {
      first: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      second: ImpulseFormShape({
        name: ImpulseFormUnit("name"),
        age: ImpulseFormUnit(18),
      }),
    },
  )

  form.setInput({
    branches: {
      second: {
        age: 25,
      },
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
    active: "",
    branches: {
      first: true,
      second: {
        name: "name",
        age: 25,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "",
    branches: {
      first: true,
      second: {
        name: "name",
        age: 18,
      },
    },
  })

  form.setInput({
    active: "any",
  })
  expect(form.getInput(scope)).toStrictEqual({
    active: "any",
    branches: {
      first: true,
      second: {
        name: "name",
        age: 25,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "",
    branches: {
      first: true,
      second: {
        name: "name",
        age: 18,
      },
    },
  })
})

it("sets input with setter", ({ scope }) => {
  expect.assertions(16)

  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["first", "second"]),
    }),
    {
      first: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      second: ImpulseFormShape({
        name: ImpulseFormUnit("name"),
        age: ImpulseFormUnit(18),
      }),
    },
  )

  form.setInput((input, initial) => {
    expect(input).toStrictEqual({
      active: "",
      branches: {
        first: true,
        second: {
          name: "name",
          age: 18,
        },
      },
    })
    expect(initial).toStrictEqual({
      active: "",
      branches: {
        first: true,
        second: {
          name: "name",
          age: 18,
        },
      },
    })

    return {
      active: (activeInput, activeInitial) => {
        expect(activeInput).toBe("")
        expect(activeInitial).toBe("")

        return "first"
      },

      branches: (branchesInput, branchesInitial) => {
        expect(branchesInput).toStrictEqual({
          first: true,
          second: {
            name: "name",
            age: 18,
          },
        })
        expect(branchesInitial).toStrictEqual({
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
    }
  })

  expect(form.getInput(scope)).toStrictEqual({
    active: "first",
    branches: {
      first: false,
      second: {
        name: "updated",
        age: 30,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "",
    branches: {
      first: true,
      second: {
        name: "name",
        age: 18,
      },
    },
  })
})
