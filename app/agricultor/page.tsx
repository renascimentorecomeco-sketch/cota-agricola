"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  BarChart3,
  Package,
  User,
  Plus,
  Trash2,
  Edit3,
  Save,
  Upload,
  Camera,
  X,
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

const iconOptions = [
  { value: "coffee", label: "Café", Icon: Coffee },
  { value: "flame", label: "Pimenta", Icon: Flame },
  { value: "bean", label: "Grão", Icon: Bean },
  { value: "wheat", label: "Cereal", Icon: Wheat },
  { value: "leaf", label: "Folha", Icon: Leaf },
  { value: "apple", label: "Fruta", Icon: Apple },
  { value: "cloud", label: "Algodão", Icon: Cloud },
  { value: "circle-dot", label: "Outro", Icon: CircleDot },
]

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

function LoginScreen({ onLogin }: { onLogin: (produtor: Produtor) => void }) {
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
        .select("id, nome, logo_url")
        .eq("nome", nome.trim())
        .eq("codigo", codigo)
        .eq("ativo", true)
        .single()

      if (dbError || !data) {
        setError("Nome ou código incorreto. Tente novamente.")
        return
      }

      const produtor: Produtor = { id: data.id, nome: data.nome, logoUrl: data.logo_url }
      localStorage.setItem("cotaagricola-produtor", JSON.stringify(produtor))
      onLogin(produtor)
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
          <img src="/images/infinity-logo.png" alt="Infinity Mídia Digital" className="h-12 w-auto brightness-0 invert" />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">CotaAgrícola</h1>
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
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Nome / Propriedade</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => { setNome(e.target.value); setError("") }}
                placeholder="Ex: Fazenda São João"
                className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Código PIN</label>
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
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((key) => {
                  if (key === "") return <div key="empty" />
                  if (key === "⌫")
                    return (
                      <Button key={key} variant="secondary" size="lg" className="h-12 text-lg" onClick={() => setCodigo((prev) => prev.slice(0, -1))}>
                        ⌫
                      </Button>
                    )
                  return (
                    <Button key={key} variant="secondary" size="lg" className="h-12 text-lg font-semibold" onClick={() => handleCodigoKey(key)}>
                      {key}
                    </Button>
                  )
                })}
              </div>
            </div>

            {error && <p className="text-center text-sm font-medium text-destructive">{error}</p>}

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
// ABA: COTAÇÕES (batch update)
// ==============================

