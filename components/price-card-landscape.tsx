"use client"

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Coffee,
  Wheat,
  Leaf,
  Apple,
  Cloud,
  CircleDot,
  Flame,
  Bean,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Cotacao } from "@/lib/types"

interface PriceCardLandscapeProps {
  cotacao: Cotacao
  className?: string
}

const iconMap: Record<string, React.ElementType> = {
  coffee: Coffee,
  flame: Flame,
  bean: Bean,
  wheat: Wheat,
  leaf: Leaf,
  apple: Apple,
  cloud: Cloud,
  "circle-dot": CircleDot,
}

const productIconFallback: Record<string, React.ElementType> = {
  "Café Conilon": Coffee,
  "Café Arábica": Coffee,
  "Pimenta-do-Reino": Flame,
  Cacau: Bean,
  Soja: Wheat,
  Milho: Wheat,
  Algodão: Cloud,
  "Feijão Carioca": CircleDot,
  Arroz: Wheat,
  Laranja: Apple,
  "Cana-de-Açúcar": Leaf,
  Mandioca: Leaf,
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return isoString
  }
}

export function PriceCardLandscape({
  cotacao,
  className,
}: PriceCardLandscapeProps) {
  const isPositive = cotacao.variacao > 0
  const isNegative = cotacao.variacao < 0
  const isNeutral = cotacao.variacao === 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatVariacao = (value: number) => {
    const prefix = value > 0 ? "+" : ""
    return `${prefix}${value.toFixed(2)}%`
  }

  const getBorderColor = () => {
    if (isPositive) return "border-emerald-500/40"
    if (isNegative) return "border-red-500/40"
    return "border-white/20"
  }

  const getGlowColor = () => {
    if (isPositive) return "shadow-emerald-500/10"
    if (isNegative) return "shadow-red-500/10"
    return "shadow-white/5"
  }

  const IconComponent =
    iconMap[cotacao.icone] ||
    productIconFallback[cotacao.produto] ||
    Leaf

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-black/50 px-4 py-4 backdrop-blur-xl transition-all duration-500 sm:gap-4 sm:px-6 sm:py-5",
        getBorderColor(),
        getGlowColor(),
        "shadow-xl",
        className
      )}
    >
      {/* Ícone + Nome do Produto */}
      <div className="flex min-w-0 flex-[2] items-center gap-3 sm:gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-14 sm:w-14 sm:rounded-xl",
            isPositive && "bg-emerald-500/20",
            isNegative && "bg-red-500/20",
            isNeutral && "bg-white/10"
          )}
        >
          <IconComponent
            className={cn(
              "h-5 w-5 sm:h-7 sm:w-7",
              isPositive && "text-emerald-400",
              isNegative && "text-red-400",
              isNeutral && "text-white/70"
            )}
          />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold tracking-tight text-white sm:text-xl">
            {cotacao.produto}
          </h3>
          <p className="text-xs font-medium uppercase tracking-wider text-white/40 sm:text-sm">
            {cotacao.unidade}
          </p>
        </div>
      </div>

      {/* Preço */}
      <div className="flex shrink-0 flex-col items-end px-1 sm:px-4">
        <p
          className={cn(
            "text-2xl font-bold tabular-nums tracking-tight sm:text-4xl",
            isPositive && "text-emerald-400",
            isNegative && "text-red-400",
            isNeutral && "text-white"
          )}
        >
          {formatCurrency(cotacao.precoAtual)}
        </p>
      </div>

      {/* Variação */}
      <div className="flex shrink-0 flex-col items-center px-1 sm:px-3">
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold sm:gap-1.5 sm:px-4 sm:py-1.5 sm:text-base",
            isPositive && "bg-emerald-500/20 text-emerald-400",
            isNegative && "bg-red-500/20 text-red-400",
            isNeutral && "bg-white/10 text-white/50"
          )}
        >
          {isPositive && <TrendingUp className="h-3.5 w-3.5 sm:h-5 sm:w-5" />}
          {isNegative && <TrendingDown className="h-3.5 w-3.5 sm:h-5 sm:w-5" />}
          {isNeutral && <Minus className="h-3.5 w-3.5 sm:h-5 sm:w-5" />}
          <span>{formatVariacao(cotacao.variacao)}</span>
        </div>
      </div>

      {/* Produtor + Logo + Hora */}
      <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 text-right sm:flex">
        <div>
          <p className="truncate text-sm font-medium text-white/70 lg:text-base">
            {cotacao.produtorNome}
          </p>
          <p className="text-xs text-white/40 lg:text-sm">
            {formatTime(cotacao.ultimaAtualizacao)}
          </p>
        </div>
        {cotacao.produtorLogo && (
          <img
            src={cotacao.produtorLogo}
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-cover lg:h-12 lg:w-12"
          />
        )}
      </div>
    </div>
  )
}
