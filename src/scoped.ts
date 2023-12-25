import {
  type FC,
  type ForwardRefRenderFunction,
  type ExoticComponent,
  type MemoExoticComponent,
  type NamedExoticComponent,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  memo as React_memo,
  forwardRef as React_forwardRef,
  type ReactNode,
} from "./dependencies"
import type { Scope } from "./Scope"
import type { Compare, Func } from "./utils"
import { useScope } from "./useScope"

export type PropsWithScope<TProps = Record<string, unknown>> = TProps & {
  scope: Scope
}

export type PropsWithoutScope<TProps> = "scope" extends keyof TProps
  ? Omit<TProps, "scope">
  : TProps

export type ForwardedPropsWithoutScope<TRef, TProps> = RefAttributes<TRef> &
  PropsWithoutRef<PropsWithoutScope<TProps>>

const renderWithScope = <TProps, TContext>(
  scope: Scope,
  component: Func<[PropsWithScope<TProps>, TContext], ReactNode>,
  props: TProps,
  ctx: TContext,
): ReactNode => {
  // it uses Object.assign to reduce output file size by avoiding the spread operator
  return component(Object.assign({}, props, { scope }), ctx)
}

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
  const ComponentWithScope: FC<TProps> = (props, ctx: unknown) => {
    const getScope = useScope()

    return renderWithScope(getScope(), component, props, ctx)
  }

  ComponentWithScope.displayName = `ComponentWithScope${
    component.displayName ?? component.name
  }`

  return ComponentWithScope
}

const memo = <TProps>(
  component: FC<PropsWithScope<TProps>>,
  propsAreEqual?: Compare<Readonly<PropsWithoutScope<TProps>>>,
): MemoExoticComponent<FC<PropsWithoutScope<TProps>>> => {
  return React_memo(scoped(component), propsAreEqual)
}

const forwardRef = <TRef, TProps>(
  render: ForwardRefRenderFunction<TRef, PropsWithScope<TProps>>,
): ForwardRefExoticComponent<ForwardedPropsWithoutScope<TRef, TProps>> => {
  return React_forwardRef<TRef, PropsWithoutScope<TProps>>((props, ref) => {
    const getScope = useScope()

    return renderWithScope(getScope(), render, props as TProps, ref)
  })
}

const forwardRefMemo = <TRef, TProps>(
  render: ForwardRefRenderFunction<TRef, PropsWithScope<TProps>>,
  propsAreEqual?: Compare<Readonly<ForwardedPropsWithoutScope<TRef, TProps>>>,
): MemoExoticComponent<
  NamedExoticComponent<ForwardedPropsWithoutScope<TRef, TProps>>
> => {
  return React_memo(forwardRef(render), propsAreEqual)
}

/**
 * An alias for `React.memo(React.forwardRef(scoped(...)))`
 *
 * @version 1.0.0
 */
memo.forwardRef = forwardRef.memo = forwardRefMemo

/**
 * An alias for `React.memo(scoped(...))`
 *
 * @version 1.0.0
 */
scoped.memo = memo

/**
 * An alias for `React.forwardRef(scoped(...))`
 *
 * @version 1.0.0
 */
scoped.forwardRef = forwardRef
