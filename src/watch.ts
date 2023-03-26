import {
  FC,
  ForwardRefRenderFunction,
  MemoExoticComponent,
  ForwardRefExoticComponent,
  memo as React_memo,
  forwardRef as React_forwardRef,
  PropsWithoutRef,
  RefAttributes,
  createElement,
} from "react"

import { Compare } from "./utils"
import { Scope } from "./Scope"
import { useScope } from "./useScope"

// TODO export types?
export type PropsWithScope<TProps> = TProps & { scope: Scope }

// TODO delete or apply in memo and forwardRef
export type PropsWithoutScope<TProps> = Omit<TProps, "scope">

/**
 * Creates a React component that subscribes to all Impulses calling the `Impulse#getValue` method during the rendering phase of the component.
 *
 * @param component a watched component
 *
 * @version 1.0.0
 */
// export function watch<TProps>(Component: FC<PropsWithScope<TProps>>): FC<TProps>
// export function watch<TProps extends { scope: Scope }>(
//   Component: FC<TProps>,
// ): FC<PropsWithoutScope<TProps>>
export function watch<TProps>(
  Component: FC<PropsWithScope<TProps>>,
): FC<PropsWithoutScope<TProps>> {
  const ImpulseWatcher: React.FC<TProps> = React_forwardRef((props, ref) => {
    const scope = useScope()

    return createElement(Component, { ...props, ref, scope })
  })

  ImpulseWatcher.displayName = `ImpulseWatcher${Component.displayName ?? ""}`

  return ImpulseWatcher
}

const memo = <TProps>(
  component: FC<PropsWithScope<TProps>>,
  // TODO exclude scope from props
  propsAreEqual?: Compare<Readonly<PropsWithScope<TProps>>>,
): MemoExoticComponent<FC<TProps>> => {
  return React_memo(watch(component), propsAreEqual)
}

const forwardRefMemo = <TNode, TProps>(
  render: ForwardRefRenderFunction<TNode, PropsWithScope<TProps>>,
  propsAreEqual?: Compare<
    Readonly<PropsWithoutRef<TProps> & RefAttributes<TNode>>
  >,
): MemoExoticComponent<
  ForwardRefExoticComponent<PropsWithoutRef<TProps> & RefAttributes<TNode>>
> => {
  return React_memo(forwardRef(render), propsAreEqual)
}

const forwardRef = <TNode, TProps>(
  render: ForwardRefRenderFunction<TNode, PropsWithScope<TProps>>,
): ForwardRefExoticComponent<
  PropsWithoutRef<TProps> & RefAttributes<TNode>
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
