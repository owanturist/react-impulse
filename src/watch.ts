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
import { defineExecutionContext } from "./validation"

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
  return defineExecutionContext(
    "watch",
    component,
    Object.assign({}, props, { scope }),
    ctx,
  )
}

/**
 * Creates a React component that subscribes to all Impulses calling the `Impulse#getValue` method during the rendering phase of the component.
 *
 * @param component a watch component
 *
 * @version 1.0.0
 */
export function watch<TProps>(component: ExoticComponent<TProps>): never
export function watch<TProps>(
  component: FC<PropsWithScope<TProps>>,
): FC<PropsWithoutScope<TProps>>
export function watch<TProps>(
  component: FC<PropsWithScope<TProps>>,
): FC<TProps> {
  const ComponentWithScope: FC<TProps> = (props, ctx: unknown) => {
    return renderWithScope(useScope(), component, props, ctx)
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
  return React_memo(watch(component), propsAreEqual)
}

const forwardRefMemo = <TRef, TProps>(
  render: ForwardRefRenderFunction<TRef, PropsWithScope<TProps>>,
  propsAreEqual?: Compare<Readonly<ForwardedPropsWithoutScope<TRef, TProps>>>,
): MemoExoticComponent<
  NamedExoticComponent<ForwardedPropsWithoutScope<TRef, TProps>>
> => {
  return React_memo(forwardRef(render), propsAreEqual)
}

const forwardRef = <TRef, TProps>(
  render: ForwardRefRenderFunction<TRef, PropsWithScope<TProps>>,
): ForwardRefExoticComponent<ForwardedPropsWithoutScope<TRef, TProps>> => {
  return React_forwardRef<TRef, PropsWithoutScope<TProps>>((props, ref) => {
    return renderWithScope(useScope(), render, props as TProps, ref)
  })
}

/**
 * An alias for `React.memo(React.forwardRef(watch(...)))`
 *
 * @version 1.0.0
 */
memo.forwardRef = forwardRef.memo = forwardRefMemo

/**
 * An alias for `React.memo(watch(...))`
 *
 * @version 1.0.0
 */
watch.memo = memo

/**
 * An alias for `React.forwardRef(watch(...))`
 *
 * @version 1.0.0
 */
watch.forwardRef = forwardRef
