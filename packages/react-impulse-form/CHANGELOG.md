# react-impulse-form

## 0.15.1

### Patch Changes

- [#953](https://github.com/owanturist/react-impulse/pull/953) [`b4ad2ce`](https://github.com/owanturist/react-impulse/commit/b4ad2ce26eab37fdffd4b457d6439fb4a28e3e68) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react from 19.1.10 to 19.1.11

- [#960](https://github.com/owanturist/react-impulse/pull/960) [`d91c757`](https://github.com/owanturist/react-impulse/commit/d91c75747461ff9d83539eb05778193d4cec82da) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react from 19.1.11 to 19.1.12

## 0.15.0

### Minor Changes

- [#949](https://github.com/owanturist/react-impulse/pull/949) [`1ad24b6`](https://github.com/owanturist/react-impulse/commit/1ad24b6b5559129f1453b8cf11adc0588d857e9f) Thanks [@owanturist](https://github.com/owanturist)! - Add `ImpulseFormOptional.getEnabledElement()` method:

  ```dart
  public getEnabledElement(scope: Scope): undefined | TElement
  ```

## 0.14.0

### Minor Changes

- [#937](https://github.com/owanturist/react-impulse/pull/937) [`13539a1`](https://github.com/owanturist/react-impulse/commit/13539a18d7f0ce91247109f730071edc2a42f19b) Thanks [@owanturist](https://github.com/owanturist)! - Introduce `ImpulseFormOptional`: a conditional form container to model enabled/disabled form sections.

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

### Patch Changes

- [#947](https://github.com/owanturist/react-impulse/pull/947) [`a027bbd`](https://github.com/owanturist/react-impulse/commit/a027bbdb7bad18b7b25c2a4c173baaf1d4fb89b0) Thanks [@owanturist](https://github.com/owanturist)! - Bump typescript from 5.8.3 to 5.9.2

- [#947](https://github.com/owanturist/react-impulse/pull/947) [`a027bbd`](https://github.com/owanturist/react-impulse/commit/a027bbdb7bad18b7b25c2a4c173baaf1d4fb89b0) Thanks [@owanturist](https://github.com/owanturist)! - Bump @types/react from 19.1.9 to 19.1.10

## 0.13.0

### Minor Changes

- [#943](https://github.com/owanturist/react-impulse/pull/943) [`1a64333`](https://github.com/owanturist/react-impulse/commit/1a64333471a41df486668a307468f44a892f995a) Thanks [@owanturist](https://github.com/owanturist)! - Add `ImpulseFormSwitch.getActiveBranch()` method:

  ```dart
  public getActiveBranch(
    scope: Scope,
  ): undefined | ActiveSwitchBranch<TBranches>
  ```

## 0.12.0

### Minor Changes

- [#929](https://github.com/owanturist/react-impulse/pull/929) [`93bdad4`](https://github.com/owanturist/react-impulse/commit/93bdad461d7a361bd2485136fcfb4c17881332da) Thanks [@owanturist](https://github.com/owanturist)! - Bump peer dependency `react-impulse` to `^3.0.3`.

- [#918](https://github.com/owanturist/react-impulse/pull/918) [`79e91fa`](https://github.com/owanturist/react-impulse/commit/79e91fa5a710c35215d403ad6d7206c87a9024a1) Thanks [@owanturist](https://github.com/owanturist)! - Refactor `ImpulseForm` class architecture for better maintainability and type safety
  - Added overloaded signatures with optional `select` parameter to `isValid()` and `isInvalid()` methods for consistent API with other flag methods
  - Simplified internal architecture by delegating all operations to `_state: ImpulseFormState<TParams>`

- [#930](https://github.com/owanturist/react-impulse/pull/930) [`f992830`](https://github.com/owanturist/react-impulse/commit/f992830fda654b35dae89d556fecaaf366e36d5d) Thanks [@owanturist](https://github.com/owanturist)! - Introduce `ImpulseFormSwitch`: a discriminated-union form container to model one-of-many form branches.

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

- [#918](https://github.com/owanturist/react-impulse/pull/918) [`79e91fa`](https://github.com/owanturist/react-impulse/commit/79e91fa5a710c35215d403ad6d7206c87a9024a1) Thanks [@owanturist](https://github.com/owanturist)! - Introduce `type ImpulseFormMeta<T>` for reactive static fields in `ImpulseFormShape`:

  ```typescript
  export type ImpulseFormMeta<T> = (scope: Scope) => T
  ```

  This change makes non-`ImpulseForm` fields in `ImpulseFormShape` reactive, enabling proper resetting of `ImpulseFormList` elements that include meta fields.

  The way to define meta fields remains unchanged:

  ```typescript
  const shape = ImpulseFormShape({
    id: ImpulseFormUnit(0),
    name: ImpulseFormUnit(""),
    metaField: "some value", // Now reactive
  })
  ```

  However, accessing meta field values now requires a scope:

  ```typescript
  const value = shape.fields.metaField(scope)

  // instead of
  const value = shape.fields.metaField
  ```

  ***

  Resolve #923

### Patch Changes

- [#936](https://github.com/owanturist/react-impulse/pull/936) [`18ca0e5`](https://github.com/owanturist/react-impulse/commit/18ca0e57fe5f05f3f0255c4b1f11803fc863f223) Thanks [@owanturist](https://github.com/owanturist)! - Drop useless `Impulse.compare` definitions for `ImpulseFormList` and `ImpulseFormShape`.

## 0.11.1

### Patch Changes

- [#892](https://github.com/owanturist/react-impulse/pull/892) [`9e22f05`](https://github.com/owanturist/react-impulse/commit/9e22f053852f796e25b5fbd4dc6f3c3d8aea5d83) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump terser from 5.40.0 to 5.43.1

- [#898](https://github.com/owanturist/react-impulse/pull/898) [`b81e684`](https://github.com/owanturist/react-impulse/commit/b81e6844562601f5f052fc6b59df17448808d524) Thanks [@owanturist](https://github.com/owanturist)! - Minify class and function names in production builds.

## 0.11.0

### Minor Changes

- [#875](https://github.com/owanturist/react-impulse/pull/875) [`4751d23`](https://github.com/owanturist/react-impulse/commit/4751d2346f325c788b8640f2a97a912edb7b75fc) Thanks [@owanturist](https://github.com/owanturist)! - Do not use `NonNullable` for output and error types in `FormImpulseUnit` fabric.

- [#877](https://github.com/owanturist/react-impulse/pull/877) [`0d7f207`](https://github.com/owanturist/react-impulse/commit/0d7f20748acbc6b9dccaea3d005e82c5dc81909b) Thanks [@owanturist](https://github.com/owanturist)! - Introduce `transform` option to `ImpulseFormUnit` fabric allowing to transform the form output without introducing a validation error.

- [#878](https://github.com/owanturist/react-impulse/pull/878) [`0e6bef2`](https://github.com/owanturist/react-impulse/commit/0e6bef277c8dc44d367674f775b7141c14a6248a) Thanks [@owanturist](https://github.com/owanturist)! - The `ImpulseForm#onFocusWhenInvalid` method has been implemented, so it is now possible to attach a listener to any form, not only `ImpulseFormUnit`. It focuses on the furthest first invalid field with the `onFocus` listener attached to it.

- [#875](https://github.com/owanturist/react-impulse/pull/875) [`4751d23`](https://github.com/owanturist/react-impulse/commit/4751d2346f325c788b8640f2a97a912edb7b75fc) Thanks [@owanturist](https://github.com/owanturist)! - The `Result` type does not narrow nullable error type anymore.

## 0.10.1

### Patch Changes

- [#873](https://github.com/owanturist/react-impulse/pull/873) [`cde1f46`](https://github.com/owanturist/react-impulse/commit/cde1f4619702bfebe6f0c85f336f00617ea85f0b) Thanks [@owanturist](https://github.com/owanturist)! - Calling `ImpulseForm#reset()` updates the `isValidated` state according the `validateOn` strategy. Resolves [#797](https://github.com/owanturist/react-impulse/issues/797).

- [#868](https://github.com/owanturist/react-impulse/pull/868) [`d48327e`](https://github.com/owanturist/react-impulse/commit/d48327e6ed48aa060f8c0ea80821a24555b83baf) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react from 19.1.5 to 19.1.6

## 0.10.0

### Minor Changes

- [#862](https://github.com/owanturist/react-impulse/pull/862) [`821639a`](https://github.com/owanturist/react-impulse/commit/821639a2a201898f223306854d48005d61bf7533) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  Rename `ImpulseForm#focusFirstInvalidValue` to `ImpulseForm#focusFirstInvalid`.

- [#862](https://github.com/owanturist/react-impulse/pull/862) [`821639a`](https://github.com/owanturist/react-impulse/commit/821639a2a201898f223306854d48005d61bf7533) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**
  - Merge `ImpulseFormValue.of` fabric and `ImpulseFormValue` type into a single `ImpulseFormUnit` definition.
  - Merge `ImpulseFormList.of` fabric and `ImpulseFormList` type into a single `ImpulseFormList` definition.
  - Merge `ImpulseFormShape.of` fabric and `ImpulseFormShape` type into a single `ImpulseFormShape` definition.

  #### Rationale

  The changes were made to align the `react-impulse` API with the `react-impulse-form` API, which already has a single definition for `Impulse`.

- [#862](https://github.com/owanturist/react-impulse/pull/862) [`821639a`](https://github.com/owanturist/react-impulse/commit/821639a2a201898f223306854d48005d61bf7533) Thanks [@owanturist](https://github.com/owanturist)! - - Introduce new `isImpulseFormUnit` high order function to check if a value is an instance of `ImpulseFormUnit`.
  - Introduce new `isImpulseFormList` high order function to check if a value is an instance of `ImpulseFormList`.
  - Introduce new `isImpulseFormShape` high order function to check if a value is an instance of `ImpulseFormShape`.

- [#863](https://github.com/owanturist/react-impulse/pull/863) [`fb58e0a`](https://github.com/owanturist/react-impulse/commit/fb58e0aa9ef6786beb21a92f5aedfc148de9f9cb) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  The `ImpulseFormUnit#getOutput` returns the output value even when the unit is **not validated**. It used to return `[null, null]` in such cases.

- [#862](https://github.com/owanturist/react-impulse/pull/862) [`821639a`](https://github.com/owanturist/react-impulse/commit/821639a2a201898f223306854d48005d61bf7533) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  Split `ImpulseForm.isImpulseForm` to a hight order function `isImpulseForm`.

- [#862](https://github.com/owanturist/react-impulse/pull/862) [`821639a`](https://github.com/owanturist/react-impulse/commit/821639a2a201898f223306854d48005d61bf7533) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  Remove export of `type Setter`.

## 0.9.0

### Minor Changes

- [#853](https://github.com/owanturist/react-impulse/pull/853) [`ec25ec3`](https://github.com/owanturist/react-impulse/commit/ec25ec331680fdbe0cef9a9580acd39e163bf298) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  A custom error generic for `ImpulseFormValue<TInput, TError = null, TOutput = TInput>` has been introduced. The `ImpulseForm#setErrors` and `ImpulseForm#getErrors` methods were renamed to `ImpulseForm#setError` and `ImpulseForm#getError`, respectively.

  #### Rationale

  This change was made to provide a more flexible and type-safe way to handle errors in the `ImpulseFormValue` class. By allowing users to specify a custom error type, we can better accommodate different use cases and improve the overall usability of the library.

  #### Migration Guide
  1. Specify the `TError` as `ReadonlyArray<string>` when creating an `ImpulseFormValue` with `schema`:

     ```ts
     const form: ImpulseFormValue<
       string,
       ReadonlyArray<string>
     > = ImpulseFormValue.of("", { schema: z.string() })
     ```

  2. Specify custom error type when creating an `ImpulseFormValue` with `validate`:

     ```ts
     const form: ImpulseFormValue<string, string> = ImpulseFormValue.of("", {
       validate: (value) => {
         return value.length > 0 ? [null, value] : ["Value is required", null]
       },
     })
     ```

- [#855](https://github.com/owanturist/react-impulse/pull/855) [`00d5240`](https://github.com/owanturist/react-impulse/commit/00d52409fbcc201887c03cd92ad2e412c8a0f598) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  The `useImpulseForm` and `useImpulseFormValue` hooks have been removed from the library. The `react` is no longer a peer dependency.

  #### Rationale

  This change was made to decouple the library from React, allowing it to be used in any JavaScript environment without being tied to a specific framework.

  #### Migration Guide
  1. Replace use of `useImpulseForm` by combining `ImpulseFormValue#onSubmit` and `React.useEffect` hook:

     ```ts
     const form = ImpulseFormValue.of("")

     // before
     useImpulseForm(form, {
       onSubmit: (values, itself) => {
         console.log(values, itself)
       },
     })

     // after
     React.useEffect(() => {
       // the method returns cleanup function
       return form.onSubmit((values) => {
         console.log(values, form)
       })
     }, [form])
     ```

  2. Replace use of `useImpulseFormValue` by combining `ImpulseFormValue#onFocusWhenInvalid` and `React.useEffect` hook:

     ```tsx
     const form = ImpulseFormValue.of("")
     const inputRef = React.useRef(null)

     <input ref={inputRef} />

     // before
     useImpulseFormValue(form, {
       onFocusInvalid: inputRef
     })

     // after
     React.useEffect(() => {
       // the method returns cleanup function
       return form.onFocusWhenInvalid(() => {
         inputRef.current?.focus()
       })
     }, [form, inputRef])
     ```

### Patch Changes

- [#850](https://github.com/owanturist/react-impulse/pull/850) [`5100c67`](https://github.com/owanturist/react-impulse/commit/5100c679fa631a4d136a7ad0cd68869a96520e90) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react from 19.1.3 to 19.1.5

- [#861](https://github.com/owanturist/react-impulse/pull/861) [`7c8cf05`](https://github.com/owanturist/react-impulse/commit/7c8cf054425c53ecba205044fa8c2f4eecd6658c) Thanks [@owanturist](https://github.com/owanturist)! - Reorganize the internal source code structure of the `react-impulse` and `react-impulse-form` packages to improve consistency across the file and folder structure. Split the set of common tools to reuse them in both packages without introducing a common npm package.

## 0.8.0

### Minor Changes

- [#813](https://github.com/owanturist/react-impulse/pull/813) [`0983fb0`](https://github.com/owanturist/react-impulse/commit/0983fb04e4dc99f382c46abca597a8687d491940) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**
  - Added support for React 19
  - Dropped support for React 16 and React 17
  - Updated minimum peer dependency to React 18.0.0

- [#839](https://github.com/owanturist/react-impulse/pull/839) [`a365443`](https://github.com/owanturist/react-impulse/commit/a3654439578dc15ad8ecbf5a5edf0ecf37d8879b) Thanks [@owanturist](https://github.com/owanturist)! - Bump `react-impulse` peer dependency to `^3.0.0`.

### Patch Changes

- [#811](https://github.com/owanturist/react-impulse/pull/811) [`a7d9c1c`](https://github.com/owanturist/react-impulse/commit/a7d9c1c1c150e8092696795881bfde4b410afae9) Thanks [@owanturist](https://github.com/owanturist)! - Update tsconfig.target from `es2017` to `ES2020`.

- [#805](https://github.com/owanturist/react-impulse/pull/805) [`4f4a632`](https://github.com/owanturist/react-impulse/commit/4f4a6320d676761a8e68da0b54c50aaf53adb5e1) Thanks [@owanturist](https://github.com/owanturist)! - Do not use `Impulse#getValue` with the select API anymore.

## 0.7.1

### Patch Changes

- [#790](https://github.com/owanturist/react-impulse/pull/790) [`167bb77`](https://github.com/owanturist/react-impulse/commit/167bb7760211d1a5966a3f730f534beba78c0e77) Thanks [@owanturist](https://github.com/owanturist)! - Drop custom `manglePlugin` in favor of `terser` default mangling.

- [#798](https://github.com/owanturist/react-impulse/pull/798) [`846f22b`](https://github.com/owanturist/react-impulse/commit/846f22bc965bfcd1134678e06ef244e0c72bb7dc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump use-sync-external-store from 1.4.0 to 1.5.0

## 0.7.0

### Minor Changes

- [#785](https://github.com/owanturist/react-impulse/pull/785) [`b8561e4`](https://github.com/owanturist/react-impulse/commit/b8561e457a572a153108ad2ac419cc41b02dcf76) Thanks [@owanturist](https://github.com/owanturist)! - Update dependencies:
  - `@changesets/changelog-github@0.5.1`
  - `@changesets/cli@2.28.1`
  - `@size-limit/preset-small-lib@11.2.0`
  - `happy-dom@17.4.4`
  - `prettier@3.5.3`
  - `size-limit@11.2.0`
  - `terser@5.39.0`
  - `tsup@8.4.0`
  - `typescript@5.8.2`

## 0.6.0

### Minor Changes

- [#760](https://github.com/owanturist/react-impulse/pull/760) [`4209542`](https://github.com/owanturist/react-impulse/commit/4209542ade96ec49dfdf564f68ae3515073082c4) Thanks [@owanturist](https://github.com/owanturist)! - Drop `zod` from dependencies but keep `ImpulseFormValueOptions.schema` compatible with `zod` schemas.

- [#758](https://github.com/owanturist/react-impulse/pull/758) [`0ff7450`](https://github.com/owanturist/react-impulse/commit/0ff7450cdb4141b650717ea8fd6f0f3e9ca9e1cd) Thanks [@owanturist](https://github.com/owanturist)! - Expose `Result` to the public API.

  ```ts
  export type Result<TError, TData> = [TError] extends [never]
    ? [null, TData]
    : [TError, null] | [null, TData]
  ```

### Patch Changes

- [#764](https://github.com/owanturist/react-impulse/pull/764) [`cf0d1d0`](https://github.com/owanturist/react-impulse/commit/cf0d1d0f7d2026a6a7cdee4bff6e0be7a0b26b9f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump rollup from 4.21.2 to 4.22.4

## 0.5.0

### Minor Changes

- [#756](https://github.com/owanturist/react-impulse/pull/756) [`1debffe`](https://github.com/owanturist/react-impulse/commit/1debffe71ac3217205d7601501fa0286cbda7f38) Thanks [@owanturist](https://github.com/owanturist)! - Introduce `ImpulseFormValueOptions.isInputDirty` option:
  A compare function that determines whether the input is dirty. When it is, the `ImpulseFormValue#isDirty` returns `true`. Fallbacks to `not(isInputEqual)` if not provided.

  Useful for values that have intermediate states deviating from the initial value, but should not be considered dirty such as strings, unsorted arrays, etc. Intended to tune business logic and avoid false positives for dirty states.

  ```ts
  const form = ImpulseFormValue.of("", {
    isInputDirty: (left, right) => left.trim() !== right.trim(),
  })

  form.setInput(" ")
  form.isDirty(scope) === false
  ```

  ***

  Deletes `ImpulseFormValue#setCompare` option.

## 0.4.0

### Minor Changes

- [#743](https://github.com/owanturist/react-impulse/pull/743) [`bdbe810`](https://github.com/owanturist/react-impulse/commit/bdbe810e84bddcb4176d1235cd31e45a449b2041) Thanks [@owanturist](https://github.com/owanturist)! - 1. `ImpulseForm#setInitialValue` receives two parameters in the callback:
  - initial value
  - current (original) value
  1. `ImpulseForm#setOriginalValue` receives two parameters in the callback:
     - current (original) value
     - initial value
  1. `ImpulseFormList#reset` and `ImpulseFormList#isDirty` work correctly for removed/added items (Resolves #694)

- [#748](https://github.com/owanturist/react-impulse/pull/748) [`fae44ab`](https://github.com/owanturist/react-impulse/commit/fae44ab46696fbc6c734d6939a5b917fa1cf82ca) Thanks [@owanturist](https://github.com/owanturist)! - Rename all entries of `value` to `output`, `originalValue` to `input`, and `initialValue` to `initial`
  1. `ImpulseForm`:
     1. `ImpulseFormParams['value.schema']` -> `ImpulseFormParams['output.schema']`
     2. `ImpulseFormParams['value.schema.verbose']` -> `ImpulseFormParams['output.schema.verbose']`
     3. `ImpulseFormParams['originalValue.schema']` -> `ImpulseFormParams['input.schema']`
     4. `ImpulseFormParams['originalValue.setter']` -> `ImpulseFormParams['input.setter']`
     5. `ImpulseForm#getValue` -> `ImpulseFormParams#getOutput`
     6. `ImpulseForm#getOriginalValue` -> `ImpulseFormParams#getInput`
     7. `ImpulseForm#setOriginalValue` -> `ImpulseFormParams#setInput`
     8. `ImpulseForm#getInitialValue` -> `ImpulseFormParams#getInitial`
     9. `ImpulseForm#setInitialValue` -> `ImpulseFormParams#setInitial`
  2. `ImpulseFormList`:
     1. `ImpulseFormListOptions.initialValue` -> `ImpulseFormListOptions.initial`
     2. `ImpulseFormListOptions.originalValue` -> `ImpulseFormListOptions.input`
  3. `ImpulseFormShape`:
     1. `ImpulseFormShapeOptions.initialValue` -> `ImpulseFormShapeOptions.initial`
     2. `ImpulseFormShapeOptions.originalValue` -> `ImpulseFormShapeOptions.input`
  4. `ImpulseFormValue`:
     1. `ImpulseFormValue<TOriginalValue, TValue>` -> `ImpulseFormValue<TInput, TOutput>`
     2. `ImpulseFormValueOptions.isOriginalValueEqual` -> `ImpulseFormValueOptions.isInputEqual`
     3. `ImpulseFormValueOptions.initialValue` -> `ImpulseFormValueOptions.initial`

  ***

  Drop redundant generic from `ImpulseFormValue.of` when `TInput` and `TOutput` are the same.

### Patch Changes

- [#743](https://github.com/owanturist/react-impulse/pull/743) [`bdbe810`](https://github.com/owanturist/react-impulse/commit/bdbe810e84bddcb4176d1235cd31e45a449b2041) Thanks [@owanturist](https://github.com/owanturist)! - Update dependencies. Replace `remeda` by custom functions.

## 0.3.2

### Patch Changes

- [#682](https://github.com/owanturist/react-impulse/pull/682) [`7cb0620`](https://github.com/owanturist/react-impulse/commit/7cb0620dc120a96b4edf2382526feabf3eb31bd4) Thanks [@owanturist](https://github.com/owanturist)! - `ImpulseForm#isInvalid` does not check for `isValidated` anymore.

## 0.3.1

### Patch Changes

- [#676](https://github.com/owanturist/react-impulse/pull/676) [`98641bd`](https://github.com/owanturist/react-impulse/commit/98641bd199babca7ab0c7c80720ab9e913c7967a) Thanks [@owanturist](https://github.com/owanturist)! - Fixes:
  - `ImpulseForm#isValid` returns true only when `ImpulseForm#isValidated` is true.
  - `ImpulseFormValue#reset` sets `ImpulseFormValue#isTouched` to false.

## 0.3.0

### Minor Changes

- [#671](https://github.com/owanturist/react-impulse/pull/671) [`9cf128c`](https://github.com/owanturist/react-impulse/commit/9cf128c769ac99c14cf4f14dd2abb50a2f632ce3) Thanks [@owanturist](https://github.com/owanturist)! - Breaking change:
  - Rename `ImpulseFormValueOptions.compare` to `ImpulseFormValueOptions.isOriginalValueEqual`
  - `ImpulseFormValue#setOriginalValue` does not reset errors on call anymore. Call `ImpulseFormValue#setErrors([])` manually when needed.

- [#674](https://github.com/owanturist/react-impulse/pull/674) [`8f7d9e2`](https://github.com/owanturist/react-impulse/commit/8f7d9e2f3787bf3f7ff1fe49d9ae7711862210f0) Thanks [@owanturist](https://github.com/owanturist)! - Breaking changes:
  - `ImpulseFormShape#isValidated`, `ImpulseFormShape#isDirty`, and `ImpulseFormShape#isTouched` return `false` for empty shapes.

  Introduced:
  - `ImpulseFormList` class.

## 0.2.0

### Minor Changes

- [#661](https://github.com/owanturist/react-impulse/pull/661) [`01f1f56`](https://github.com/owanturist/react-impulse/commit/01f1f562b759844632d6d7fbd22b0dfb1555470e) Thanks [@owanturist](https://github.com/owanturist)! - Introduce:
  - ```ts
    abstract class ImpulseForm {
      isSubmitting(scope: Scope): boolean

      getSubmitCount(scope: Scope): number

      onSubmit(
        listener: (value: TParams["value.schema"]) => void | Promise<unknown>,
      ): VoidFunction

      submit(): Promise<void>

      focusFirstInvalidValue(): void

      isValidated(scope: Scope): boolean
      isValidated<TResult>(
        scope: Scope,
        select: (
          concise: TParams["flag.schema"],
          verbose: TParams["flag.schema.verbose"],
        ) => TResult,
      ): TResult

      getValidateOn(scope: Scope): TParams["validateOn.schema"]
      getValidateOn<TResult>(
        scope: Scope,
        select: (
          concise: TParams["validateOn.schema"],
          verbose: TParams["validateOn.schema.verbose"],
        ) => TResult,
      ): TResult

      setValidateOn(setter: TParams["validateOn.setter"]): void
    }
    ```

  - `ImpulseFormShapeOptions.validateOn`
  - `ImpulseFormValueOptions.validateOn`
  - ```ts
    class ImpulseFormValue {
      onFocusWhenInvalid(
        onFocus: (errors: ReadonlyArray<string>) => void,
      ): VoidFunction
    }
    ```

  Extended:
  - ```diff
    -ImpulseFormValue#setSchema(schema: Schema): void
    +ImpulseFormValue#setSchema(schema: Schema | null): void
    ```

  Breaking changes:
  - use `ImpulseForm#submit`, `ImpulseForm#getSubmitCount`, `ImpulseForm#isSubmitting` instead

    ```diff
    -interface UseImpulseFormResult {
    -  submit(this: void): void
    -  getSubmitCount(this: void, scope: Scope): number
    -  isSubmitting(this: void, scope: Scope): boolean
    -}

    const useImpulseForm = <TForm extends ImpulseForm>(
      form: TForm,
      options?: UseImpulseFormOptions<TForm>,
    -): UseImpulseFormResult
    +): void
    ```

  - use `ImpulseForm#submit`, `ImpulseForm#getSubmitCount`, `ImpulseForm#isSubmitting` instead

    ```diff
    interface UseImpulseFormValueOptions<TForm extends ImpulseForm> extends UseImpulseFormOptions<TForm> {
      /**
      * @default true
      */
      shouldFocusWhenInvalid?: boolean
      onFocusInvalid?:
    +   | null
    +   | undefined
    +   | HTMLElement
        | RefObject<null | undefined | HTMLElement>
        | Func<[errors: ReadonlyArray<string>, form: TForm]>
    }

    const useImpulseFormValue = <TOriginalValue, TValue = TOriginalValue>(
      form: ImpulseFormValue<TOriginalValue, TValue>,
      options?: UseImpulseFormValueOptions<typeof form>,
    -): UseImpulseFormValueResult
    +): void
    ```

## 0.1.2

### Patch Changes

- [#653](https://github.com/owanturist/react-impulse/pull/653) [`04d25d2`](https://github.com/owanturist/react-impulse/commit/04d25d202370407d39aaa98148e1bfb3b3c5ce20) Thanks [@owanturist](https://github.com/owanturist)! - Reset isSubmitting when submit is done

## 0.1.1

### Patch Changes

- [`cb0b7ce`](https://github.com/owanturist/react-impulse/commit/cb0b7ce8411133083bb231933c0adf17bdc2eebd) Thanks [@owanturist](https://github.com/owanturist)! - Reduce file size by marking private, protected and internal methods/fields with `_` prefix, so they are mangled during build.

## 0.1.0

### Minor Changes

- [#632](https://github.com/owanturist/react-impulse/pull/632) [`ed5dd40`](https://github.com/owanturist/react-impulse/commit/ed5dd40fd887546c30b783cf627e63e315bcf5b1) Thanks [@owanturist](https://github.com/owanturist)! - Initial release 🎉
