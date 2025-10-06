import { createRouter } from "@tanstack/react-router"

import { NotFound } from "~/pages/404"
import { routeTree } from "~/router-tree.generated"

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
