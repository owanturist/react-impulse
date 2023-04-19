import {
  FunctionComponent,
  ForwardRefRenderFunction,
  ForwardRefExoticComponent,
  memo as React_memo,
  forwardRef as React_forwardRef,
  PropsWithoutRef,
  RefAttributes,
  NamedExoticComponent,
  ExoticComponent,
} from "react"

import { Compare } from "./utils"
import { Scope } from "./Scope"
import { useScope } from "./useScope"

export type PropsWithScope<TProps = Record<string, unknown>> = TProps & {
  scope: Scope
}

export type PropsWithoutScope<TProps> = "scope" extends keyof TProps
  ? // it shows the resulting type in VSCode better than Omit
    {
      [K in keyof TProps as K extends "scope" ? never : K]: TProps[K]
    }
  : TProps

/**
 * Creates a React component that subscribes to all Impulses calling the `Impulse#getValue` method during the rendering phase of the component.
 *
 * @param component a scoped component
 *
 * @version 1.0.0
 */
export function scoped<TProps>(component: ExoticComponent<TProps>): never
export function scoped<TProps>(
  component: FunctionComponent<PropsWithScope<TProps>>,
): FunctionComponent<PropsWithoutScope<TProps>>
export function scoped<TProps>(
  component: FunctionComponent<TProps>,
): FunctionComponent<TProps> {
  const ComponentWithScope: FunctionComponent<TProps> = (
    props,
    ctx: unknown,
  ) => {
    const getScope = useScope()

    // it uses Object.assign to reduce output file size by avoiding the spread operator
    return component(Object.assign({}, props, { scope: getScope() }), ctx)
  }

  ComponentWithScope.displayName = `ComponentWithScope${
    component.displayName ?? component.name
  }`

  return ComponentWithScope
}

function memo<TProps>(
  component: FunctionComponent<PropsWithScope<TProps>>,
  propsAreEqual?: Compare<Readonly<PropsWithoutScope<TProps>>>,
): NamedExoticComponent<PropsWithoutScope<TProps>> {
  return React_memo(scoped(component), propsAreEqual)
}

function forwardRefMemo<TNode, TProps>(
  render: ForwardRefRenderFunction<TNode, PropsWithScope<TProps>>,
  propsAreEqual?: Compare<Readonly<PropsWithoutScope<TProps>>>,
): NamedExoticComponent<PropsWithoutScope<TProps>> {
  return React_memo(forwardRef(render), propsAreEqual)
}

function forwardRef<TNode, TProps>(
  render: ForwardRefRenderFunction<TNode, PropsWithScope<TProps>>,
): ForwardRefExoticComponent<
  PropsWithoutRef<PropsWithoutScope<TProps>> & RefAttributes<TNode>
> {
  return React_forwardRef(
    scoped(render) as ForwardRefRenderFunction<
      TNode,
      PropsWithoutScope<TProps>
    >,
  )
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
