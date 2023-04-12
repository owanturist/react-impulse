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
 * @param component a watched component
 *
 * @version 1.0.0
 */
export function watch<TProps>(component: ExoticComponent<TProps>): never
export function watch<TProps>(
  component: FunctionComponent<PropsWithScope<TProps>>,
): FunctionComponent<PropsWithoutScope<TProps>>
export function watch<TProps>(
  component: FunctionComponent<TProps>,
): FunctionComponent<TProps> {
  const ImpulseWatcher: FunctionComponent<TProps> = (props, ctx: unknown) => {
    const getScope = useScope()

    // it uses Object.assign to reduce output file size by avoiding the spread operator
    return component(Object.assign({}, props, { scope: getScope() }), ctx)
  }

  ImpulseWatcher.displayName = `ImpulseWatcher${
    component.displayName ?? component.name
  }`

  return ImpulseWatcher
}

const memo = <TProps>(
  component: FunctionComponent<PropsWithScope<TProps>>,
  propsAreEqual?: Compare<Readonly<PropsWithoutScope<TProps>>>,
): NamedExoticComponent<PropsWithoutScope<TProps>> => {
  return React_memo(watch(component), propsAreEqual)
}

const forwardRefMemo = <TNode, TProps>(
  render: ForwardRefRenderFunction<TNode, PropsWithScope<TProps>>,
  propsAreEqual?: Compare<Readonly<PropsWithoutScope<TProps>>>,
): NamedExoticComponent<PropsWithoutScope<TProps>> => {
  return React_memo(forwardRef(render), propsAreEqual)
}

const forwardRef = <TNode, TProps>(
  render: ForwardRefRenderFunction<TNode, PropsWithScope<TProps>>,
): ForwardRefExoticComponent<
  PropsWithoutRef<PropsWithoutScope<TProps>> & RefAttributes<TNode>
> => {
  return React_forwardRef(
    watch(render) as ForwardRefRenderFunction<TNode, PropsWithoutScope<TProps>>,
  )
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
