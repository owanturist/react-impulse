import { source } from "@/source"
import { getLLMText } from "@/tools/get-llm-text"

export const revalidate = false

export async function GET() {
  const scanned = await Promise.all(source.getPages().map(getLLMText))

  return new Response(scanned.join("\n\n"))
}
