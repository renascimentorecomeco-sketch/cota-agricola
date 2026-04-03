// ============================
// Database Types (Supabase)
// ============================

export interface Database {
  public: {
    Tables: {
      cotacoes: {
        Row: CotacaoRow
        Insert: Omit<CotacaoRow, "id" | "created_at">
        Update: Partial<Omit<CotacaoRow, "id" | "created_at">>
      }
      produtores: {
        Row: ProdutorRow
        Insert: Omit<ProdutorRow, "id" | "created_at">
        Update: Partial<Omit<ProdutorRow, "id" | "created_at">>
      }
      noticias: {
        Row: NoticiaRow
        Insert: Omit<NoticiaRow, "id" | "created_at">
        Update: Partial<Omit<NoticiaRow, "id" | "created_at">>
      }
    }
    Functions: {
      atualizar_preco: {
        Args: {
          p_cotacao_id: string
          p_novo_preco: number
          p_produtor_id: string
          p_produtor_nome: string
        }
        Returns: void
      }
    }
  }
}

// ============================
// Row types (snake_case do banco)
// ============================

export interface CotacaoRow {
  id: string
  produto: string
  preco_atual: number
  preco_anterior: number | null
  variacao: number
  produtor_id: string | null
  produtor_nome: string
  produtor_logo: string | null
  unidade: string
  icone: string
  ordem: number
  ultima_atualizacao: string
  created_at: string
}

export interface ProdutorRow {
  id: string
  nome: string
  codigo: string
  logo_url: string | null
  ativo: boolean
  created_at: string
}

export interface NoticiaRow {
  id: string
  texto: string
  ativa: boolean
  created_at: string
}

// ============================
// Frontend types (camelCase)
// ============================

export interface Cotacao {
  id: string
  produto: string
  precoAtual: number
  precoAnterior: number | null
  variacao: number
  produtorId: string | null
  produtorNome: string
  produtorLogo: string | null
  unidade: string
  icone: string
  ordem: number
  ultimaAtualizacao: string
}

export interface Produtor {
  id: string
  nome: string
  logoUrl: string | null
}

export interface Noticia {
  id: string
  texto: string
}

// ============================
// Mappers (banco → frontend)
// ============================

export function mapCotacao(row: CotacaoRow): Cotacao {
  return {
    id: row.id,
    produto: row.produto,
    precoAtual: Number(row.preco_atual),
    precoAnterior: row.preco_anterior ? Number(row.preco_anterior) : null,
    variacao: Number(row.variacao),
    produtorId: row.produtor_id,
    produtorNome: row.produtor_nome,
    produtorLogo: row.produtor_logo || null,
    unidade: row.unidade,
    icone: row.icone,
    ordem: row.ordem,
    ultimaAtualizacao: row.ultima_atualizacao,
  }
}

export function mapNoticia(row: NoticiaRow): Noticia {
  return {
    id: row.id,
    texto: row.texto,
  }
}