function TabCotacoes({
  cotacoes,
  produtor,
}: {
  cotacoes: Cotacao[]
  produtor: Produtor
}) {
  const [editedPrices, setEditedPrices] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const changedCount = Object.keys(editedPrices).filter((id) => {
    const cotacao = cotacoes.find((c) => c.id === id)
    if (!cotacao) return false
    const newPrice = parseFloat(editedPrices[id]?.replace(",", ".") || "0")
    return newPrice > 0 && newPrice !== cotacao.precoAtual
  }).length

  const handlePriceChange = (id: string, value: string) => {
    // Permitir apenas números e vírgula
    const clean = value.replace(/[^\d,]/g, "")
    setEditedPrices((prev) => ({ ...prev, [id]: clean }))
  }

  const handleSaveAll = async () => {
    if (changedCount === 0) return
    setIsSaving(true)

    let successCount = 0
    let errorCount = 0

    for (const id of Object.keys(editedPrices)) {
      const cotacao = cotacoes.find((c) => c.id === id)
      if (!cotacao) continue

      const newPrice = parseFloat(editedPrices[id]?.replace(",", ".") || "0")
      if (newPrice <= 0 || newPrice === cotacao.precoAtual) continue

      try {
        const { error } = await supabase.rpc("atualizar_preco", {
          p_cotacao_id: id,
          p_novo_preco: newPrice,
          p_produtor_id: produtor.id,
          p_produtor_nome: produtor.nome,
        })
        if (error) throw error
        successCount++
      } catch {
        errorCount++
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} preço(s) atualizado(s)!`)
      setEditedPrices({})
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} falha(s) ao atualizar`)
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Cotações</h2>
          <p className="text-sm text-muted-foreground">Edite os preços e salve tudo de uma vez</p>
        </div>
        {changedCount > 0 && (
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="gap-2 bg-primary text-primary-foreground"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Salvando..." : `Salvar (${changedCount})`}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {cotacoes.map((cotacao) => {
          const IconComponent = iconMap[cotacao.icone] || Leaf
          const isPositive = cotacao.variacao > 0
          const isNegative = cotacao.variacao < 0
          const isEdited = editedPrices[cotacao.id] !== undefined
          const editValue = editedPrices[cotacao.id]

          return (
            <Card
              key={cotacao.id}
              className={`border-border/50 transition-all ${isEdited ? "border-primary/40 bg-primary/5" : "bg-card/80"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{cotacao.produto}</h3>
                      <span
                        className={`text-xs font-semibold ${
                          isPositive ? "text-emerald-500" : isNegative ? "text-red-500" : "text-muted-foreground"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {cotacao.variacao.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{cotacao.unidade}</span>
                      {cotacao.ultimaAtualizacao && (
                        <>
                          <span>•</span>
                          <span>{formatDateTime(cotacao.ultimaAtualizacao)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">R$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editValue ?? cotacao.precoAtual.toFixed(2).replace(".", ",")}
                      onChange={(e) => handlePriceChange(cotacao.id, e.target.value)}
                      onFocus={() => {
                        if (editValue === undefined) {
                          setEditedPrices((prev) => ({
                            ...prev,
                            [cotacao.id]: cotacao.precoAtual.toFixed(2).replace(".", ","),
                          }))
                        }
                      }}
                      className="w-28 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-right text-lg font-bold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Botão salvar fixo no rodapé */}
      {changedCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-20 px-4">
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="h-14 w-full gap-2 bg-primary text-lg font-semibold text-primary-foreground shadow-2xl shadow-primary/30"
          >
            <Save className="h-5 w-5" />
            {isSaving ? "Salvando..." : `Salvar ${changedCount} alteração(ões)`}
          </Button>
        </div>
      )}
    </div>
  )
}

// ==============================
// ABA: PRODUTOS (CRUD)
// ==============================

function TabProdutos({
  cotacoes,
  produtor,
  onRefresh,
}: {
  cotacoes: Cotacao[]
  produtor: Produtor
  onRefresh: () => void
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formNome, setFormNome] = useState("")
  const [formUnidade, setFormUnidade] = useState("")
  const [formIcone, setFormIcone] = useState("leaf")
  const [formPreco, setFormPreco] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const nextOrdem = cotacoes.length > 0 ? Math.max(...cotacoes.map((c) => c.ordem)) + 1 : 1

  const resetForm = () => {
    setFormNome("")
    setFormUnidade("")
    setFormIcone("leaf")
    setFormPreco("")
    setShowAddForm(false)
    setEditingId(null)
  }

  const handleAdd = async () => {
    if (!formNome.trim() || !formUnidade.trim()) {
      toast.error("Preencha nome e unidade")
      return
    }
    setIsSubmitting(true)

    try {
      const preco = parseFloat(formPreco.replace(",", ".")) || 0
      const { error } = await supabase.from("cotacoes").insert({
        produto: formNome.trim(),
        unidade: formUnidade.trim(),
        icone: formIcone,
        preco_atual: preco,
        preco_anterior: 0,
        variacao: 0,
        produtor_id: produtor.id,
        produtor_nome: produtor.nome,
        ordem: nextOrdem,
        ultima_atualizacao: new Date().toISOString(),
      })

      if (error) throw error
      toast.success(`${formNome} adicionado!`)
      resetForm()
      onRefresh()
    } catch (err) {
      console.error(err)
      toast.error("Erro ao adicionar produto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (cotacao: Cotacao) => {
    setEditingId(cotacao.id)
    setFormNome(cotacao.produto)
    setFormUnidade(cotacao.unidade)
    setFormIcone(cotacao.icone)
    setShowAddForm(true)
  }

  const handleUpdate = async () => {
    if (!editingId || !formNome.trim() || !formUnidade.trim()) return
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from("cotacoes")
        .update({
          produto: formNome.trim(),
          unidade: formUnidade.trim(),
          icone: formIcone,
        })
        .eq("id", editingId)

      if (error) throw error
      toast.success("Produto atualizado!")
      resetForm()
      onRefresh()
    } catch {
      toast.error("Erro ao atualizar")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("cotacoes").delete().eq("id", id)
      if (error) throw error
      toast.success("Produto excluído")
      setDeleteConfirm(null)
      onRefresh()
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Meus Produtos</h2>
          <p className="text-sm text-muted-foreground">{cotacoes.length} produto(s) cadastrado(s)</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowAddForm(true) }}
          className="gap-2 bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Novo
        </Button>
      </div>

      {/* Lista de produtos */}
      <div className="space-y-2">
        {cotacoes.map((cotacao) => {
          const IconComponent = iconMap[cotacao.icone] || Leaf

          return (
            <Card key={cotacao.id} className="border-border/50 bg-card/80">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{cotacao.produto}</h3>
                    <p className="text-xs text-muted-foreground">{cotacao.unidade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(cotacao)}>
                    <Edit3 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(cotacao.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modal Adicionar/Editar */}
      <Dialog open={showAddForm} onOpenChange={() => resetForm()}>
        <DialogContent className="max-w-sm bg-card">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Altere os dados do produto" : "Adicione um novo produto à sua lista"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Nome do Produto</label>
              <input
                type="text"
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Café Conilon"
                className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Unidade</label>
              <input
                type="text"
                value={formUnidade}
                onChange={(e) => setFormUnidade(e.target.value)}
                placeholder="Ex: Saca 60kg"
                className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {!editingId && (
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">Preço Inicial (opcional)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formPreco}
                  onChange={(e) => setFormPreco(e.target.value.replace(/[^\d,]/g, ""))}
                  placeholder="0,00"
                  className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-muted-foreground">Ícone</label>
              <div className="grid grid-cols-4 gap-2">
                {iconOptions.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    onClick={() => setFormIcone(value)}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-all ${
                      formIcone === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button
              className="h-12 w-full bg-primary text-primary-foreground"
              onClick={editingId ? handleUpdate : handleAdd}
              disabled={isSubmitting || !formNome.trim() || !formUnidade.trim()}
            >
              {isSubmitting ? "Salvando..." : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {editingId ? "Atualizar Produto" : "Adicionar Produto"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-xs bg-card">
          <DialogHeader>
            <DialogTitle>Excluir Produto</DialogTitle>
            <DialogDescription>
              Tem certeza? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==============================
// ABA: PERFIL (logo upload)
// ==============================

function TabPerfil({
  produtor,
  setProdutor,
}: {
  produtor: Produtor
  setProdutor: (p: Produtor) => void
}) {
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Envie apenas imagens")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 2MB")
      return
    }

    setIsUploading(true)

    try {
      const ext = file.name.split(".").pop()
      const path = `${produtor.id}/logo.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from("logos")
        .getPublicUrl(path)

      const logoUrl = urlData.publicUrl + `?t=${Date.now()}`

      const { error: updateError } = await supabase
        .from("produtores")
        .update({ logo_url: logoUrl })
        .eq("id", produtor.id)

      if (updateError) throw updateError

      const updated = { ...produtor, logoUrl }
      setProdutor(updated)
      localStorage.setItem("cotaagricola-produtor", JSON.stringify(updated))
      toast.success("Logo atualizada!")
    } catch (err) {
      console.error(err)
      toast.error("Erro ao enviar logo")
    } finally {
      setIsUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleRemoveLogo = async () => {
    try {
      await supabase
        .from("produtores")
        .update({ logo_url: null })
        .eq("id", produtor.id)

      const updated = { ...produtor, logoUrl: null }
      setProdutor(updated)
      localStorage.setItem("cotaagricola-produtor", JSON.stringify(updated))
      toast.success("Logo removida")
    } catch {
      toast.error("Erro ao remover logo")
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Meu Perfil</h2>

      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Propriedade</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-bold text-foreground">{produtor.nome}</p>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Logo da Propriedade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Sua logo será exibida nos banners de preço nas TVs
          </p>

          {/* Preview */}
          <div className="flex items-center justify-center">
            {produtor.logoUrl ? (
              <div className="relative">
                <img
                  src={produtor.logoUrl}
                  alt="Logo"
                  className="h-24 w-24 rounded-2xl border-2 border-border object-cover"
                />
                <button
                  onClick={handleRemoveLogo}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground">
                <Camera className="h-8 w-8" />
              </div>
            )}
          </div>

          {/* Upload button */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Enviando..." : produtor.logoUrl ? "Trocar Logo" : "Enviar Logo"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ==============================
// PAINEL PRINCIPAL
// ==============================

type Tab = "cotacoes" | "produtos" | "perfil"

export default function AgricultorPage() {
  const [produtor, setProdutor] = useState<Produtor | null>(null)
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [activeTab, setActiveTab] = useState<Tab>("cotacoes")
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

  const fetchCotacoes = async () => {
    try {
      const { data } = await supabase
        .from("cotacoes")
        .select("*")
        .order("ordem", { ascending: true })
      if (data) setCotacoes(data.map(mapCotacao))
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    if (!produtor) {
      setIsLoadingData(false)
      return
    }

    fetchCotacoes()

    const channel = supabase
      .channel("cotacoes-agricultor")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cotacoes" },
        () => fetchCotacoes()
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

  if (!produtor) {
    return <LoginScreen onLogin={setProdutor} />
  }

  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: "cotacoes", label: "Cotações", Icon: BarChart3 },
    { id: "produtos", label: "Produtos", Icon: Package },
    { id: "perfil", label: "Perfil", Icon: User },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-card/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/infinity-logo.png" alt="Infinity" className="h-7 w-auto brightness-0 invert" />
            <div className="h-5 w-px bg-border" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground">CotaAgrícola</h1>
              <p className="text-xs text-muted-foreground">{produtor.nome}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="mr-1.5 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <img src="/images/infinity-logo.png" alt="Loading" className="h-8 w-auto animate-pulse brightness-0 invert" />
          </div>
        ) : (
          <>
            {activeTab === "cotacoes" && <TabCotacoes cotacoes={cotacoes} produtor={produtor} />}
            {activeTab === "produtos" && <TabProdutos cotacoes={cotacoes} produtor={produtor} onRefresh={fetchCotacoes} />}
            {activeTab === "perfil" && <TabPerfil produtor={produtor} setProdutor={setProdutor} />}
          </>
        )}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/50 bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-around py-2">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${
                activeTab === id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
