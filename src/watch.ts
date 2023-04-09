import {
  FunctionComponent,
  ForwardRefRenderFunction,
  ForwardRefExoticComponent,
  memo as React_memo,
  forwardRef as React_forwardRef,
  PropsWithoutRef,
  RefAttributes,
  createElement,
  NamedExoticComponent,
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
export function watch<TProps>(
  Component: FunctionComponent<PropsWithScope<TProps>>,
): ForwardRefExoticComponent<PropsWithoutScope<TProps>> {
  const ImpulseWatcher = React_forwardRef((props, ref) => {
    const getScope = useScope()

    return createElement(Component, { ...props, ref, scope: getScope() })
  }) as ForwardRefExoticComponent<PropsWithoutScope<TProps>>

  ImpulseWatcher.displayName = `ImpulseWatcher${Component.displayName ?? ""}`

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
  PropsWithoutScope<
    PropsWithoutRef<PropsWithScope<TProps>> & RefAttributes<TNode>
  >
> => {
  return watch(React_forwardRef(render))
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
