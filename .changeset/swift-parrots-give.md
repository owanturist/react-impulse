---
"react-impulse-form": minor
---

Introduce `type ImpulseFormMeta<T>` for reactive static fields in `ImpulseFormShape`:

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

---

Resolve #923
