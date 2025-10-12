import { readFile } from "node:fs/promises"
import { stat } from "node:fs/promises"
import { createServer } from "node:http"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import server from "./dist/server/server.js"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const clientDir = join(__dirname, "dist/client")
const port = process.env.PORT || 3000

// MIME types mapping
const mimeTypes = new Map([
  [".html", "text/html"],
  [".css", "text/css"],
  [".js", "application/javascript"],
  [".json", "application/json"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
])

const httpServer = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`)

    // Try to serve static files from dist/client first
    if (req.method === "GET") {
      const filePath = join(clientDir, url.pathname)

      try {
        const fileStat = await stat(filePath)
        if (fileStat.isFile()) {
          const ext = filePath.substring(filePath.lastIndexOf("."))
          const mimeType = mimeTypes.get(ext) || "application/octet-stream"
          const content = await readFile(filePath)

          res.writeHead(200, { "Content-Type": mimeType })
          res.end(content)

          return
        }
      } catch {
        // File doesn't exist, continue to SSR handler
      }
    }

    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
    })

    const response = await server.fetch(request)

    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    if (response.body) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        res.write(value)
      }
    }
    res.end()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Server error:", error)
    res.statusCode = 500
    res.end("Internal Server Error")
  }
})

httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`)
})
