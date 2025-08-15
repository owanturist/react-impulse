import type { Scope } from "react-impulse"
import z from "zod"

import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormShape,
  ImpulseFormSwitch,
  type ImpulseFormSwitchInputSetter,
  type ImpulseFormSwitchOptions,
  ImpulseFormUnit,
} from "../../src"

describe("types", () => {
  const active = ImpulseFormUnit("", {
    schema: z.enum(["_1", "_2"]),
  })

  const branches = {
    _1: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    _2: ImpulseFormShape({
      _3: ImpulseFormUnit("name"),
      _4: ImpulseFormUnit(18),
    }),
  }

  const form = ImpulseFormSwitch(active, branches)

  interface InitialSchema {
    readonly active: string
    readonly branches: {
      readonly _1: boolean
      readonly _2: {
        readonly _3: string
        readonly _4: number
      }
    }
  }

  type InitialSetter = Setter<
    {
      readonly active?: Setter<string, [string, string]>
      readonly branches?: Setter<
        {
          readonly _1?: Setter<boolean, [boolean, boolean]>
          readonly _2?: Setter<
            {
              readonly _3?: Setter<string, [string, string]>
              readonly _4?: Setter<number, [number, number]>
            },
            [InitialSchema["branches"]["_2"], InitialSchema["branches"]["_2"]]
          >
        },
        [InitialSchema["branches"], InitialSchema["branches"]]
      >
    },
    [InitialSchema, InitialSchema]
  >

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

  it("ensures ImpulseFormSwitchOptions.initial type", () => {
    const form = ImpulseFormSwitch(active, branches, {
      initial: {
        // @ts-expect-error should be a string
        active: 1,
        branches: {
          // @ts-expect-error should be a number
          _1: 0,
          _2: {
            // @ts-expect-error should be a string
            _3: false,
            // @ts-expect-error should be a number
            _4: "",
          },
        },
      },
    })

    expectTypeOf(form.getInitial).returns.toEqualTypeOf<InitialSchema>()
  })

  describe("nested", () => {
    const parent = ImpulseFormSwitch(ImpulseFormUnit<"_6" | "_7">("_6"), {
      _6: ImpulseFormUnit(0),
      _7: form,
    })

    interface ParentInitialSchema {
      readonly active: "_6" | "_7"
      readonly branches: {
        readonly _6: number
        readonly _7: InitialSchema
      }
    }

    type ParentInitialSetter = Setter<
      {
        readonly active?: Setter<"_6" | "_7", ["_6" | "_7", "_6" | "_7"]>
        readonly branches?: Setter<
          {
            readonly _6?: Setter<number, [number, number]>
            readonly _7?: InitialSetter
          },
          [ParentInitialSchema["branches"], ParentInitialSchema["branches"]]
        >
      },
      [ParentInitialSchema, ParentInitialSchema]
    >

    it("matches schema type for getInitial(scope)", () => {
      expectTypeOf(parent.getInitial).toEqualTypeOf<
        (scope: Scope) => ParentInitialSchema
      >()
    })

    it("matches setter type for setInitial(setter)", () => {
      expectTypeOf(parent.setInitial).toEqualTypeOf<
        (setter: ParentInitialSetter) => void
      >()
    })
  })
})

it("initiates with children input", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("_1", {
      initial: "_2",
      schema: z.enum(["_1", "_2", "_5"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        initial: false,
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18, {
          initial: 20,
        }),
      }),
      _5: ImpulseFormSwitch(ImpulseFormUnit<"_6" | "_7">("_6"), {
        _6: ImpulseFormUnit(0),
        _7: ImpulseFormUnit("0"),
      }),
    },
  )

  expect(form.getInitial(scope)).toStrictEqual({
    active: "_2",
    branches: {
      _1: false,
      _2: {
        _3: "name",
        _4: 20,
      },
      _5: {
        active: "_6",
        branches: {
          _6: 0,
          _7: "0",
        },
      },
    },
  })
})

it("initiates with overridden initial", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      initial: "_5",
      schema: z.enum(["_1", "_2", "_5"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        initial: false,
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18, {
          initial: 20,
        }),
      }),
      _5: ImpulseFormSwitch(ImpulseFormUnit<"_6" | "_7">("_6"), {
        _6: ImpulseFormUnit(0),
        _7: ImpulseFormUnit("0"),
      }),
    },
    {
      initial: {
        active: "_6",
        branches: {
          _1: true,
          _2: {
            _3: "overridden",
            _4: 100,
          },
          _5: {
            active: "_7",
            branches: {
              _6: 1,
              _7: "1",
            },
          },
        },
      },
    },
  )

  expect(form.getInitial(scope)).toStrictEqual({
    active: "_6",
    branches: {
      _1: true,
      _2: {
        _3: "overridden",
        _4: 100,
      },
      _5: {
        active: "_7",
        branches: {
          _6: 1,
          _7: "1",
        },
      },
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
    active: "",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 18,
      },
      _5: {
        active: "_6",
        branches: {
          _6: 0,
          _7: "0",
        },
      },
    },
  })
})

