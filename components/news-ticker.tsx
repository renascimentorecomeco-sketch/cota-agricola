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
      <div className="flex items-center gap-4 px-4 py-3 sm:gap-6 sm:px-6 sm:py-5">
        <span className="shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/30 sm:px-5 sm:py-2 sm:text-lg">
          Notícias
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div
            className="whitespace-nowrap text-base font-semibold text-white/90 sm:text-xl"
            style={{
              transform: `translateX(${offset}px)`,
              transition: "none",
            }}
          >
            {repeatedText}
          </div>
        </div>
        <span className="hidden shrink-0 text-xs text-white/30 sm:block">
          CotaAgrícola por Infinity
        </span>
      </div>
    </div>
  )
}
