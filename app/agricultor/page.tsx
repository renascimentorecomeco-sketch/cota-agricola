"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NumericKeypad } from "@/components/numeric-keypad"
import {
  Leaf,
  Coffee,
  Flame,
  Check,
  Wheat,
  Apple,
  Cloud,
  CircleDot,
  Bean,
  LogOut,
  Lock,
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import type { Cotacao, CotacaoRow, Produtor } from "@/lib/types"
import { mapCotacao } from "@/lib/types"

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

// ==============================
// TELA DE LOGIN
// ==============================

function LoginScreen({
  onLogin,
}: {
  onLogin: (produtor: Produtor) => void
}) {
  const [nome, setNome] = useState("")
  const [codigo, setCodigo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!nome.trim() || codigo.length !== 4) {
      setError("Preencha o nome e o código de 4 dígitos.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { data, error: dbError } = await supabase
        .from("produtores")
        .select("id, nome")
        .eq("nome", nome.trim())
        .eq("codigo", codigo)
        .eq("ativo", true)
        .single()

      if (dbError || !data) {
        setError("Nome ou código incorreto. Tente novamente.")
        return
      }

      localStorage.setItem(
        "cotaagricola-produtor",
        JSON.stringify({ id: data.id, nome: data.nome })
      )
      onLogin({ id: data.id, nome: data.nome })
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodigoKey = (key: string) => {
    if (codigo.length >= 4) return
    setCodigo((prev) => prev + key)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/images/infinity-logo.png"
            alt="Infinity Mídia Digital"
            className="h-12 w-auto brightness-0 invert"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              CotaAgrícola
            </h1>
            <p className="text-sm text-muted-foreground">Área do Produtor</p>
          </div>
        </div>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Lock className="h-4 w-4" />
              Identificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Nome / Propriedade
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  setError("")
                }}
                placeholder="Ex: Fazenda São João"
                className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Código PIN
              </label>
              <div className="mb-3 flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-border bg-secondary/50 text-2xl font-bold text-foreground transition-colors data-[filled=true]:border-primary"
                    data-filled={i < codigo.length}
                  >
                    {codigo[i] ? "•" : ""}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
                  (key) => {
                    if (key === "") return <div key="empty" />
                    if (key === "⌫") {
                      return (
                        <Button
                          key={key}
                          variant="secondary"
                          size="lg"
                          className="h-12 text-lg"
                          onClick={() => setCodigo((prev) => prev.slice(0, -1))}
                        >
                          ⌫
                        </Button>
                      )
                    }
                    return (
                      <Button
                        key={key}
                        variant="secondary"
                        size="lg"
                        className="h-12 text-lg font-semibold"
                        onClick={() => handleCodigoKey(key)}
                      >
                        {key}
                      </Button>
                    )
                  }
                )}
              </div>
            </div>

            {error && (
              <p className="text-center text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <Button
              size="lg"
              className="h-14 w-full bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={handleLogin}
              disabled={isLoading || !nome.trim() || codigo.length !== 4}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==============================
// PAINEL DO AGRICULTOR
// ==============================

export default function AgricultorPage() {
  const [produtor, setProdutor] = useState<Produtor | null>(null)
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [produtoSelecionado, setProdutoSelecionado] = useState<Cotacao | null>(null)
  const [novoPreco, setNovoPreco] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("cotaagricola-produtor")
    if (saved) {
      try {
        setProdutor(JSON.parse(saved))
      } catch {
        localStorage.removeItem("cotaagricola-produtor")
      }
    }
  }, [])

  useEffect(() => {
    if (!produtor) {
      setIsLoadingData(false)
      return
    }

    async function fetchCotacoes() {
      try {
        const { data, error } = await supabase
          .from("cotacoes")
          .select("*")
          .order("ordem", { ascending: true })

        if (data) setCotacoes(data.map(mapCotacao))
        if (error) console.error("Erro ao carregar cotações:", error)
      } catch (err) {
        console.error("Erro:", err)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchCotacoes()

    const channel = supabase
      .channel("cotacoes-agricultor")
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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [produtor])

  const handleLogout = () => {
    localStorage.removeItem("cotaagricola-produtor")
    setProdutor(null)
    setCotacoes([])
  }

  const handleKeyPress = (key: string) => {
    if (key === "," && novoPreco.includes(",")) return
    if (novoPreco.length >= 10) return
    setNovoPreco((prev) => prev + key)
  }

  const handleDelete = () => setNovoPreco((prev) => prev.slice(0, -1))
  const handleClear = () => setNovoPreco("")

  const handleOpenModal = (cotacao: Cotacao) => {
    setProdutoSelecionado(cotacao)
    setNovoPreco("")
  }

  const handleCloseModal = () => {
    setProdutoSelecionado(null)
    setNovoPreco("")
  }

  const parsePreco = (value: string): number =>
    parseFloat(value.replace(",", ".")) || 0

  async function handleSubmit() {
    if (!produtoSelecionado || !novoPreco || !produtor) return
    const precoNumerico = parsePreco(novoPreco)
    if (precoNumerico <= 0) {
      toast.error("Preço inválido", {
        description: "Digite um valor maior que zero.",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.rpc("atualizar_preco", {
        p_cotacao_id: produtoSelecionado.id,
        p_novo_preco: precoNumerico,
        p_produtor_id: produtor.id,
        p_produtor_nome: produtor.nome,
      })

      if (error) throw error

      toast.success("Preço atualizado!", {
        description: `${produtoSelecionado.produto} → ${formatCurrency(precoNumerico)}`,
      })

      handleCloseModal()
    } catch (error) {
      console.error("Erro ao atualizar preço:", error)
      toast.error("Erro ao atualizar preço", {
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!produtor) {
    return <LoginScreen onLogin={setProdutor} />
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-card/95 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/infinity-logo.png"
              alt="Infinity"
              className="h-8 w-auto brightness-0 invert"
            />
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground">
                CotaAgrícola
              </h1>
              <p className="text-xs text-muted-foreground">{produtor.nome}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="p-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Cotações</h2>
          <p className="text-sm text-muted-foreground">
            Toque em um produto para atualizar o preço
          </p>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <img src="/images/infinity-logo.png" alt="Loading" className="h-8 w-auto animate-pulse brightness-0 invert" />
          </div>
        ) : (
          <div className="space-y-3">
            {cotacoes.map((cotacao) => {
              const IconComponent = iconMap[cotacao.icone] || Leaf
              const isPositive = cotacao.variacao > 0
              const isNegative = cotacao.variacao < 0

              return (
                <Card
                  key={cotacao.id}
                  className="cursor-pointer border-border/50 bg-card/80 transition-all active:scale-[0.98]"
                  onClick={() => handleOpenModal(cotacao)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-foreground">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {cotacao.produto}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {cotacao.unidade}
                        </p>
                        {cotacao.ultimaAtualizacao && (
                          <p className="mt-0.5 text-xs text-muted-foreground/60">
                            Atualizado: {formatDateTime(cotacao.ultimaAtualizacao)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(cotacao.precoAtual)}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          isPositive
                            ? "text-emerald-500"
                            : isNegative
                              ? "text-red-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {cotacao.variacao.toFixed(2)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <Dialog open={!!produtoSelecionado} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-sm bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Atualizar Preço</DialogTitle>
            <DialogDescription>
              {produtoSelecionado?.produto} — {produtoSelecionado?.unidade}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex gap-3">
              <Card className="flex-1 border-border/50 bg-secondary/30">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Atual</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(produtoSelecionado?.precoAtual || 0)}
                  </p>
                </CardContent>
              </Card>
              <Card className="flex-1 border-primary/30 bg-primary/5">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-primary">Novo</p>
                  <p className="text-lg font-bold text-primary">
                    R$ {novoPreco || "0,00"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <NumericKeypad
              onKeyPress={handleKeyPress}
              onDelete={handleDelete}
              onClear={handleClear}
            />

            <Button
              size="lg"
              className="h-14 w-full bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={!novoPreco || isLoading}
            >
              {isLoading ? (
                "Atualizando..."
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Confirmar Atualização
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
