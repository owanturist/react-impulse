import {
  FC,
  ForwardRefRenderFunction,
  ExoticComponent,
  MemoExoticComponent,
  ForwardRefExoticComponent,
  memo as React_memo,
  forwardRef as React_forwardRef,
  PropsWithoutRef,
  RefAttributes,
} from "react"
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"

import { useWatchContext } from "./useWatchContext"
import { Compare } from "./utils"

const isImpulseWatcher = <TProps>(
  render: FC<TProps> & { isImpulseWatcher?: boolean },
): boolean => {
  return render.isImpulseWatcher === true
}

/**
 * Creates a React component that subscribes to all Impulses calling the `Impulse#getValue` method during the rendering phase of the component.
 *
 * @param component a watched component
 *
 * @version 1.0.0
 */
export function watch<TProps>(component: ExoticComponent<TProps>): never
export function watch<TProps>(component: FC<TProps>): FC<TProps>
export function watch<TProps>(component: FC<TProps>): FC<TProps> {
  if (isImpulseWatcher(component)) {
    return component
  }

  const ImpulseWatcher = (props: TProps, ctx: unknown): ReturnType<FC> => {
    const { executeWatcher, subscribe, getVersion } = useWatchContext({
      warningSource: "watch",
    })

    return useSyncExternalStoreWithSelector(
      subscribe,
      getVersion,
      getVersion,
      // no need to memoize since props are a new object on each call
      () => executeWatcher(() => component(props, ctx)),
    )
  }

  ImpulseWatcher.displayName = `ImpulseWatcher${component.displayName ?? ""}`
  ImpulseWatcher.isImpulseWatcher = true

  return ImpulseWatcher
}

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
