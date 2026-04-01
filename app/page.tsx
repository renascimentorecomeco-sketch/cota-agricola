"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { PriceCardLandscape } from "@/components/price-card-landscape"
import { NewsTicker } from "@/components/news-ticker"
import { Leaf } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import type { Cotacao, Noticia, CotacaoRow } from "@/lib/types"
import { mapCotacao, mapNoticia } from "@/lib/types"

// 6 cotações por página — otimizado para TV em modo retrato (1080x1920)
const ITEMS_PER_PAGE = 6
const ROTATION_INTERVAL = 10000
const ANIMATION_DURATION = 600

export default function TVDashboard() {
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [horaAtual, setHoraAtual] = useState<string>("")
  const [dataAtual, setDataAtual] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.ceil(cotacoes.length / ITEMS_PER_PAGE)

  // ========== FETCH INICIAL ==========
  useEffect(() => {
    async function fetchData() {
      try {
        const [cotacoesRes, noticiasRes] = await Promise.all([
          supabase
            .from("cotacoes")
            .select("*")
            .order("ordem", { ascending: true }),
          supabase
            .from("noticias")
            .select("*")
            .eq("ativa", true)
            .order("created_at", { ascending: false }),
        ])

        if (cotacoesRes.data) {
          setCotacoes(cotacoesRes.data.map(mapCotacao))
        }
        if (noticiasRes.data) {
          setNoticias(noticiasRes.data.map(mapNoticia))
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // ========== SUPABASE REALTIME ==========
  useEffect(() => {
    const channel = supabase
      .channel("cotacoes-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "cotacoes" },
        (payload) => {
          const updated = mapCotacao(payload.new as CotacaoRow)
          setCotacoes((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          )
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "cotacoes" },
        (payload) => {
          const newCotacao = mapCotacao(payload.new as CotacaoRow)
          setCotacoes((prev) =>
            [...prev, newCotacao].sort((a, b) => a.ordem - b.ordem)
          )
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "noticias" },
        async () => {
          const { data } = await supabase
            .from("noticias")
            .select("*")
            .eq("ativa", true)
            .order("created_at", { ascending: false })
          if (data) setNoticias(data.map(mapNoticia))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ========== CARROSSEL ==========
  const goToNextPage = useCallback(() => {
    if (isAnimating || totalPages <= 1) return
    setIsAnimating(true)
    setTranslateY(-100)
    setTimeout(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
      setTranslateY(0)
      setIsAnimating(false)
    }, ANIMATION_DURATION)
  }, [totalPages, isAnimating])

  const goToPage = useCallback(
    (pageIndex: number) => {
      if (isAnimating || pageIndex === currentPage) return
      setIsAnimating(true)
      const direction = pageIndex > currentPage ? -100 : 100
      setTranslateY(direction)
      setTimeout(() => {
        setCurrentPage(pageIndex)
        setTranslateY(0)
        setIsAnimating(false)
      }, ANIMATION_DURATION)
    },
    [currentPage, isAnimating]
  )

  // Relógio
  useEffect(() => {
    const atualizar = () => {
      const now = new Date()
      setHoraAtual(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      )
      setDataAtual(
        now.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      )
    }
    atualizar()
    const interval = setInterval(atualizar, 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-rotação
  useEffect(() => {
    if (totalPages <= 1) return
    const interval = setInterval(goToNextPage, ROTATION_INTERVAL)
    return () => clearInterval(interval)
  }, [goToNextPage, totalPages])

  const startIndex = currentPage * ITEMS_PER_PAGE
  const currentCotacoes = cotacoes.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <Leaf className="mx-auto mb-4 h-12 w-12 animate-pulse text-emerald-500" />
          <p className="text-lg text-white/60">Carregando cotações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/agro-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/80" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Header — compacto pro retrato */}
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/40 px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                CotaAgrícola
              </h1>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-400/80">
                  AO VIVO
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums text-white/90">
              {horaAtual}
            </p>
            <p className="text-xs capitalize text-white/50">
              {dataAtual}
            </p>
          </div>
        </header>

        {/* Cards — 6 por página em retrato */}
        <main className="flex flex-1 flex-col overflow-hidden px-5 py-4">
          <div ref={containerRef} className="relative flex-1 overflow-hidden">
            <div
              className={cn(
                "flex h-full flex-col justify-evenly",
                "transition-all ease-in-out",
                isAnimating ? "duration-500" : "duration-0"
              )}
              style={{
                transform: `translateY(${translateY}%)`,
                opacity: isAnimating ? 0.3 : 1,
              }}
            >
              {currentCotacoes.map((cotacao) => (
                <PriceCardLandscape key={cotacao.id} cotacao={cotacao} />
              ))}
            </div>
          </div>

          {/* Dots de paginação */}
          {totalPages > 1 && (
            <div className="mt-3 flex shrink-0 items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    currentPage === index
                      ? "w-8 bg-emerald-500 shadow-lg shadow-emerald-500/50"
                      : "w-2.5 bg-white/30 hover:bg-white/50"
                  )}
                  aria-label={`Ir para página ${index + 1}`}
                />
              ))}
            </div>
          )}
        </main>

        {/* Ticker de notícias — barra grande */}
        {noticias.length > 0 && <NewsTicker noticias={noticias} />}
      </div>
    </div>
  )
}
