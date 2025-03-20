import {
  type FC,
  type ExoticComponent,
  type MemoExoticComponent,
  type NamedExoticComponent,
  type ComponentProps,
  memo as React_memo,
} from "./dependencies"
import type { Scope } from "./Scope"
import { useScope } from "./useScope"

export type PropsWithScope<TProps = Record<string, unknown>> = TProps & {
  scope: Scope
}

export type PropsWithoutScope<TProps> = "scope" extends keyof TProps
  ? Omit<TProps, "scope">
  : TProps

/**
 * Creates a React component that provides the `scope: Scope` property and subscribes to all Impulses calling the `Impulse#getValue` method during the rendering phase of the component.
 *
 * @param component a scoped component
 *
 * @version 1.0.0
 */
export function scoped<TProps>(component: ExoticComponent<TProps>): never
export function scoped<TProps>(
  component: FC<PropsWithScope<TProps>>,
): FC<PropsWithoutScope<TProps>>
export function scoped<TProps>(component: FC<TProps>): FC<TProps> {
  const ComponentWithScope: FC<TProps> = (props) => {
    const getScope = useScope()
    const propsWithScope = Object.assign({}, props, { scope: getScope() })

    return component(propsWithScope)
  }

  ComponentWithScope.displayName = `Scoped${
    component.displayName ?? component.name
  }`

  return ComponentWithScope
}

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

function memo<TProps>(
  component: FC<PropsWithScope<TProps>>,
  propsAreEqual?: (
    prev: Readonly<PropsWithoutScope<TProps>>,
    next: Readonly<PropsWithoutScope<TProps>>,
  ) => boolean,
): MemoExoticComponent<FC<PropsWithoutScope<TProps>>> {
  return React_memo(scoped(component), propsAreEqual)
}

/**
 * An alias for `React.memo(scoped(...))`
 *
 * @version 1.0.0
 */
scoped.memo = memo
