export { watch }

import {
  type FC,
  type ForwardRefRenderFunction,
  type ExoticComponent,
  type MemoExoticComponent,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  memo as React_memo,
  forwardRef as React_forwardRef,
} from "./dependencies"
import type { Compare } from "./utils"
import { useScope } from "./useScope"
import { defineExecutionContext } from "./validation"
import { injectScope } from "./Scope"

/**
 * Creates a React component that subscribes to all Impulses calling the `Impulse#getValue` method during the rendering phase of the component.
 *
 * @param component a watched component
 *
 * @version 1.0.0
 */
function watch<TProps>(component: ExoticComponent<TProps>): never
function watch<TProps>(component: FC<TProps>): FC<TProps>
function watch<TProps>(component: FC<TProps>): FC<TProps> {
  const ComponentWithScope: FC<TProps> = (props, ctx: unknown) => {
    const getScope = useScope()

    return defineExecutionContext(
      "watch",
      injectScope,
      getScope(),
      component,
      props,
      ctx,
    )
  }

  ComponentWithScope.displayName = `ImpulseWatcher${
    component.displayName ?? component.name
  }`

  return ComponentWithScope
}

/**
 * The function should be defined via `const` to prevent rollup failure.
 */
const memo = <TProps>(
  component: FC<TProps>,
  propsAreEqual?: Compare<Readonly<TProps>>,
): MemoExoticComponent<FC<TProps>> => {
  return React_memo(watch(component), propsAreEqual)
}

const forwardRefMemo = <TNode, TProps>(
  render: ForwardRefRenderFunction<TNode, TProps>,
  propsAreEqual?: Compare<
    Readonly<PropsWithoutRef<TProps> & RefAttributes<TNode>>
  >,
): MemoExoticComponent<
  ForwardRefExoticComponent<PropsWithoutRef<TProps> & RefAttributes<TNode>>
> => {
  return React_memo(forwardRef(render), propsAreEqual)
}

const forwardRef = <TNode, TProps>(
  render: ForwardRefRenderFunction<TNode, TProps>,
): ForwardRefExoticComponent<
  PropsWithoutRef<TProps> & RefAttributes<TNode>
> => {
  return React_forwardRef(
    watch(render) as ForwardRefRenderFunction<TNode, TProps>,
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
