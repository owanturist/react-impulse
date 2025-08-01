import z from "zod"

import { params } from "~/tools/params"

import {
  ImpulseFormShape,
  ImpulseFormSwitch,
  type ImpulseFormSwitchBranch,
  ImpulseFormUnit,
} from "../../src"

describe("types", () => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["first", "second"]),
    }),
    {
      first: ImpulseFormUnit(true, {
        schema: z
          .boolean()
          .transform((value): string => (value ? "ok" : "not ok")),
      }),
      second: ImpulseFormShape({
        name: ImpulseFormUnit("name"),
        age: ImpulseFormUnit(18),
      }),
      third: ImpulseFormUnit("excluded"),
    },
  )

  type OutputSchema =
    | ImpulseFormSwitchBranch<"first", string>
    | ImpulseFormSwitchBranch<
        "second",
        {
          readonly name: string
          readonly age: number
        }
      >

  interface OutputVerboseSchema {
    readonly active: null | "first" | "second"
    readonly branches: {
      readonly first: null | string
      readonly second: {
        readonly name: null | string
        readonly age: null | number
      }
      readonly third: null | string
    }
  }

  it("matches schema type for getOutput(scope, select?)", ({ scope }) => {
    expectTypeOf(form.getOutput(scope)).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(
      form.getOutput(scope, params._first),
    ).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(
      form.getOutput(scope, params._second),
    ).toEqualTypeOf<OutputVerboseSchema>()
  })
})

describe("when branch is initially invalid", () => {
  it("returns null for initially invalid active", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        schema: z.enum(["first", "second"]),
      }),
      {
        first: ImpulseFormUnit(0, {
          schema: z.number().min(1),
        }),
        second: ImpulseFormShape({
          name: ImpulseFormUnit("name"),
          age: ImpulseFormUnit(18),
        }),
        third: ImpulseFormUnit(false),
      },
    )

    expect(form.getOutput(scope)).toBeNull()
    expect(form.getOutput(scope, params._first)).toBeNull()
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      active: null,
      branches: {
        first: null,
        second: {
          name: "name",
          age: 18,
        },
        third: false,
      },
    })
  })

  it("returns null for initially valid active", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("first", {
        schema: z.enum(["first", "second"]),
      }),
      {
        first: ImpulseFormUnit(0, {
          schema: z.number().min(1),
        }),
        second: ImpulseFormShape({
          name: ImpulseFormUnit("name"),
          age: ImpulseFormUnit(18),
        }),
        third: ImpulseFormUnit(false),
      },
    )

    expect(form.getOutput(scope)).toBeNull()
    expect(form.getOutput(scope, params._first)).toBeNull()
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      active: "first",
      branches: {
        first: null,
        second: {
          name: "name",
          age: 18,
        },
        third: false,
      },
    })
  })

  it("returns output after switching to valid branch", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("first", {
        schema: z.enum(["first", "second"]),
      }),
      {
        first: ImpulseFormUnit(0, {
          schema: z.number().min(1),
        }),
        second: ImpulseFormShape({
          name: ImpulseFormUnit("name"),
          age: ImpulseFormUnit(18),
        }),
      },
    )

    form.active.setInput("second")

    expect(form.active.getOutput(scope)).toBe("second")
    expect(form.branches.second.getOutput(scope)).toStrictEqual({
      name: "name",
      age: 18,
    })
    expect(form.getOutput(scope)).toStrictEqual({
      kind: "second",
      value: {
        name: "name",
        age: 18,
      },
    })
    expect(form.getOutput(scope, params._first)).toStrictEqual({
      kind: "second",
      value: {
        name: "name",
        age: 18,
      },
    })
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      active: "second",
      branches: {
        first: null,
        second: {
          name: "name",
          age: 18,
        },
      },
    })
  })
})

it.skip("returns null after switching from valid to invalid branch", ({
  scope,
}) => {
  const form = ImpulseFormSwitch("second", {
    first: ImpulseFormUnit(0, {
      schema: z.number().min(1),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  form.setActive("first")

  expect(form.getOutput(scope)).toBeNull()
  expect(form.getOutput(scope, params._first)).toBeNull()
  expect(form.getOutput(scope, params._second)).toStrictEqual({
    kind: "first",
    value: null,
  })
})

it.skip("returns output for initially valid branch", ({ scope }) => {
  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(1, {
      schema: z.number().min(1),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  expect(form.getActive(scope)).toBe("first")

  const output = {
    kind: "first",
    value: 1,
  }

  expect(form.getOutput(scope)).toStrictEqual(output)
  expect(form.getOutput(scope, params._first)).toStrictEqual(output)
  expect(form.getOutput(scope, params._second)).toStrictEqual(output)
})

it.skip("ignores invalid inactive branches", ({ scope }) => {
  const form = ImpulseFormSwitch("second", {
    first: ImpulseFormUnit(0, {
      schema: z.number().min(1),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
    third: ImpulseFormUnit("", {
      schema: z.string().min(1),
    }),
  })

  expect(form.getActive(scope)).toBe("second")

  const output = {
    kind: "second",
    value: {
      name: "name",
      age: 18,
    },
  }

  expect(form.getOutput(scope)).toStrictEqual(output)
  expect(form.getOutput(scope, params._first)).toStrictEqual(output)
  expect(form.getOutput(scope, params._second)).toStrictEqual(output)
})
