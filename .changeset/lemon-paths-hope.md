---
"react-impulse-form": minor
---

Introduce `ImpulseFormOptional`: a conditional form container to model enabled/disabled form sections.

## Why

Many real-world forms have optional sections that can be enabled or disabled based on user choices (for example, a billing address that's different from shipping address, optional contact information, or conditional form fields). `ImpulseFormOptional` models this pattern as a single, strongly-typed form whose element is conditionally active based on an enabled/disabled boolean flag.

## What it is

- A wrapper with an `enabled` boolean form and an `element` form that's conditionally active.
- The `element` can be any `ImpulseForm` (e.g., `ImpulseFormUnit`, `ImpulseFormList`, `ImpulseFormShape`, or a nested `ImpulseFormSwitch`). Future `ImpulseForm` types will work out of the box.
- The `enabled` form must output a boolean value (enforced by types).
- When `enabled` is `false`, the form returns `undefined` as output and is considered valid regardless of the element's state.
- When `enabled` is `true`, the form returns the element's output and validity depends on the element.

## API

- Factory: `ImpulseFormOptional(enabled, element, options?)`
  - `enabled` must be a form that outputs a boolean value
  - `element` can be any `ImpulseForm`
  - `options` may set `input`, `initial`, `touched`, `validateOn`, and `error` for both parts
- Type guard: `isImpulseFormOptional(value)`.
- Optional-specific API:
  - `.enabled` — the boolean form that controls whether the element is active. You can read/modify it like any other form unit, e.g. `form.enabled.setInput(true)`.
  - `.element` — the conditionally active form. Access its fields as usual, e.g. `form.element.setInput("value")` or `form.element.fields.name.setInput("John")`.

## Output behavior

- When `enabled` is `false`: returns `undefined` (element is inactive)
- When `enabled` is `true` and `element` is valid: returns element's output value
- When `enabled` is `true` and `element` is invalid: returns `null`

## Validity behavior

- When `enabled` is `false`: form is considered valid regardless of element state
- When `enabled` is `true`: validity depends on both enabled and element forms
- Supports concise (`boolean`) and verbose (`{ enabled: boolean, element: boolean }`) validity selection

## Example

```ts
import z from "zod"
import {
  ImpulseFormUnit,
  ImpulseFormShape,
  ImpulseFormOptional,
} from "react-impulse-form"

const form = ImpulseFormOptional(
  ImpulseFormUnit(false), // enabled/disabled toggle
  ImpulseFormShape({
    street: ImpulseFormUnit("", { schema: z.string().min(1) }),
    city: ImpulseFormUnit("", { schema: z.string().min(1) }),
    zipCode: ImpulseFormUnit("", { schema: z.string().regex(/^\d{5}$/) }),
  }),
)

// Initially disabled - form is valid and returns undefined
console.log(form.getOutput(scope)) // undefined
console.log(form.isValid(scope)) // true

// Enable the optional section
form.enabled.setInput(true)
console.log(form.getOutput(scope)) // null (element is invalid)
console.log(form.isValid(scope)) // false

// Fill in the address
form.element.setInput({
  street: "123 Main St",
  city: "Springfield",
  zipCode: "12345",
})

// Now the form is valid and returns the address
console.log(form.getOutput(scope))
// { street: "123 Main St", city: "Springfield", zipCode: "12345" }
console.log(form.isValid(scope)) // true

// Disable again - form becomes valid regardless of content
form.enabled.setInput(false)
console.log(form.getOutput(scope)) // undefined
console.log(form.isValid(scope)) // true
```

## Key benefits

- Single source of truth for conditional form sections.
- Type-safe enabled/disabled semantics with automatic output handling.
- Composable: element can be any `ImpulseForm` (units, lists, shapes, switches) for arbitrarily nested conditional logic.
- Consistent API: inherits all standard form methods (`getInput`, `setInput`, `getError`, `setError`, `isValid`, `isTouched`, etc.).
