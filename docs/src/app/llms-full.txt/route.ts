import { getLLMText } from "@/lib/get-llm-text"
import { source } from "@/source"

// biome-ignore lint/style/useExportsLast: Next.js requires static export const for route segment config
export const revalidate = false

async function GET() {
  const scanned = await Promise.all(source.getPages().map(getLLMText))

  return new Response(scanned.join("\n\n"))
}

export { GET }
