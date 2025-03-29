---
"react-impulse": major
"react-impulse-form": minor
---

Enroll React@19 support:

- Set `peerDependencies.react` to `^19.0.0`.
- Remove `scoped.forwardRef`/`scoped.memo.forwardRef` and `type ForwardedPropsWithoutScope` as React@19 allows passing [ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop).
- Extend `scoped.memo` definition to mirror `React.memo` API:

  ```ts
  function memo<TProps>(
    Component: FC<TProps>,
    propsAreEqual?: (
      prevProps: Readonly<PropsWithoutScope<TProps>>,
      nextProps: Readonly<PropsWithoutScope<TProps>>,
    ) => boolean,
  ): NamedExoticComponent<PropsWithoutScope<TProps>>

  function memo<TComponent extends FC>(
    Component: TComponent,
    propsAreEqual?: (
      prevProps: Readonly<PropsWithoutScope<ComponentProps<TComponent>>>,
      nextProps: Readonly<PropsWithoutScope<ComponentProps<TComponent>>>,
    ) => boolean,
  ): MemoExoticComponent<FC<PropsWithoutScope<ComponentProps<TComponent>>>>
  ```

- Bump `use-sync-external-store` `1.2.2 -> 1.4.0`
