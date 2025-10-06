import { HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import { RootProvider } from "fumadocs-ui/provider/tanstack"

export function Html() {
  return (
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>

      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <RootProvider>
          <Outlet />
        </RootProvider>

        <Scripts />
      </body>
    </html>
  )
}
