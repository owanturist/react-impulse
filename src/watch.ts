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
import hoistStatics from "hoist-non-react-statics"

import { useWatchContext } from "./useWatchContext"
import { Compare } from "./utils"

const isSweetyWatch = <TProps>(
  render: FC<TProps> & { isSweetyWatch?: boolean },
): boolean => {
  return render.isSweetyWatch === true
}

/**
 * Creates a React component that subscribes to all `Sweety` instances calling the `Sweety#getState` method during the rendering phase of the component.
 *
 * @param component a watched component
 *
 * @version 2.1.0
 */
export function watch<TProps>(component: ExoticComponent<TProps>): never
export function watch<TProps>(component: FC<TProps>): FC<TProps>
export function watch<TProps>(component: FC<TProps>): FC<TProps> {
  if (isSweetyWatch(component)) {
    return component
  }

  const SweetyWatcher = (props: TProps, ctx: unknown): ReturnType<FC> => {
    const { executeWatcher, subscribe, getState } = useWatchContext({
      warningSource: "watch",
    })

    return useSyncExternalStoreWithSelector(
      subscribe,
      getState,
      getState,
      // no need to memoize since props are a new object on each call
      () => executeWatcher(() => component(props, ctx)),
    )
  }

  hoistStatics(SweetyWatcher, component)

  SweetyWatcher.displayName = `SweetyWatcher${component.displayName ?? ""}`
  SweetyWatcher.isSweetyWatch = true

  return SweetyWatcher
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
 * An alias for
 *
 * @example
 * React.memo(React.forwardRef(watch(...)))
 */
memo.forwardRef = forwardRef.memo = forwardRefMemo

/**
 * An alias for
 *
 * @example
 * React.memo(watch(...))
 */
watch.memo = memo

/**
 * An alias for
 *
 * @example
 * React.forwardRef(watch(...))
 */
watch.forwardRef = forwardRef