it("sets initial", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      initial: "_8",
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    },
  )

  form.setInitial({
    active: "_9",
    branches: {
      _1: false,
      _2: {
        _3: "updated",
        _4: 25,
      },
    },
  })

  expect(form.getInitial(scope)).toStrictEqual({
    active: "_9",
    branches: {
      _1: false,
      _2: {
        _3: "updated",
        _4: 25,
      },
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
    active: "",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 18,
      },
    },
  })
})

it("sets partial initial", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      initial: "_10",
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name", {
          initial: "initial",
        }),
        _4: ImpulseFormUnit(18),
      }),
    },
  )

  form.setInitial({
    branches: {
      _2: {
        _4: 25,
      },
    },
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "_10",
    branches: {
      _1: true,
      _2: {
        _3: "initial",
        _4: 25,
      },
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
    active: "",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 18,
      },
    },
  })

  form.setInitial({
    active: "_11",
  })
  expect(form.getInitial(scope)).toStrictEqual({
    active: "_11",
    branches: {
      _1: true,
      _2: {
        _3: "initial",
        _4: 25,
      },
    },
  })
  expect(form.getInput(scope)).toStrictEqual({
    active: "",
    branches: {
      _1: true,
      _2: {
        _3: "name",
        _4: 18,
      },
    },
  })
})

describe("using recursive setter", () => {
  const active = ImpulseFormUnit("", {
    schema: z.enum(["_1", "_2", "_5"]),
    initial: "_12",
  })

  const branches = {
    _1: ImpulseFormUnit(true, {
      initial: false,
      schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
    }),
    _2: ImpulseFormShape(
      {
        _3: ImpulseFormUnit("name", {
          initial: "initial",
        }),
        _4: ImpulseFormUnit(18),
      },
      {
        initial: {
          _4: 100,
        },
      },
    ),
    _5: ImpulseFormSwitch(
      ImpulseFormUnit("_6", {
        schema: z.enum(["_6", "_7"]),
      }),
      {
        _6: ImpulseFormUnit(0, { initial: 1 }),
        _7: ImpulseFormUnit("0"),
      },
      {
        initial: {
          active: "_7",
          branches: {
            _6: 2,
          },
        },
      },
    ),
  }

  function setup(
    options?: ImpulseFormSwitchOptions<typeof active, typeof branches>,
  ) {
    return ImpulseFormSwitch(active, branches, options)
  }

  describe.each<
    [
      string,
      (
        input: ImpulseFormSwitchInputSetter<typeof active, typeof branches>,
      ) => ImpulseFormSwitch<typeof active, typeof branches>,
    ]
  >([
    [
      "ImpulseFormSwitchOptions.initial",
      (initial) => {
        return setup({ initial })
      },
    ],

    [
      "ImpulseFormSwitch.setInitial",
      (setter) => {
        const form = setup()

        form.setInitial(setter)

        return form
      },
    ],
  ])("in %s", (_, setup) => {
    it("passes initial and input recursively to all setters", ({ scope }) => {
      expect.assertions(26)

      const form = setup((initial, input) => {
        expect(initial).toStrictEqual({
          active: "_12",
          branches: {
            _1: false,
            _2: {
              _3: "initial",
              _4: 100,
            },
            _5: {
              active: "_7",
              branches: {
                _6: 2,
                _7: "0",
              },
            },
          },
        })
        expect(input).toStrictEqual({
          active: "",
          branches: {
            _1: true,
            _2: {
              _3: "name",
              _4: 18,
            },
            _5: {
              active: "_6",
              branches: {
                _6: 0,
                _7: "0",
              },
            },
          },
        })

        return {
          active: (initial_active, input_active) => {
            expect(initial_active).toBe("_12")
            expect(input_active).toBe("")

            return "_1"
          },

          branches: (initial_branches, input_branches) => {
            expect(initial_branches).toStrictEqual({
              _1: false,
              _2: {
                _3: "initial",
                _4: 100,
              },
              _5: {
                active: "_7",
                branches: {
                  _6: 2,
                  _7: "0",
                },
              },
            })
            expect(input_branches).toStrictEqual({
              _1: true,
              _2: {
                _3: "name",
                _4: 18,
              },
              _5: {
                active: "_6",
                branches: {
                  _6: 0,
                  _7: "0",
                },
              },
            })

            return {
              _1: (initial_1, input_1) => {
                expect(initial_1).toBe(false)
                expect(input_1).toBe(true)

                return true
              },

              _2: (initial_2, input_2) => {
                expect(initial_2).toStrictEqual({
                  _3: "initial",
                  _4: 100,
                })
                expect(input_2).toStrictEqual({
                  _3: "name",
                  _4: 18,
                })

                return {
                  _3: (initial_3, input_3) => {
                    expect(initial_3).toBe("initial")
                    expect(input_3).toBe("name")

                    return "updated"
                  },

                  _4: (initial_4, input_4) => {
                    expect(initial_4).toBe(100)
                    expect(input_4).toBe(18)

                    return 30
                  },
                }
              },

              _5: (initial_5, input_5) => {
                expect(initial_5).toStrictEqual({
                  active: "_7",
                  branches: {
                    _6: 2,
                    _7: "0",
                  },
                })
                expect(input_5).toStrictEqual({
                  active: "_6",
                  branches: {
                    _6: 0,
                    _7: "0",
                  },
                })

                return {
                  active: (initial_active, input_active) => {
                    expect(initial_active).toBe("_7")
                    expect(input_active).toBe("_6")

                    return "_5"
                  },

                  branches: (initial_branches, input_branches) => {
                    expect(initial_branches).toStrictEqual({
                      _6: 2,
                      _7: "0",
                    })
                    expect(input_branches).toStrictEqual({
                      _6: 0,
                      _7: "0",
                    })

                    return {
                      _6: (initial_6, input_6) => {
                        expect(initial_6).toBe(2)
                        expect(input_6).toBe(0)

                        return 3
                      },

                      _7: (initial_7, input_7) => {
                        expect(initial_7).toBe("0")
                        expect(input_7).toBe("0")

                        return "3"
                      },
                    }
                  },
                }
              },
            }
          },
        }
      })

      expect(form.getInitial(scope)).toStrictEqual({
        active: "_1",
        branches: {
          _1: true,
          _2: {
            _3: "updated",
            _4: 30,
          },
          _5: {
            active: "_5",
            branches: {
              _6: 3,
              _7: "3",
            },
          },
        },
      })
      expect(form.getInput(scope)).toStrictEqual({
        active: "",
        branches: {
          _1: true,
          _2: {
            _3: "name",
            _4: 18,
          },
          _5: {
            active: "_6",
            branches: {
              _6: 0,
              _7: "0",
            },
          },
        },
      })
    })
  })
})

