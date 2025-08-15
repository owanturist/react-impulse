---
"react-impulse-form": minor
---

Introduce `ImpulseFormSwitch`: a discriminated-union form container to model one-of-many form branches.

## Why

Many real-world forms have conditional sections (for example, switching between an "individual" and a "business" profile, or changing the contact method). `ImpulseFormSwitch` models this pattern as a single, strongly-typed form whose active branch is chosen by a discriminant value.

## What it is

- A wrapper with an `active` discriminant and a `branches` map.
- Branches can be any `ImpulseForm` (e.g., `ImpulseFormUnit`, `ImpulseFormList`, `ImpulseFormShape`, or a nested `ImpulseFormSwitch`). Future `ImpulseForm` types will work out of the box.
- Keys of `branches` must exhaustively cover the possible values of `active` (enforced by types).

## API

- Factory: `ImpulseFormSwitch(active, branches, options?)`
  - `options` may set per-branch `input`, `initial`, `touched`, `validateOn`, and `error`.
- Type guard: `isImpulseFormSwitch(value)`.
- Switch-specific API:
  - `.active` — an `ImpulseFormUnit<string>` that controls the discriminant (the currently selected branch key). You can read/modify it like any other form unit, e.g. `form.active.setInput("business")`.
  - `.branches` — a map of branch key → `ImpulseForm`. Each entry is a fully-featured form (unit, list, shape, or nested switch). Access branch-specific fields as usual, e.g. `form.branches.business.fields.companyName.setInput("ACME LLC")`.

## Example

```ts
import z from "zod"
import {
  ImpulseFormUnit,
  ImpulseFormShape,
  ImpulseFormSwitch,
} from "react-impulse-form"

const form = ImpulseFormSwitch(
  ImpulseFormUnit("individual", {
    schema: z.enum(["individual", "business"]),
  }),

  {
    individual: ImpulseFormShape({
      firstName: ImpulseFormUnit(""),
      lastName: ImpulseFormUnit(""),
    }),
    business: ImpulseFormShape({
      companyName: ImpulseFormUnit(""),
      vatNumber: ImpulseFormUnit(""),
    }),
  },
)

// Switch active branch and update fields
form.active.setInput("business")
form.branches.business.fields.companyName.setInput("ACME LLC")

// Read concise output for the current active branch
const output = form.getOutput(scope)
// => { kind: "business", value: { companyName: "ACME LLC", vatNumber: "" } }
```

## Key benefits

- Single source of truth for conditional forms.
- Exhaustive, compile-time-checked mapping from the discriminant to branches.
- Composable: branches can be any `ImpulseForm` (units, lists, shapes, or other switches) for arbitrarily nested flows.
