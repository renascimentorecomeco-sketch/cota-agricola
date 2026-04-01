"use client"

import { useEffect, useState } from "react"
import type { Noticia } from "@/lib/types"

interface NewsTickerProps {
  noticias: Noticia[]
}

export function NewsTicker({ noticias }: NewsTickerProps) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => prev - 1)
    }, 30)

    return () => clearInterval(interval)
  }, [])

  const tickerText = noticias.map((n) => n.texto).join("     •     ")
  const repeatedText = `${tickerText}     •     ${tickerText}     •     ${tickerText}`

  return (
    <div className="shrink-0 overflow-hidden border-t-2 border-emerald-500/30 bg-black/60 backdrop-blur-xl">
      <div className="flex items-center gap-6 px-6 py-5">
        <span className="shrink-0 rounded-lg bg-emerald-500 px-5 py-2 text-lg font-extrabold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/30">
          Notícias
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div
            className="whitespace-nowrap text-xl font-semibold text-white/90"
            style={{
              transform: `translateX(${offset}px)`,
              transition: "none",
            }}
          >
            {repeatedText}
          </div>
        </div>
      </div>
    </div>
  )
}
