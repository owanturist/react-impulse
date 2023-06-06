// the file re-exports the dependencies so the import appears only once in the output file

export type {
  FunctionComponent,
  ForwardRefRenderFunction,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  NamedExoticComponent,
  ExoticComponent,
  DependencyList,
  EffectCallback,
} from "react"
export {
  memo,
  forwardRef,
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useDebugValue,
} from "react"
export { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector.js"
