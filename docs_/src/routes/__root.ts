import { createRootRoute } from "@tanstack/react-router"

import { Html } from "~/pages/html"

import styles from "./styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "React Impulse" },
    ],
    links: [{ rel: "stylesheet", href: styles }],
  }),

  component: Html,
})
