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
import { useScope } from "./useScope"
import type { Func } from "./utils"

export type PropsWithScope<TProps = Record<string, unknown>> = TProps & {
  scope: Scope
}

export type PropsWithoutScope<TProps> = "scope" extends keyof TProps
  ? Omit<TProps, "scope">
  : TProps

export type ForwardedPropsWithoutScope<TRef, TProps> = RefAttributes<TRef> &
  PropsWithoutRef<PropsWithoutScope<TProps>>

function renderWithScope<
  TProps,
  TContext,
  TResult extends ReactNode | Promise<ReactNode>,
>(
  scope: Scope,
  component: Func<[PropsWithScope<TProps>, unknown?], TResult>,
  props: TProps,
  ctx: TContext,
): TResult {
  // it uses Object.assign to reduce output file size by avoiding the spread operator
  return component(Object.assign({}, props, { scope }), ctx)
}

function useInjectScope<TProps>(props: TProps): PropsWithScope<TProps> {
  const getScope = useScope()

  return Object.assign({}, props, { scope: getScope() })
}

function memo<TProps>(
  component: FC<PropsWithScope<TProps>>,
  propsAreEqual?: (
    prev: Readonly<PropsWithoutScope<TProps>>,
    next: Readonly<PropsWithoutScope<TProps>>,
  ) => boolean,
): MemoExoticComponent<FC<PropsWithoutScope<TProps>>> {
  return React_memo(scoped(component), propsAreEqual)
}

function forwardRef<TRef, TProps>(
  render: ForwardRefRenderFunction<TRef, PropsWithScope<TProps>>,
): ForwardRefExoticComponent<ForwardedPropsWithoutScope<TRef, TProps>> {
  return React_forwardRef<TRef, PropsWithoutScope<TProps>>((props, ref) => {
    const propsWithScope = useInjectScope(props)

    return render(propsWithScope as PropsWithScope<TProps>, ref)
  })
}

function forwardRefMemo<TRef, TProps>(
  render: ForwardRefRenderFunction<TRef, PropsWithScope<TProps>>,
  propsAreEqual?: (
    prev: Readonly<ForwardedPropsWithoutScope<TRef, TProps>>,
    next: Readonly<ForwardedPropsWithoutScope<TRef, TProps>>,
  ) => boolean,
): MemoExoticComponent<
  NamedExoticComponent<ForwardedPropsWithoutScope<TRef, TProps>>
> {
  return React_memo(forwardRef(render), propsAreEqual) as MemoExoticComponent<
    NamedExoticComponent<ForwardedPropsWithoutScope<TRef, TProps>>
  >
}

/**
 * An alias for `React.memo(React.forwardRef(scoped(...)))`
 *
 * @version 1.0.0
 */
memo.forwardRef = forwardRef.memo = forwardRefMemo

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
  const ComponentWithScope = (
    props: TProps,
    ctx?: unknown,
  ): ReactNode | Promise<ReactNode> => {
    const getScope = useScope()

    return renderWithScope(getScope(), component, props, ctx)
  }

  ComponentWithScope.displayName = `ComponentWithScope${
    component.displayName ?? component.name
  }`

  return ComponentWithScope
}

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
