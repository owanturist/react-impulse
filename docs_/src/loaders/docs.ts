import { loader } from "fumadocs-core/source"
import * as icons from "lucide-static"

import { create, source } from "~/source"

export const docs = loader({
  source: await create.sourceAsync(source.doc, source.meta),
  baseUrl: "/docs",
  icon(icon) {
    if (!icon) {
      return
    }

    if (icon in icons) {
      return icons[icon as keyof typeof icons]
    }
  },
})