describe("stable initial value", () => {
  it("subsequently selects equal initial", ({ scope }) => {
    const form = ImpulseFormSwitch(ImpulseFormUnit<"_1" | "_2" | "_5">("_1"), {
      _1: ImpulseFormUnit(true),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
      _5: ImpulseFormSwitch(
        ImpulseFormUnit("_6", {
          schema: z.enum(["_6", "_7"]),
        }),
        {
          _6: ImpulseFormUnit(0),
          _7: ImpulseFormUnit("0"),
        },
      ),
    })

    expect(form.getInitial(scope)).toBeInstanceOf(Object)
    expect(form.getInitial(scope)).toBe(form.getInitial(scope))
  })

  it("persists unchanged branches input between changes", ({ scope }) => {
    const form = ImpulseFormSwitch(ImpulseFormUnit<"_1" | "_2" | "_5">("_1"), {
      _1: ImpulseFormUnit(true),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
      _5: ImpulseFormSwitch(
        ImpulseFormUnit("_6", {
          schema: z.enum(["_6", "_7"]),
        }),
        {
          _6: ImpulseFormUnit(0),
          _7: ImpulseFormUnit("0"),
        },
      ),
    })

    const initial_0 = form.getInitial(scope)

    form.setInitial({
      branches: {
        _2: {
          _3: "updated",
        },
      },
    })

    const initial_1 = form.getInitial(scope)

    expect(initial_1).not.toBe(initial_0)
    expect(initial_1.active).toBe(initial_0.active)
    expect(initial_1.branches).not.toBe(initial_0.branches)
    expect(initial_1.branches._2).not.toBe(initial_0.branches._2)
    expect(initial_1.branches._5).toBe(initial_0.branches._5)
  })

  it("selects unequal initial values when isInputEqual is not specified", ({
    scope,
  }) => {
    const form = ImpulseFormSwitch(ImpulseFormUnit("_1" as const), {
      _1: ImpulseFormUnit([0]),
    })

    const initial_0 = form.getInitial(scope)

    form.setInitial({
      branches: {
        _1: [0],
      },
    })
    const initial_1 = form.getInitial(scope)

    expect(initial_0).not.toBe(initial_1)
    expect(initial_0).toStrictEqual(initial_1)
  })

  it("selects equal initial values when isInputEqual is specified", ({
    scope,
  }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        schema: z.enum(["_1"]),
      }),
      {
        _1: ImpulseFormUnit([0], {
          isInputEqual: isShallowArrayEqual,
        }),
      },
    )

    const initial_0 = form.getInitial(scope)

    form.setInitial({
      branches: {
        _1: [0],
      },
    })
    const initial_1 = form.getInitial(scope)

    expect(initial_0).toBe(initial_1)
    expect(initial_0).toStrictEqual(initial_1)
  })
})
