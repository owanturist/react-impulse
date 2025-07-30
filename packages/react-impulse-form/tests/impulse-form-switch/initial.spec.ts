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

  interface InitialSchema {
    readonly first: boolean
    readonly second: {
      readonly name: string
      readonly age: number
    }
  }

  type InitialSetter = Setter<
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
    [InitialSchema, InitialSchema]
  >

  it("matches setter type for ImpulseFormSwitchOptions.initial", () => {
    expectTypeOf<typeof ImpulseFormSwitch<typeof branches>>()
      .parameter(2)
      .exclude<undefined>()
      .toHaveProperty("initial")
      .toEqualTypeOf<undefined | InitialSetter>()
  })

  it("matches schema type for getInitial(scope)", () => {
    expectTypeOf(form.getInitial).toEqualTypeOf<
      (scope: Scope) => InitialSchema
    >()
  })

  it("matches setter type for setInitial(setter)", () => {
    expectTypeOf(form.setInitial).toEqualTypeOf<
      (setter: InitialSetter) => void
    >()
  })
})

it("initiates with children input", ({ scope }) => {
  const form = ImpulseFormSwitch("first", {
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
  })

  expect(form.getInitial(scope)).toStrictEqual({
    first: false,
    second: {
      name: "name",
      age: 20,
    },
  })
})

it("initiates with overridden initial", ({ scope }) => {
  const form = ImpulseFormSwitch(
    "first",
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
        first: true,
        second: {
          name: "overridden",
          age: 100,
        },
      },
    },
  )

  expect(form.getInitial(scope)).toStrictEqual({
    first: true,
    second: {
      name: "overridden",
      age: 100,
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
    first: true,
    second: {
      name: "name",
      age: 18,
    },
  })
})

it("sets initial", ({ scope }) => {
  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  form.setInitial({
    first: false,
    second: {
      name: "updated",
      age: 25,
    },
  })

  expect(form.getInitial(scope)).toStrictEqual({
    first: false,
    second: {
      name: "updated",
      age: 25,
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
    first: true,
    second: {
      name: "name",
      age: 18,
    },
  })
})

it("sets partial initial", ({ scope }) => {
  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name", {
        initial: "initial",
      }),
      age: ImpulseFormUnit(18),
    }),
  })

  form.setInitial({
    second: {
      age: 25,
    },
  })

  expect(form.getInitial(scope)).toStrictEqual({
    first: true,
    second: {
      name: "initial",
      age: 25,
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
    first: true,
    second: {
      name: "name",
      age: 18,
    },
  })
})

it("sets initial with setter", ({ scope }) => {
  expect.assertions(12)

  const form = ImpulseFormSwitch("first", {
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
  })

  form.setInitial((initial, input) => {
    expect(initial).toStrictEqual({
      first: false,
      second: {
        name: "initial",
        age: 100,
      },
    })
    expect(input).toStrictEqual({
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
  })

  expect(form.getInitial(scope)).toStrictEqual({
    first: true,
    second: {
      name: "updated",
      age: 30,
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
    first: true,
    second: {
      name: "name",
      age: 18,
    },
  })
})
