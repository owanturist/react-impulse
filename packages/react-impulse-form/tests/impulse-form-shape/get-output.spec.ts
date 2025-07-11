import { z } from "zod"

import { params } from "~/tools/params"

import { ImpulseFormShape, ImpulseFormUnit } from "../../src"

it("selects value", ({ scope }) => {
  const shape = ImpulseFormShape(
    {
      first: ImpulseFormUnit(""),
      second: ImpulseFormUnit(0, { schema: z.number().nonnegative() }),
      third: ImpulseFormShape({
        one: ImpulseFormUnit(true),
        two: ImpulseFormUnit(["1"], {
          schema: z.array(z.string().max(1)),
        }),
      }),
      fourth: ["anything"],
    },
    {
      validateOn: "onInit",
    },
  )

  const value = shape.getOutput(scope)
  expect(value).toStrictEqual({
    first: "",
    second: 0,
    third: {
      one: true,
      two: ["1"],
    },
    fourth: ["anything"],
  })
  expect(shape.getOutput(scope, params._first)).toStrictEqual(value)
  expect(shape.getOutput(scope, params._second)).toStrictEqual(value)

  shape.setInput({
    second: -1,
    third: {
      two: ["1", "12"],
    },
  })
  expect(shape.getOutput(scope)).toBeNull()
  expect(shape.getOutput(scope, params._first)).toBeNull()
  expect(shape.getOutput(scope, params._second)).toStrictEqual({
    first: "",
    second: null,
    third: {
      one: true,
      two: null,
    },
    fourth: ["anything"],
  })

  expectTypeOf(shape.getOutput(scope)).toEqualTypeOf<null | {
    readonly first: string
    readonly second: number
    readonly third: {
      readonly one: boolean
      readonly two: Array<string>
    }
    readonly fourth: Array<string>
  }>()
  expectTypeOf(shape.getOutput(scope, params._first)).toEqualTypeOf<null | {
    readonly first: string
    readonly second: number
    readonly third: {
      readonly one: boolean
      readonly two: Array<string>
    }
    readonly fourth: Array<string>
  }>()
  expectTypeOf(shape.getOutput(scope, params._second)).toEqualTypeOf<{
    readonly first: null | string
    readonly second: null | number
    readonly third: {
      readonly one: null | boolean
      readonly two: null | Array<string>
    }
    readonly fourth: Array<string>
  }>()
})

describe("when output is nullable", () => {
  describe("without validation/transformation", () => {
    it("returns null for hardcoded fields", ({ scope }) => {
      const shape = ImpulseFormShape({
        first: null,
        second: ImpulseFormUnit("2"),
      })

      expect(shape.getOutput(scope)).toStrictEqual({
        first: null,
        second: "2",
      })
    })

    it("returns null for unit", ({ scope }) => {
      const shape = ImpulseFormShape({
        first: ImpulseFormUnit(null),
        second: ImpulseFormUnit("2"),
      })

      expect(shape.getOutput(scope)).toStrictEqual({
        first: null,
        second: "2",
      })
    })

    it("returns null after setting input to null", ({ scope }) => {
      const shape = ImpulseFormShape({
        first: ImpulseFormUnit("1"),
        second: ImpulseFormUnit<null | string>("2"),
      })

      expect(shape.getOutput(scope)).toStrictEqual({
        first: "1",
        second: "2",
      })

      shape.setInput({ second: null })
      expect(shape.getOutput(scope)).toStrictEqual({
        first: "1",
        second: null,
      })
    })

    it("returns full output even when all fields are null", ({ scope }) => {
      const shape = ImpulseFormShape({
        first: null,
        second: ImpulseFormUnit(null),
      })

      expect(shape.getOutput(scope)).toStrictEqual({
        first: null,
        second: null,
      })
    })
  })

  describe("with transformation", () => {
    function setup(first = "1", second: null | string = "2") {
      return ImpulseFormShape({
        first: ImpulseFormUnit(first, {
          transform: (input) => input || null,
        }),
        second: ImpulseFormUnit(second),
      })
    }

    it("returns nullable output", ({ scope }) => {
      const shape = setup("")

      expect(shape.getOutput(scope)).toStrictEqual({
        first: null,
        second: "2",
      })

      shape.setInput({ first: "1" })
      expect(shape.getOutput(scope)).toStrictEqual({
        first: "1",
        second: "2",
      })
    })

    it("returns nullable output after input update", ({ scope }) => {
      const shape = setup()

      expect(shape.getOutput(scope)).toStrictEqual({
        first: "1",
        second: "2",
      })

      shape.setInput({ first: "" })
      expect(shape.getOutput(scope)).toStrictEqual({
        first: null,
        second: "2",
      })
    })

    it("returns full output even when all fields are null", ({ scope }) => {
      const shape = setup("", null)

      expect(shape.getOutput(scope)).toStrictEqual({
        first: null,
        second: null,
      })
    })
  })

  describe.each([
    [
      "validate",
      function setupWithValidate(first = "1", second: null | string = "2") {
        return ImpulseFormShape({
          first: ImpulseFormUnit(first, {
            validate: (input) =>
              input
                ? ["Value is required", null]
                : [null, input.trim() || null],
          }),
          second: ImpulseFormUnit(second),
        })
      },
    ],
    [
      "schema",
      function setupWithValidate(first = "1", second: null | string = "2") {
        return ImpulseFormShape({
          first: ImpulseFormUnit(first, {
            schema: z
              .string()
              .min(1)
              .transform((input) => input.trim() || null),
          }),
          second: ImpulseFormUnit(second),
        })
      },
    ],
  ])("with %s", (_, setup) => {
    describe("before validation", () => {
      it.skip("returns nullable on success", ({ scope }) => {
        const shape = setup(" ")

        expect(shape.getOutput(scope)).toStrictEqual({
          first: null,
          second: "2",
        })
        expect(shape.getError(scope)).toBeNull()
      })

      it("returns null before on fail", ({ scope }) => {
        const shape = setup("")

        expect(shape.getOutput(scope)).toBeNull()
        expect(shape.getError(scope)).toBeNull()
      })
    })

    // TODO it cannot work with the given constraints of the return type of ImpulseForm#getOutput
    describe.skip("after validation", () => {
      it("returns nullable on success", ({ scope }) => {
        const shape = setup("1")

        expect(shape.getOutput(scope)).toStrictEqual({
          first: "1",
          second: "2",
        })
        expect(shape.getError(scope)).toBeNull()

        shape.setInput({ first: " " })
        expect(shape.getOutput(scope)).toStrictEqual({
          first: null,
          second: "2",
        })
        expect(shape.getError(scope)).toBeNull()
      })

      it("returns null on fail", ({ scope }) => {
        const shape = setup("1")

        expect(shape.getOutput(scope)).toStrictEqual({
          first: "1",
          second: "2",
        })
        expect(shape.getError(scope)).toBeNull()

        shape.setInput({ first: "" })
        expect(shape.getOutput(scope)).toBeNull()
        expect(shape.getError(scope)).not.toBeNull()
      })
    })
  })
})
