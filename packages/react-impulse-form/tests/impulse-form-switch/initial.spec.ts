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

  interface InitialSchema {
    readonly active: string
    readonly branches: {
      readonly first: boolean
      readonly second: {
        readonly name: string
        readonly age: number
      }
    }
  }

  type InitialSetter = Setter<
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
              InitialSchema["branches"]["second"],
              InitialSchema["branches"]["second"],
            ]
          >
        },
        [InitialSchema["branches"], InitialSchema["branches"]]
      >
    },
    [InitialSchema, InitialSchema]
  >

  it("matches setter type for ImpulseFormSwitchOptions.initial", () => {
    expectTypeOf<typeof ImpulseFormSwitch<typeof active, typeof branches>>()
      .parameter(2)
      .exclude<undefined>()
      .toHaveProperty("initial")
      .toEqualTypeOf<undefined | InitialSetter>()
  })

  it("matches schema type for getInitial(scope)", ({ scope }) => {
    // eslint-disable-next-line vitest/valid-expect
    expectTypeOf(form.getInitial).parameters.toEqualTypeOf<[Scope]>()
    expectTypeOf(form.getInitial(scope)).toEqualTypeOf<InitialSchema>()
  })

  it("matches setter type for setInitial(setter)", () => {
    expectTypeOf(form.setInitial).toEqualTypeOf<
      (setter: InitialSetter) => void
    >()
  })
})

it("initiates with children input", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit<"first" | "second">("first", {
      initial: "second",
    }),
    {
      first: ImpulseFormUnit(true, {
        initial: false,
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      second: ImpulseFormShape({
        name: ImpulseFormUnit("name"),
        age: ImpulseFormUnit(18, {
          initial: 20,
        }),
      }),
    },
  )

  expect(form.getInitial(scope)).toStrictEqual({
    active: "second",
    branches: {
      first: false,
      second: {
        name: "name",
        age: 20,
      },
    },
  })
})

it("initiates with overridden initial", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      initial: "any",
      schema: z.enum(["first", "second"]),
    }),
    {
      first: ImpulseFormUnit(true, {
        initial: false,
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      second: ImpulseFormShape({
        name: ImpulseFormUnit("name"),
        age: ImpulseFormUnit(18, {
          initial: 20,
        }),
      }),
    },
    {
      initial: {
        active: "another",
        branches: {
          first: true,
          second: {
            name: "overridden",
            age: 100,
          },
        },
      },
    },
  )

  expect(form.getInitial(scope)).toStrictEqual({
    active: "another",
    branches: {
      first: true,
      second: {
        name: "overridden",
        age: 100,
      },
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
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
      initial: "any",
    }),
    {
      first: ImpulseFormUnit(true, {
        initial: false,
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      second: ImpulseFormShape(
        {
          name: ImpulseFormUnit("name", {
            initial: "initial",
          }),
          age: ImpulseFormUnit(18),
        },
        {
          initial: {
            age: 100,
          },
        },
      ),
    },
    {
      initial: (initial, input) => {
        expect(initial).toStrictEqual({
          active: "any",
          branches: {
            first: false,
            second: {
              name: "initial",
              age: 100,
            },
          },
        })
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

        return {
          active: (activeInitial, activeInput) => {
            expect(activeInitial).toBe("any")
            expect(activeInput).toBe("")

            return "first"
          },

          branches: (branchesInitial, branchesInput) => {
            expect(branchesInitial).toStrictEqual({
              first: false,
              second: {
                name: "initial",
                age: 100,
              },
            })
            expect(branchesInput).toStrictEqual({
              first: true,
              second: {
                name: "name",
                age: 18,
              },
            })

            return {
              first: (firstInitial, firstInput) => {
                expect(firstInitial).toBe(false)
                expect(firstInput).toBe(true)

                return true
              },

              second: (secondInitial, secondInput) => {
                expect(secondInitial).toStrictEqual({
                  name: "initial",
                  age: 100,
                })
                expect(secondInput).toStrictEqual({
                  name: "name",
                  age: 18,
                })

                return {
                  name: (nameInitial, nameInput) => {
                    expect(nameInitial).toBe("initial")
                    expect(nameInput).toBe("name")

                    return "updated"
                  },

                  age: (ageInitial, ageInput) => {
                    expect(ageInitial).toBe(100)
                    expect(ageInput).toBe(18)

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

  expect(form.getInitial(scope)).toStrictEqual({
    active: "first",
    branches: {
      first: true,
      second: {
        name: "updated",
        age: 30,
      },
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
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

it("sets initial", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      initial: "any",
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

  form.setInitial({
    active: "something",
    branches: {
      first: false,
      second: {
        name: "updated",
        age: 25,
      },
    },
  })

  expect(form.getInitial(scope)).toStrictEqual({
    active: "something",
    branches: {
      first: false,
      second: {
        name: "updated",
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
        age: 18,
      },
    },
  })
})

it("sets partial initial", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      initial: "any",
      schema: z.enum(["first", "second"]),
    }),
    {
      first: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      second: ImpulseFormShape({
        name: ImpulseFormUnit("name", {
          initial: "initial",
        }),
        age: ImpulseFormUnit(18),
      }),
    },
  )

  form.setInitial({
    branches: {
      second: {
        age: 25,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "any",
    branches: {
      first: true,
      second: {
        name: "initial",
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
        age: 18,
      },
    },
  })

  form.setInitial({
    active: "another",
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "another",
    branches: {
      first: true,
      second: {
        name: "initial",
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
        age: 18,
      },
    },
  })
})

it("sets initial with setter", ({ scope }) => {
  expect.assertions(16)

  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["first", "second"]),
      initial: "any",
    }),
    {
      first: ImpulseFormUnit(true, {
        initial: false,
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      second: ImpulseFormShape(
        {
          name: ImpulseFormUnit("name", {
            initial: "initial",
          }),
          age: ImpulseFormUnit(18),
        },
        {
          initial: {
            age: 100,
          },
        },
      ),
    },
  )

  form.setInitial((initial, input) => {
    expect(initial).toStrictEqual({
      active: "any",
      branches: {
        first: false,
        second: {
          name: "initial",
          age: 100,
        },
      },
    })
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

    return {
      active: (activeInitial, activeInput) => {
        expect(activeInitial).toBe("any")
        expect(activeInput).toBe("")

        return "first"
      },

      branches: (branchesInitial, branchesInput) => {
        expect(branchesInitial).toStrictEqual({
          first: false,
          second: {
            name: "initial",
            age: 100,
          },
        })
        expect(branchesInput).toStrictEqual({
          first: true,
          second: {
            name: "name",
            age: 18,
          },
        })

        return {
          first: (firstInitial, firstInput) => {
            expect(firstInitial).toBe(false)
            expect(firstInput).toBe(true)

            return true
          },

          second: (secondInitial, secondInput) => {
            expect(secondInitial).toStrictEqual({
              name: "initial",
              age: 100,
            })
            expect(secondInput).toStrictEqual({
              name: "name",
              age: 18,
            })

            return {
              name: (nameInitial, nameInput) => {
                expect(nameInitial).toBe("initial")
                expect(nameInput).toBe("name")

                return "updated"
              },

              age: (ageInitial, ageInput) => {
                expect(ageInitial).toBe(100)
                expect(ageInput).toBe(18)

                return 30
              },
            }
          },
        }
      },
    }
  })

  expect(form.getInitial(scope)).toStrictEqual({
    active: "first",
    branches: {
      first: true,
      second: {
        name: "updated",
        age: 30,
      },
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
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
