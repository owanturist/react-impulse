---
"react-impulse-form": minor
---

**BREAKING CHANGES**

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
