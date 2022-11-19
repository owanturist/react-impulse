import {
  FC,
  ForwardRefRenderFunction,
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

export const watch = <TProps>(render: FC<TProps>): FC<TProps> => {
  const SweetyWatcher: FC<TProps> = (props, ctx) => {
    const { executeWatcher, subscribe, getState } = useWatchContext({
      warningSource: "watch",
    })

    return useSyncExternalStoreWithSelector(
      subscribe,
      getState,
      getState,
      // no need to memoize since props are a new object on each call
      () => executeWatcher(() => render(props, ctx)),
    )
  }

  SweetyWatcher.displayName = render.displayName

  return SweetyWatcher
}

const memo = <TProps>(
  render: FC<TProps>,
  propsAreEqual?: Compare<Readonly<TProps>>,
): MemoExoticComponent<FC<TProps>> => {
  return React_memo(watch(render), propsAreEqual)
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

memo.forwardRef = forwardRef.memo = forwardRefMemo
watch.memo = memo
watch.forwardRef = forwardRef
