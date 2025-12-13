# react-impulse

## 3.1.3

### Patch Changes

- [#1008](https://github.com/owanturist/react-impulse/pull/1008) [`f795ba1`](https://github.com/owanturist/react-impulse/commit/f795ba117b13ecbcc047453ef000cb8f82ff094e) Thanks [@owanturist](https://github.com/owanturist)! - Refactor internal source code structure to improve consistency and maintainability:

  - Move implementation details to `_internal` directories to clearly separate public API from internal logic.
  - Update `biome.jsonc` to enforce public API boundaries:
    - Prevent package entry points (`index.ts`) from directly importing from `_internal`.
    - Enable `noUnusedImports` rule with autofix.
  - Remove `dependencies.ts` pattern and allow direct imports of dependencies.

- [#1003](https://github.com/owanturist/react-impulse/pull/1003) [`516f568`](https://github.com/owanturist/react-impulse/commit/516f568e8eba7c2a51ec2b578ff3ec44964b9b52) Thanks [@owanturist](https://github.com/owanturist)! - Extract `ScopeEmitQueue` and `enqueue` function from `scope-emitter.ts` into a dedicated `enqueue.ts` module, and move `ScopeFactory` into its own `scope-factory.ts` file. This reorganization improves code modularity by separating concerns: the queue management logic is isolated from the emitter lifecycle, while the factory gets its own dedicated space. Additionally, simplifies the `ScopeEmitter` constructor by accepting the `_emit` callback directly instead of wrapping it internally, reducing unnecessary closures.

- [#992](https://github.com/owanturist/react-impulse/pull/992) [`1a1c634`](https://github.com/owanturist/react-impulse/commit/1a1c634901c90c2106d8c62b6db23b1514d04d19) Thanks [@owanturist](https://github.com/owanturist)! - Update React dependencies to 19.2.3.

- [#995](https://github.com/owanturist/react-impulse/pull/995) [`1adbd7c`](https://github.com/owanturist/react-impulse/commit/1adbd7c07b74349c49cfb7e463e18813565175e4) Thanks [@owanturist](https://github.com/owanturist)! - Create scope for `useScopedMemo`/`useScopedCallback` the same way as for `useScope`, so those hooks become aliases for:

  ```ts
  const scope = useScope();

  // useScopedMemo is an alias for
  React.useMemo(() => impulse.getValue(scope), [scope]);

  // useScopedCallback is an alias for
  React.useCallback((impulse) => impulse.getValue(scope), [scope]);
  ```

- [#1005](https://github.com/owanturist/react-impulse/pull/1005) [`5d1175f`](https://github.com/owanturist/react-impulse/commit/5d1175f34c5795dab831bc5bad2b21e3c98c0054) Thanks [@owanturist](https://github.com/owanturist)! - Replace prettier and eslint by [biome](http://biomejs.dev/).

- [#1000](https://github.com/owanturist/react-impulse/pull/1000) [`e91b86e`](https://github.com/owanturist/react-impulse/commit/e91b86e608a0d98446dfef49f453714398ce551e) Thanks [@owanturist](https://github.com/owanturist)! - Refactor scope emitter architecture to eliminate version tracking and improve derived impulse synchronization. The new implementation uses a stale flag mechanism in `DerivedImpulse` instead of version comparison, streamlining invalidation logic and reducing overhead. The `ScopeEmitter` now leverages a `ScopeFactory` pattern with lazy scope creation, ensuring that derived impulses maintain consistent state across reads while properly invalidating when dependencies change. Additionally, the `_setter` signature has been simplified to return a boolean flag indicating whether emission is needed, centralizing the queue push logic in `BaseImpulse#setValue`.

  **Internal Changes:**

  - Replaced version tracking (`_version`) with stale flag (`_stale`) in `DerivedImpulse`
  - Introduced `ScopeFactory` class for managing scope creation and emission lifecycle
  - Simplified `_setter` signature to return `void | true` instead of accepting queue parameter
  - Moved `Emitter` class from `react-impulse-form` to shared `tools` package
  - Enhanced `map` utility to accept both arrays and iterables
  - Removed obsolete `uniq` utility in favor of native `Set`

## 3.1.2

### Patch Changes

- [#953](https://github.com/owanturist/react-impulse/pull/953) [`b4ad2ce`](https://github.com/owanturist/react-impulse/commit/b4ad2ce26eab37fdffd4b457d6439fb4a28e3e68) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react from 19.1.10 to 19.1.11

- [#968](https://github.com/owanturist/react-impulse/pull/968) [`f21564d`](https://github.com/owanturist/react-impulse/commit/f21564d9e74af44d13d303e8ff237ec8dd7dc2b0) Thanks [@owanturist](https://github.com/owanturist)! - Utilize a single hook to store `ScopeEmitter` in internal `useCreateScope` hook.

- [#960](https://github.com/owanturist/react-impulse/pull/960) [`d91c757`](https://github.com/owanturist/react-impulse/commit/d91c75747461ff9d83539eb05778193d4cec82da) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react from 19.1.11 to 19.1.12

- [#971](https://github.com/owanturist/react-impulse/pull/971) [`29efba5`](https://github.com/owanturist/react-impulse/commit/29efba5af997fa957f32b8afe209c5c624a23a2b) Thanks [@owanturist](https://github.com/owanturist)! - Fix scheduler so nested emissions are not dropped. The scheduler now clears the global queue before processing, allowing emitters enqueued during emit to be processed reliably. This ensures subscribers (created with `subscribe`, `useScopedEffect`, or other scope factories) run when updates are triggered inside subscriber/derived computations (e.g., during `ImpulseForm.reset()`), addressing issue #969.

## 3.1.1

### Patch Changes

- [#947](https://github.com/owanturist/react-impulse/pull/947) [`a027bbd`](https://github.com/owanturist/react-impulse/commit/a027bbdb7bad18b7b25c2a4c173baaf1d4fb89b0) Thanks [@owanturist](https://github.com/owanturist)! - Bump typescript from 5.8.3 to 5.9.2

- [#947](https://github.com/owanturist/react-impulse/pull/947) [`a027bbd`](https://github.com/owanturist/react-impulse/commit/a027bbdb7bad18b7b25c2a4c173baaf1d4fb89b0) Thanks [@owanturist](https://github.com/owanturist)! - Bump @types/react from 19.1.9 to 19.1.10

## 3.1.0

### Minor Changes

- [#901](https://github.com/owanturist/react-impulse/pull/901) [`b8b8c99`](https://github.com/owanturist/react-impulse/commit/b8b8c9968d6c7395603fc29b34fe62acc27892b0) Thanks [@owanturist](https://github.com/owanturist)! - Extend `Impulse(getter, options?)` by allowing `getter` to be a `ReadableImpulse<T>`:

  ```dart
  Impulse<T>(
    getter: ReadableImpulse<T> | ((scope: Scope) => T),
    options?: ImpulseOptions<T>,
  ): ReadonlyImpulse<T>
  ```

  Resolves [#895](https://github.com/owanturist/react-impulse/issues/895)

## 3.0.3

### Patch Changes

- [#892](https://github.com/owanturist/react-impulse/pull/892) [`9e22f05`](https://github.com/owanturist/react-impulse/commit/9e22f053852f796e25b5fbd4dc6f3c3d8aea5d83) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump terser from 5.40.0 to 5.43.1

- [#896](https://github.com/owanturist/react-impulse/pull/896) [`0ce1c41`](https://github.com/owanturist/react-impulse/commit/0ce1c41424a45f94d31608f6283a74e4b0018a3e) Thanks [@owanturist](https://github.com/owanturist)! - Ensure that the `DerivedImpulse` updates its value when `batch`ing. Resolves [#893](https://github.com/owanturist/react-impulse/issues/893).

- [#898](https://github.com/owanturist/react-impulse/pull/898) [`b81e684`](https://github.com/owanturist/react-impulse/commit/b81e6844562601f5f052fc6b59df17448808d524) Thanks [@owanturist](https://github.com/owanturist)! - Minify class and function names in production builds.

## 3.0.2

### Patch Changes

- [#868](https://github.com/owanturist/react-impulse/pull/868) [`d48327e`](https://github.com/owanturist/react-impulse/commit/d48327e6ed48aa060f8c0ea80821a24555b83baf) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react from 19.1.5 to 19.1.6

## 3.0.1

### Patch Changes

- [#850](https://github.com/owanturist/react-impulse/pull/850) [`5100c67`](https://github.com/owanturist/react-impulse/commit/5100c679fa631a4d136a7ad0cd68869a96520e90) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react from 19.1.3 to 19.1.5

- [#861](https://github.com/owanturist/react-impulse/pull/861) [`7c8cf05`](https://github.com/owanturist/react-impulse/commit/7c8cf054425c53ecba205044fa8c2f4eecd6658c) Thanks [@owanturist](https://github.com/owanturist)! - Replace `BaseImpulse#clone` return type from `DirectImpulse` to `Impulse`.

  #### Rationale

  The `DirectImpulse` does not add any additional functionality to `Impulse` when it extends `BaseImpulse`, so it is more appropriate to return the base type `Impulse` instead of the derived type `DirectImpulse`. This change improves type consistency and reduces confusion for users of the library.

- [#861](https://github.com/owanturist/react-impulse/pull/861) [`7c8cf05`](https://github.com/owanturist/react-impulse/commit/7c8cf054425c53ecba205044fa8c2f4eecd6658c) Thanks [@owanturist](https://github.com/owanturist)! - Reorganize the internal source code structure of the `react-impulse` and `react-impulse-form` packages to improve consistency across the file and folder structure. Split the set of common tools to reuse them in both packages without introducing a common npm package.

## 3.0.0

### Major Changes

- [#846](https://github.com/owanturist/react-impulse/pull/846) [`03f4967`](https://github.com/owanturist/react-impulse/commit/03f49673a262ec42ed165914c38f75a0a62af07e) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  - The `Impulse.of` static method was removed and replaced with the `Impulse` function providing the same signature.
  - The `Impulse.isImpulse` static method was removed and replaced with the `isImpulse` function providing the same signature.

  #### Rationale

  The changes aim to simplify and modernize the API of `react-impulse` while improving its usability and consistency:

  - **Removal of `Impulse.of`**: By replacing the static `Impulse.of` method with the `Impulse` function, the API becomes more intuitive. This change also reduces redundancy, as the `Impulse` function now serves as the sole entry point for creating impulses and defining types.
  - **Standalone `isImpulse` function**: Moving `isImpulse` from a static method to a standalone function makes it possible to tree shake when unused.

  These changes collectively enhance the developer experience, reduce cognitive load, and make the library easier to learn and use.

  #### Migration Guide

  - Replace `Impulse.of()` calls with `Impulse()`:

    - **Creating an impulse without an initial value**:

      ```ts
      // Before
      const empty = Impulse.of();

      // After
      const empty = Impulse();
      ```

    - **Creating an impulse with an initial value**:

      ```ts
      // Before
      const count = Impulse.of(0);

      // After
      const count = Impulse(0);
      ```

    - **Creating a derived impulse**:

      ```ts
      // Before
      const writable = Impulse.of(
        (scope) => count.getValue(scope),
        (value, scope) => count.setValue(value, scope)
      );

      // After
      const writable = Impulse(
        (scope) => count.getValue(scope),
        (value, scope) => count.setValue(value, scope)
      );
      ```

  - Replace `Impulse.isImpulse` calls with `isImpulse`:

    ```ts
    // Before
    if (Impulse.isImpulse(something)) {
      // ...
    }

    // After
    import { isImpulse } from "react-impulse";

    if (isImpulse(something)) {
      // ...
    }
    ```

- [#820](https://github.com/owanturist/react-impulse/pull/820) [`5962016`](https://github.com/owanturist/react-impulse/commit/5962016ca4e9b9529f4d99d4c1b0a18950e5f3e6) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  The `Impulse.transmit` method has been merged into the `Impulse` function. The `TransmittingImpulseOptions` type has been removed.

  #### Rationale

  This change simplifies the API by consolidating related functionality into a single function, making the library more intuitive with fewer entry points to learn. It also aligns with established reactive programming patterns by using the widely recognized "derived" terminology instead of "transmit".

  #### Functional Equivalence

  This change is purely syntactic - all functionality previously available with `Impulse.transmit` remains fully supported through `Impulse` with identical behavior. Your derived impulses will continue to work exactly as before with the new API.

  #### Migration Guide

  - For `Impulse.transmit(getter, [setter])`, replace with `Impulse(getter, [setter])`:

    ```ts
    const source = Impulse(1);

    // Before
    const derived = Impulse.transmit(
      (scope) => ({ count: source.getValue(scope) }),
      (next) => source.setValue(next.count)
    );

    // After
    const derived = Impulse(
      (scope) => ({ count: source.getValue(scope) }),
      (next) => source.setValue(next.count)
    );
    ```

  - For `Impulse(Function, [options])`, wrap the `Function` in an object:

    ```ts
    // Before
    const sorting = Impulse((left: number, right: number) => left - right);

    // After
    const sorting = Impulse({
      fn: (scope) => (left: number, right: number) => left - right,
    });
    ```

  - For `TransmittingImpulseOptions` replace with `ImpulseOptions`.

- [#807](https://github.com/owanturist/react-impulse/pull/807) [`db602c7`](https://github.com/owanturist/react-impulse/commit/db602c7c9601b9a261cfaa1006a57f2a8f61aa68) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  The `useImpulse` hook has been removed. Replace it with `useState`, `useRef`, or another permanent storage of your choice.

  #### Rationale

  Removing this hook simplifies the API by encouraging direct use of standard React hooks with `Impulse()` factory. This approach provides more explicit control over when Impulses are created and how they're stored in your components, leading to more predictable behavior across renders and better integration with other React patterns.

  #### Migration Guide

  - Replace `useImpulse` with `useState` or `useRef`:

    ```tsx
    // Before
    const impulse = useImpulse(0);

    // After with useState
    const [impulse] = useState(() => Impulse(0));

    // After with useRef
    const impulseRef = useRef(Impulse(0));
    ```

- [#813](https://github.com/owanturist/react-impulse/pull/813) [`0983fb0`](https://github.com/owanturist/react-impulse/commit/0983fb04e4dc99f382c46abca597a8687d491940) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  - Added support for React 19
  - Dropped support for React 16 and React 17
  - Updated minimum peer dependency to React 18.0.0

- [#807](https://github.com/owanturist/react-impulse/pull/807) [`db602c7`](https://github.com/owanturist/react-impulse/commit/db602c7c9601b9a261cfaa1006a57f2a8f61aa68) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  The `useTransmittingImpulse` hook has been removed.

  #### Rationale

  Removing this specialized hook simplifies the API surface while making state management patterns more explicit. Instead of a single hook with multiple behaviors, the library now encourages composing standard React hooks with Impulse primitives, resulting in more predictable and maintainable code.

  #### Functional Equivalence

  All functionality previously provided by `useTransmittingImpulse` can be achieved through the composition of `Impulse()`, `useEffect`, and `useScopedEffect`. These replacements give you more precise control over dependency tracking and rendering optimization.

  #### Migration Guide

  - For immutable dependencies (not Impulses), replace with `Impulse(value)` + effects:

    ```ts
    // Before
    const impulse = useTransmittingImpulse(
      (query) => ({ query }),
      [query],
      (params) => setRouterParams(params)
    );

    // After
    const impulse = Impulse({ query }); // Create Impulse with initial value

    // Update Impulse when dependencies change
    useEffect(() => impulse.setValue({ query }), [impulse, query]);

    // Apply changes from Impulse to external state
    useScopedEffect(
      (scope) => setRouterParams(impulse.getValue(scope)),
      [impulse, setRouterParams]
    );
    ```

  - For mutable dependencies (other Impulses), replace with `Impulse(getter, [setter])`:

    ```ts
    // Before
    const impulse = useTransmittingImpulse(
      (scope) => ({ count: count.getValue(scope) }),
      [count],
      (next) => count.setValue(next.count)
    );

    // After
    const counter = useMemo(() => {
      return Impulse(
        (scope) => ({ count: count.getValue(scope) }), // Derived getter
        (next) => count.setValue(next.count) // Optional setter
      );
    }, [count]);
    ```

- [#805](https://github.com/owanturist/react-impulse/pull/805) [`4f4a632`](https://github.com/owanturist/react-impulse/commit/4f4a6320d676761a8e68da0b54c50aaf53adb5e1) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  The `Impulse#getValue` no longer supports the selector function as a second parameter. This change simplifies the API and makes behavior more predictable by ensuring that value transformations are explicit in your code rather than hidden in selector callbacks, which leads to more readable and maintainable code.

  #### Rationale

  Simplifying `getValue` to have a single responsibility—retrieving the current value without transformation—makes the library more focused and easier to learn.

  #### Migration Guide

  ```ts
  // Before
  const count = Impulse(0);
  const doubled = count.getValue(scope, (value) => value * 2);

  // After
  const count = Impulse(0);
  const doubled = count.getValue(scope) * 2;
  ```

  Apply transformations directly to the returned value instead of passing a selector function. This pattern works consistently across all code paths, including conditional logic and complex transformations.

  #### Edge Cases

  If you've been chaining multiple transformations in the selector function, you'll need to extract that logic:

  ```ts
  // Before
  const formatted = data.getValue(scope, (value) =>
    value ? formatValue(value).toUpperCase() : "N/A"
  );

  // After
  const value = data.getValue(scope);
  const formatted = value ? formatValue(value).toUpperCase() : "N/A";
  ```

- [#807](https://github.com/owanturist/react-impulse/pull/807) [`db602c7`](https://github.com/owanturist/react-impulse/commit/db602c7c9601b9a261cfaa1006a57f2a8f61aa68) Thanks [@owanturist](https://github.com/owanturist)! - **BREAKING CHANGES**

  The `scoped` API has been removed and replaced with the new `useScope()` hook. The `PropsWithScope`, `PropsWithoutScope`, and `ForwardedPropsWithoutScope` types have been removed as well.

  #### Rationale

  Replacing the `scoped` HOC with hooks offers several advantages:

  1. **Simplified API**: Direct hook usage creates a flatter, more intuitive API compared to higher-order components.
  2. **Better TypeScript integration**: Hooks provide cleaner type inference than HOCs, eliminating the need for special prop types.

  #### Functional Equivalence

  All functionality previously provided by the `scoped` HOC can be achieved through the `useScope()` and `useScoped()` hooks, giving you more direct control over scope handling.

  #### Migration Guide

  - Replace `scoped` with `useScope()` or `useScoped()`:

    ```tsx
    // Before
    const Counter = scoped(({ scope, count }) => (
      <div>{count.getValue(scope)}</div>
    ));

    // After (using useScope)
    const Counter = ({ count }) => {
      const scope = useScope();
      return <div>{count.getValue(scope)}</div>;
    };

    // OR (using useScoped)
    const Counter = ({ count }) => {
      const value = useScoped(count);
      return <div>{value}</div>;
    };
    ```

  - Replace `scoped.memo` with `useScope()` + `React.memo`:

    ```tsx
    // Before
    const MemoizedCounter = scoped.memo(({ scope, count }) => (
      <div>{count.getValue(scope)}</div>
    ));

    // After
    const Counter = ({ count }) => {
      const scope = useScope();
      return <div>{count.getValue(scope)}</div>;
    };
    const MemoizedCounter = React.memo(Counter);
    ```

  - Replace `scoped.forwardRef` with `useScope()` + `React.forwardRef`:

    ```tsx
    // Before
    const ForwardedInput = scoped.forwardRef(({ scope, value }, ref) => (
      <input ref={ref} value={value.getValue(scope)} />
    ));

    // After
    const ForwardedInput = React.forwardRef(({ value }, ref) => {
      const scope = useScope();
      return <input ref={ref} value={value.getValue(scope)} />;
    });
    ```

### Minor Changes

- [#840](https://github.com/owanturist/react-impulse/pull/840) [`c5542d7`](https://github.com/owanturist/react-impulse/commit/c5542d733a65c5b2f69a9e08e052664150cd57ae) Thanks [@owanturist](https://github.com/owanturist)! - Introduce the `isDerivedImpulse` function with the same signature as `isImpulse`:

  ```dart
  isDerivedImpulse<T, Unknown = unknown>(
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>

  isDerivedImpulse<T, Unknown = unknown>(
    scope: Scope,
    check: (value: unknown) => value is T,
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>
  ```

  A function that checks whether the `input` is a `DerivedImpulse` instance. If the `check` function is provided, it checks the Impulse's value to match the `check` function.

- [#807](https://github.com/owanturist/react-impulse/pull/807) [`db602c7`](https://github.com/owanturist/react-impulse/commit/db602c7c9601b9a261cfaa1006a57f2a8f61aa68) Thanks [@owanturist](https://github.com/owanturist)! - The `useScope` hook has been introduced. It returns a `Scope` instance.

  ```dart
  function useScope(): Scope
  ```

  This hook replaces the removed `scoped` HOC and is especially useful when multiple `Impulse` instances need to read their states within the same scope.

  ```tsx
  import { Impulse, useScope } from "react-impulse";

  const Form: React.FC<{
    username: Impulse<string>;
    password: Impulse<string>;
  }> = ({ username, password }) => {
    const scope = useScope();

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
    );
  };
  ```

- [#805](https://github.com/owanturist/react-impulse/pull/805) [`4f4a632`](https://github.com/owanturist/react-impulse/commit/4f4a6320d676761a8e68da0b54c50aaf53adb5e1) Thanks [@owanturist](https://github.com/owanturist)! - Added `ReadableImpulse` and `WritableImpulse` Interfaces.

  ```ts
  interface ReadableImpulse<T> {
    getValue(scope: Scope): T;
  }

  interface WritableImpulse<T> {
    setValue(value: T): void;
  }
  ```

  These interfaces allow more flexible usage patterns and third-party integrations. The following APIs now accept anything that implements these interfaces, not just Impulse instances:

  - ```dart
    function useScoped<TValue>(impulse: ReadableImpulse<TValue>): TValue
    ```
  - ```dart
    Impulse<T>(
      getter: ReadonlyImpulse<T> | ((scope: Scope) => T),
      setter: WritableImpulse<T> | ((value: T, scope: Scope) => void),
      options?: ImpulseOptions<T>,
    ): Impulse<T>
    ```
  - ```dart
    function untrack<TValue>(impulse: ReadableImpulse<TValue>): TValue
    ```

  This change is backward compatible with all existing code while allowing for custom implementations of these interfaces.

### Patch Changes

- [#811](https://github.com/owanturist/react-impulse/pull/811) [`a7d9c1c`](https://github.com/owanturist/react-impulse/commit/a7d9c1c1c150e8092696795881bfde4b410afae9) Thanks [@owanturist](https://github.com/owanturist)! - Update tsconfig.target from `es2017` to `ES2020`.

- [#810](https://github.com/owanturist/react-impulse/pull/810) [`f63f447`](https://github.com/owanturist/react-impulse/commit/f63f4474652bb3d2f8cf1522488893af53d78f2e) Thanks [@owanturist](https://github.com/owanturist)! - Simplified the internal `usePermanent` and `useHandler` hooks by utilizing `useRef` for better performance and reduced complexity.

- [#823](https://github.com/owanturist/react-impulse/pull/823) [`6d08932`](https://github.com/owanturist/react-impulse/commit/6d0893280c65874cd99e32813768ce846030a479) Thanks [@owanturist](https://github.com/owanturist)! - Improved memory management and performance by introducing `WeakRef` for better garbage collection. Additionally, derived impulses now maintain an internal state and only update it when a dependency value changes. This ensures that calling `getValue(scope)` returns the same value unless a dependency of the derived impulse changes.

  #### Code Example

  Before:

  ```ts
  const source = Impulse(0);
  const derived = Impulse((scope) => ({
    count: source.getValue(scope),
  }));

  const value1 = derived.getValue(scope); // { count: 0 }
  const value2 = derived.getValue(scope); // { count: 0 }
  console.log(value1 === value2); // false

  source.setValue(scope, 1);
  const value3 = derived.getValue(scope); // { count: 1 }

  console.log(value2 === value3); // false
  ```

  After:

  ```ts
  const source = Impulse(0);
  const derived = Impulse((scope) => ({
    count: source.getValue(scope),
  }));

  const value1 = derived.getValue(scope); // { count: 0 }
  const value2 = derived.getValue(scope); // { count: 0 }
  console.log(value1 === value2); // true

  source.setValue(scope, 1);
  const value3 = derived.getValue(scope); // { count: 1 }
  console.log(value2 === value3); // false
  ```

- [#809](https://github.com/owanturist/react-impulse/pull/809) [`6d1e4a3`](https://github.com/owanturist/react-impulse/commit/6d1e4a3b6be16e242aa10a7c758ade8c900dca27) Thanks [@owanturist](https://github.com/owanturist)! - Removed the internal `DerivedImpulse._replaceGetter` and `Impulse._emit` methods, which was previously used for internal implementation details of derived impulses.

  This removal has no impact on the public API or existing usage of `Impulse(getter, [setter])`.

## 2.1.1

### Patch Changes

- [#790](https://github.com/owanturist/react-impulse/pull/790) [`167bb77`](https://github.com/owanturist/react-impulse/commit/167bb7760211d1a5966a3f730f534beba78c0e77) Thanks [@owanturist](https://github.com/owanturist)! - Drop custom `manglePlugin` in favor of `terser` default mangling.

- [#798](https://github.com/owanturist/react-impulse/pull/798) [`846f22b`](https://github.com/owanturist/react-impulse/commit/846f22bc965bfcd1134678e06ef244e0c72bb7dc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump use-sync-external-store from 1.4.0 to 1.5.0

## 2.1.0

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

## 2.0.4

### Patch Changes

- [#764](https://github.com/owanturist/react-impulse/pull/764) [`cf0d1d0`](https://github.com/owanturist/react-impulse/commit/cf0d1d0f7d2026a6a7cdee4bff6e0be7a0b26b9f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump rollup from 4.21.2 to 4.22.4

## 2.0.3

### Patch Changes

- [#743](https://github.com/owanturist/react-impulse/pull/743) [`bdbe810`](https://github.com/owanturist/react-impulse/commit/bdbe810e84bddcb4176d1235cd31e45a449b2041) Thanks [@owanturist](https://github.com/owanturist)! - Update dependencies.

## 2.0.2

### Patch Changes

- [#633](https://github.com/owanturist/react-impulse/pull/633) [`bb4dcfa`](https://github.com/owanturist/react-impulse/commit/bb4dcfa0a49de5d1c9407f008ba0d3ae166dbddc) Thanks [@owanturist](https://github.com/owanturist)! - Change import `use-sync-external-store/shim/with-selector` to `use-sync-external-store/shim/with-selector.js`.

## 2.0.1

### Patch Changes

- a1577a1: The `TransmittingImpulse#setValue` method always emits changes to enforce the transmitting value update for cases when the value is not reactive (ex. `localStorage`, global values, etc). Resolves #627.
- 93f698b: Assign a compare function to a stable ref during the initial render so that Impulses created via `useImpulse` and `useTransmittingImpulse` can use `getValue()` and `setValue()` during initial render. Resolves #624.

## 2.0.0

### Major Changes

- d2bf7d0: The `Scope` became an explicit argument for all methods, hooks and functions that read or potentially read an Impulse value. To reflect this change, the following renames were made:

  - `useImpulseCallback` -> `useScopedCallback`
    ```ts
    function useScopedCallback<TArgs extends ReadonlyArray<unknown>, TResult>(
      callback: (scope: Scope, ...args: TArgs) => TResult,
      dependencies: DependencyList
    ): (...args: TArgs) => TResult;
    ```
  - `useImpulseMemo` -> `useScopedMemo`
    ```ts
    function useScopedMemo<TResult>(
      factory: (scope: Scope) => TResult,
      dependencies: DependencyList
    ): TResult;
    ```
  - `useImpulseEffect` -> `useScopedEffect`
    ```ts
    function useScopedEffect(
      effect: (scope: Scope) => Destructor,
      dependencies?: DependencyList
    ): void;
    ```
  - `useImpulseLayoutEffect` -> `useScopedLayoutEffect`
    ```ts
    function useScopedLayoutEffect(
      effect: (scope: Scope) => Destructor,
      dependencies?: DependencyList
    ): void;
    ```
  - `useWatchImpulse` -> `useScoped`
    ```ts
    function useScoped<TValue>(impulse: ReadonlyImpulse<TValue>): TValue;
    function useScoped<TResult>(
      factory: (scope: Scope) => TResult,
      dependencies?: DependencyList,
      options?: UseScopedOptions<TResult>
    ): TResult;
    ```
  - `watch` -> `scoped`
    ```ts
    export function scoped<TProps>(
      component: FC<PropsWithScope<TProps>>
    ): FC<PropsWithoutScope<TProps>>;
    ```

- d6fb9b0: Introduce optional dependencies argument for `useScoped`:

  ```dart
  function useScoped<T>(
    factory: () => T,
    dependencies?: DependencyList,
    options?: UseScopedOptions<T>
  ): T
  ```

  It works the same way as `useEffect` dependencies argument - if the dependencies are not defined, the `factory` will be called on every render. Otherwise, it will be called only when the dependencies change.

  ```ts
  const impulse = useImpulse(0);

  // before
  const count = useScoped(
    useCallback(
      (scope) => {
        return impulse.getValue(scope);
      },
      [impulse]
    )
  );

  // now
  const count = useScoped(
    (scope) => {
      return impulse.getValue(scope);
    },
    [impulse]
  );
  ```

- 232d0c1: Introduce [`ImpulseOptions`](./#impulseoptions) and [`UseScopedOptions`](./useScopedoptions) as a replacement for raw `compare` argument:

  ```ts
  // before
  const impulse_1 = Impulse.of({ count: 0 }, shallowEqual);
  const impulse_2 = impulse_1.clone((x) => x, shallowEqual);
  const impulse_3 = useImpulse({ count: 0 }, shallowEqual);
  const value = useScoped((scope) => impulse_2.getValue(scope), shallowEqual);

  // now
  const impulse_1 = Impulse.of({ count: 0 }, { compare: shallowEqual });
  const impulse_2 = impulse_1.clone((x) => x, { compare: shallowEqual });
  const impulse_3 = useImpulse({ count: 0 }, { compare: shallowEqual });
  const value = useScoped((scope) => impulse_2.getValue(scope), {
    compare: shallowEqual,
  });
  ```

  The overall functionality is the same, but now it opens up a possibility to add more options in the future and helps TypeScript to distinguish options from other arguments (it was a problem with `compare` and other function arguments).

- 77fd6e2: Introduce the `untrack` function.

  ```dart
  function untrack<TResult>(factory: (scope: Scope) => TResult): TResult
  function untrack<TValue>(impulse: ReadonlyImpulse<TValue>): TValue
  ```

  The `untrack` function is a helper to read Impulses' values without reactivity. It provides a [`Scope`][scope] to the `factory` function and returns the result of the function. Acts as [`batch`][batch].

- fa8141d: Drop the `compare` argument from `Impulse#setValue`.

  Turns out that that in practice that argument is hardly ever used, but it makes the Impulse API confusing: why specifically `compare` is passed to `setValue` and not to `Impulse#of` or `useImpulse`?
  So, when needed, define `compare` in [`Impulse.of(initialValue, {compare})`](./#impulseof) factory or [`useImpulse(initialValue, {compare})`](./#useimpulse) hook.

- a9eac62: Drop `Impulse#subscribe` method in favor of [`subscribe`](./#subscribe) higher-order function.

  ```diff
  -const unsubscribe = impulse.subscribe(() => {
  +const unsubscribe = subscribe((scope) => {
    console.log(impulse.getValue(scope));
  });
  ```

- a594ca9: Make the `Impulse#compare` property protected.

  Turns out that that in practice that property is hardly ever used, so now and it becomes protected.
  But you still can specify `Impulse#compare` via [`Impulse.of(initialValue, {compare})`](./#impulseof) factory or [`useImpulse(initialValue, {compare})`](./#useimpulse) hook.

- 6157abf: Drop `useImpulseValue` hook.

  The hook was hardly ever used and in all cases it is more natural to use `useScoped` instead.

  ```diff
  -const value = useImpulseValue(impulse);
  +const value = useScoped(impulse);
  +// or
  +const value = useScoped((scope) => impulse.getValue(scope));
  +// or
  +const value = useScoped((scope) => impulse.getValue(scope), [impulse]);
  ```

### Minor Changes

- 94da9b6: Extends `useScoped` hook API with a shortcut for reading an `Impulse` value:

  ```ts
  function useScoped<TValue>(impulse: ReadonlyImpulse<TValue>): TValue;
  ```

  So now you it takes less code to read an `Impulse` value:

  ```diff
  -const value_1 = useScoped((scope) => impulse.getValue(scope));
  +const value_1 = useImpulseValue(impulse);
  -const value_2 = useScoped((scope) => impulse.getValue(scope), [impulse]);
  +const value_2 = useImpulseValue(impulse);
  ```

- c40ed76: The `subscribe` listener can return a cleanup function to be called for subsequent listeners calls.

  ```ts
  function subscribe<T>(
    impulse: Impulse<T>,
    listener: (value: T) => void | VoidFunction
  ): void;
  ```

- 4095b1a: Introduce [`useScopedCallback`](./#usescopedcallback).
  The hook is an enchanted [`React.useCallback`][react__use_callback] hook.

  ```dart
  function useScopedCallback<TArgs extends ReadonlyArray<unknown>, TResult>(
    callback: (scope: Scope, ...args: TArgs) => TResult,
    dependencies: DependencyList,
  ): (...args: TArgs) => TResult
  ```

  - `callback` is a function to memoize, the memoized function injects [`Scope`][scope] as the first argument and updates whenever any of the `dependencies` values change.
  - `dependencies` is an array of values used in the `callback` function.

- 1280481: Add the [`Impulse#clone`](./#impulseclone) method's overload to accept `options: ImpulseOptions` as a single argument, so the resulting signature looks like the following:

  ```dart
  Impulse<T>#clone(
    options?: ImpulseOptions<T>,
  ): Impulse<T>

  Impulse<T>#clone(
    transform?: (value: T) => T,
    options?: ImpulseOptions<T>,
  ): Impulse<T>
  ```

- d45e64a: Pass the `Scope` as 3rd argument to `Compare` function. Useful if it needs to compare values from impulses.

  ```ts
  type Compare<T> = (left: T, right: T, scope: Scope) => boolean;
  ```

- 6e39e72: The `useScopedEffect` and `useScopedLayoutEffect` hooks do not enqueue a host component re-render when only scoped Impulses' values change.

  ```ts
  const count = useImpulse(1);

  useScopedEffect(
    (scope) => {
      console.log(count.getVAlue(scope));
    },
    [count]
  );
  ```

  The effect above depends only on the `count` Impulse. The `useScopedEffect` hook used to trigger the host component's rerender, but now on `count.setValue(2)` the effect runs, and the host component does not re-render.

- 919f387: Introduce transmitting Impulse.

  - `Impulse.transmit` static method that creates a new transmitting Impulse. A transmitting Impulse is an Impulse that does not have its own value but reads it from an external source and writes it back to the source when the value changes. An external source is usually another Impulse or other Impulses.

    ```dart
    Impulse.transmit<T>(
      getter: (scope: Scope) => T,
      options?: TransmittingImpulseOptions<T>,
    ): ReadonlyImpulse<T>

    Impulse.transmit<T>(
      getter: ReadonlyImpulse<T> | ((scope: Scope) => T),
      setter: Impulse<T> | ((value: T, scope: Scope) => void),
      options?: TransmittingImpulseOptions<T>,
    ): Impulse<T>
    ```

    - `getter` is either a source impulse or a function to read the transmitting value from a source.
    - `[setter]` either a destination impulse or is an optional function to write the transmitting value back to the source. When not defined, the Impulse is readonly.
    - `[options]` is an optional `TransmittingImpulseOptions` object.
      - `[options.compare]` when not defined or `null` then `Object.is` applies as a fallback.

  - `useTransmittingImpulse` react that initialize a stable (never changing) transmitting Impulse. Look at the `Impulse.transmit` method for more details and examples.

    ```dart
    function useTransmittingImpulse<T>(
      getter: (scope: Scope) => T,
      dependencies: DependencyList,
      options?: TransmittingImpulseOptions<T>,
    ): ReadonlyImpulse<T>

    function useTransmittingImpulse<T>(
      getter: ReadonlyImpulse<T> | ((scope: Scope) => T),
      dependencies: DependencyList,
      setter: Impulse<T> | ((value: T, scope: Scope) => void),
      options?: TransmittingImpulseOptions<T>,
    ): Impulse<T>
    ```

    - `getter` is either a source impulse or a function to read the transmitting value from a source.
    - `dependencies` an array of values triggering the re-read of the transmitting value.
    - `[setter]` either a destination impulse or is an optional function to write the transmitting value back to the source. When not defined, the Impulse is readonly.
    - `[options]` is an optional `TransmittingImpulseOptions` object.
      - `[options.compare]` when not defined or `null` then `Object.is` applies as a fallback.

  - `type ReadonlyImpulse`

    A type alias for `Impulse` that does not have the `Impulse#setValue` method. It might be handy to store some value inside an Impulse, so the value change trigger a host component re-render only if the component reads the value from the Impulse.

- 5955868: Introduce `Impulse.isImpulse` static method to check if a given object is an impulse.

  ```dart
  Impulse.isImpulse<T, Unknown = unknown>(
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>

  Impulse.isImpulse<T, Unknown = unknown>(
    scope: Scope,
    check: (value: unknown) => value is T,
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>
  ```

## 1.2.3

### Patch Changes

- f3c82b4: Re-export all dependencies from a single file so the imported packages appear only ones in the bundle. By doing so we can reduce the bundle size by ~2%.
- 5331541: Introduce an implicit `Scope` injection by replacing internal `WatchContext` and `SetValueContext` with `ScopeEmitter`. It drastically simplifies the internal API and makes it possible for further improvements (eg: [#378](https://github.com/owanturist/react-impulse/issues/378)).
- ad9e7bf: Mangle all private and internal methods and properties. It reduces the bundle size by ~5%
- e87970f: Update all dev dependencies

## 1.2.2

### Patch Changes

- cdf0483: Bump version to attach the latest tag

## 1.2.1

### Patch Changes

- 83e0960: 🐛 bugfix: build the source code before publishing. It runs `pnpm run publish` instead of `pnpm publish` so it runs the custom script, that builds the package first and then uses `changesets publish`.

## 1.2.0

### Minor Changes

- 18d3fa2: 🚀 feat: extends `Impulse.of` and `useImpulse` signature with an optional value type, the same way as `useState` does.

  ```ts
  const count = Impulse.of(0); // Impulse<number>
  const optionalCount = Impulse.of<number>(); // Impulse<number | undefined>

  // same for useImpulse
  const count = useImpulse(0); // number
  const optionalCount = useImpulse<number>(); // number | undefined
  ```

  before the changes you had to provide both the optional value initial (`undefined`) value and type explicitly:

  ```ts
  const optionalCount = Impulse.of<number | undefined>(undefined); // Impulse<number | undefined>
  ```

## 1.1.1

### Patch Changes

- dcb8309: 🐛 bugfix: an `Impulse` created via `useImpulse` uses latest `compare` function provided to `useImpulse` but not only the initial one.

## 1.1.0

### Minor Changes

- ea515ee: Introduce HOF `subscribe`.

  ```dart
  function subscribe(listener: VoidFunction): VoidFunction
  ```

  It subscribes to changes of all `Impulse` instances that call the `Impulse#getValue` method inside the `listener`. Returns a cleanup function that unsubscribes the `listener`. The `listener` calls first time synchronously when `subscribe` is called.

  Might be used for subscribing to changes of multiple Impulses at once.
