import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RSS_FEEDS = [
  { url: "https://www.canalrural.com.br/feed/", nome: "Canal Rural" },
  { url: "https://www.agrolink.com.br/feed/", nome: "Agrolink" },
  { url: "https://www.portaldoagronegocio.com.br/feed/", nome: "Portal do Agronegócio" },
  { url: "https://www.brasilagro.com.br/feed/", nome: "Brasil Agro" },
]

function parseRSS(xml: string): string[] {
  const titles: string[] = []
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi
  let itemMatch

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemContent = itemMatch[1]
    const titleMatch = itemContent.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/)
    if (titleMatch) {
      let title = titleMatch[1]
        .replace(/<!\[CDATA\[/g, "")
        .replace(/\]\]>/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'")
        .trim()

      if (title.length > 20 && title.length < 200) {
        titles.push(title)
      }
    }
  }

  return titles
}

async function fetchFeed(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CotaAgricola/1.0 (RSS Reader)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    })
    clearTimeout(timeout)
    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")

  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const allTitles: string[] = []
  const errors: string[] = []

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const xml = await fetchFeed(feed.url)
      if (!xml) {
        errors.push(`Falha ao buscar: ${feed.nome}`)
        return []
      }
      return parseRSS(xml).slice(0, 5)
    })
  )

  for (const result of results) {
    if (result.status === "fulfilled") {
      allTitles.push(...result.value)
    }
  }

  if (allTitles.length === 0) {
    return NextResponse.json({
      success: false,
      message: "Nenhuma notícia encontrada nos feeds",
      errors,
    })
  }

  const finalTitles = [...new Set(allTitles)].slice(0, 15)

  try {
    await supabaseAdmin
      .from("noticias")
      .update({ ativa: false })
      .eq("ativa", true)

    const { error } = await supabaseAdmin
      .from("noticias")
      .insert(finalTitles.map((texto) => ({ texto, ativa: true })))

    if (error) throw error

    await supabaseAdmin
      .from("noticias")
      .delete()
      .eq("ativa", false)
      .lt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    return NextResponse.json({
      success: true,
      count: finalTitles.length,
      noticias: finalTitles,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Erro ao salvar notícias:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao salvar no banco" },
      { status: 500 }
    )
  }
}
