---
"react-impulse": minor
---

The `useScope` hook has been introduced. It returns a `Scope` instance.

```dart
function useScope(): Scope
```

This hook replaces the removed `scoped` HOC and is especially useful when multiple `Impulse` instances need to read their states within the same scope.

```tsx
import { Impulse, useScope } from "react-impulse"

const Form: React.FC<{
  username: Impulse<string>
  password: Impulse<string>
}> = ({ username, password }) => {
  const scope = useScope()

  return (
    <form>
      <input
        type="text"
        value={username.getValue(scope)}
        onChange={(e) => username.setValue(e.target.value)}
      />
      <input
        type="password"
        value={password.getValue(scope)}
        onChange={(e) => password.setValue(e.target.value)}
      />
    </form>
  )
}
```
