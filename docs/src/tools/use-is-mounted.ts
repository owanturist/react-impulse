"use client"

import { useEffect, useState } from "react"

/**
 * A React hook that returns whether the component has been mounted. on the client.
 * Helps preventing hydration mismatches when children depend on client-only state
 * (e.g. `localStorage`, `useTheme` from next-themes).
 *
 * @returns `false` during SSR and the first client render, then `true` on subsequent renders.
 * ```
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
