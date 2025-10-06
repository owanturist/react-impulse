import { createFileRoute } from "@tanstack/react-router"
import { createFromSource } from "fumadocs-core/search/server"

import { docs } from "~/loaders/docs"

const server = createFromSource(docs, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: "english",
})

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: ({ request }) => server.GET(request),
    },
  },
})
