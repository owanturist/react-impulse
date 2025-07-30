import type { Scope } from "react-impulse"
import z from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormShape,
  ImpulseFormSwitch,
  type ImpulseFormSwitchBranch,
  ImpulseFormUnit,
} from "../../src"

describe("types", () => {
  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(true, {
      schema: z
        .boolean()
        .transform((value): string => (value ? "ok" : "not ok")),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  type OutputSchema =
    | ImpulseFormSwitchBranch<"first", string>
    | ImpulseFormSwitchBranch<
        "second",
        {
          readonly name: string
          readonly age: number
        }
      >

  type OutputVerboseSchema =
    | ImpulseFormSwitchBranch<"first", null | string>
    | ImpulseFormSwitchBranch<
        "second",
        {
          readonly name: null | string
          readonly age: null | number
        }
      >

  it("matches schema type for getOutput(scope, select?)", ({ scope }) => {
    expectTypeOf(form.getOutput(scope)).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(
      form.getOutput(scope, params._first),
    ).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(
      form.getOutput(scope, params._second),
    ).toEqualTypeOf<OutputVerboseSchema>()
  })

  it("matches schema type for getActive(scope)", ({ scope }) => {
    // eslint-disable-next-line vitest/valid-expect
    expectTypeOf(form.getActive).parameters.toEqualTypeOf<[Scope]>()
    expectTypeOf(form.getActive(scope)).toEqualTypeOf<"first" | "second">()
  })

  it("matches schema type for setActive(scope)", () => {
    expectTypeOf(form.setActive).toEqualTypeOf<
      (setter: Setter<"first" | "second">) => void
    >()
  })
})

it("returns null for initially invalid branch", ({ scope }) => {
  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(0, {
      schema: z.number().min(1),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  expect(form.getActive(scope)).toBe("first")

  expect(form.getOutput(scope)).toBeNull()
  expect(form.getOutput(scope, params._first)).toBeNull()
  expect(form.getOutput(scope, params._second)).toStrictEqual({
    kind: "first",
    value: null,
  })
})

it("returns output after switching from invalid to valid branch", ({
  scope,
}) => {
  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(0, {
      schema: z.number().min(1),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  form.setActive("second")

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

it("returns null after switching from valid to invalid branch", ({ scope }) => {
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

it("returns output for initially valid branch", ({ scope }) => {
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

it("ignores invalid inactive branches", ({ scope }) => {
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
