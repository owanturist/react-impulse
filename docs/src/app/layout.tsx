import { RootProvider } from "fumadocs-ui/provider/next"
import type { PropsWithChildren } from "react"

import "./styles.css"

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider
          search={{
            options: {
              type: "static",
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
