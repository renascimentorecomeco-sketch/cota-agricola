-- ============================================
-- CotaAgrícola — Setup Completo do Supabase
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- 1. TABELA DE PRODUTORES
create table if not exists produtores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  codigo text not null,  -- PIN de 4 dígitos
  ativo boolean default true,
  created_at timestamptz default now()
);

create unique index if not exists idx_produtores_nome_codigo on produtores(nome, codigo);
create index if not exists idx_produtores_ativo on produtores(ativo);

-- 2. TABELA DE COTAÇÕES
create table if not exists cotacoes (
  id uuid primary key default gen_random_uuid(),
  produto text not null,
  preco_atual numeric(12,2) not null default 0,
  preco_anterior numeric(12,2),
  variacao numeric(8,2) default 0,
  produtor_id uuid references produtores(id) on delete set null,
  produtor_nome text not null default '',
  unidade text not null,
  icone text default 'leaf',  -- nome do ícone lucide (coffee, flame, wheat, etc.)
  ordem int default 0,        -- ordem de exibição no carrossel
  ultima_atualizacao timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists idx_cotacoes_ordem on cotacoes(ordem);
create index if not exists idx_cotacoes_produtor on cotacoes(produtor_id);

-- 3. TABELA DE NOTÍCIAS (ticker do rodapé)
-- Alimentada automaticamente via API /api/noticias que puxa RSS de portais agro
create table if not exists noticias (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  ativa boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_noticias_ativa on noticias(ativa);
create index if not exists idx_noticias_created on noticias(created_at desc);

-- 4. FUNCTION: Atualizar preço com cálculo automático de variação
create or replace function atualizar_preco(
  p_cotacao_id uuid,
  p_novo_preco numeric,
  p_produtor_id uuid,
  p_produtor_nome text
)
returns void as $$
declare
  v_preco_atual numeric;
begin
  select preco_atual into v_preco_atual
  from cotacoes where id = p_cotacao_id;

  update cotacoes set
    preco_anterior = v_preco_atual,
    preco_atual = p_novo_preco,
    variacao = case
      when v_preco_atual > 0 then round(((p_novo_preco - v_preco_atual) / v_preco_atual) * 100, 2)
      else 0
    end,
    produtor_id = p_produtor_id,
    produtor_nome = p_produtor_nome,
    ultima_atualizacao = now()
  where id = p_cotacao_id;
end;
$$ language plpgsql security definer;

-- 5. ROW LEVEL SECURITY
alter table produtores enable row level security;
alter table cotacoes enable row level security;
alter table noticias enable row level security;

-- Leitura pública (TV e agricultor leem sem auth)
create policy "Leitura pública de cotacoes" on cotacoes
  for select using (true);

create policy "Leitura pública de noticias" on noticias
  for select using (true);

create policy "Leitura pública de produtores" on produtores
  for select using (true);

-- Permitir update de cotacoes via anon (agricultor atualiza preço)
create policy "Atualização de cotacoes" on cotacoes
  for update using (true);

-- Permitir insert/update/delete de noticias via service_role (API de sync)
create policy "Gerenciamento de noticias via service" on noticias
  for all using (true);

-- 6. ATIVAR REALTIME
alter publication supabase_realtime add table cotacoes;
alter publication supabase_realtime add table noticias;

-- 7. SEED: Produtores
insert into produtores (nome, codigo) values
  ('Fazenda São João', '1234'),
  ('Sítio Boa Vista', '5678'),
  ('Fazenda Esperança', '1111'),
  ('Cooperativa Sul', '2222'),
  ('Agro Norte', '3333'),
  ('Fazenda Altitude', '4444');

-- 8. SEED: 12 Cotações iniciais
insert into cotacoes (produto, preco_atual, preco_anterior, variacao, produtor_nome, unidade, icone, ordem) values
  ('Café Conilon',     1250.00, 1219.51, 2.50,  'Fazenda São João',    'Saca 60kg',     'coffee',     1),
  ('Pimenta-do-Reino', 48.50,   49.09,   -1.20, 'Sítio Boa Vista',     'kg',            'flame',      2),
  ('Cacau',            320.00,  317.46,  0.80,   'Fazenda Esperança',   'Arroba',        'bean',       3),
  ('Soja',             145.00,  145.00,  0.00,   'Cooperativa Sul',     'Saca 60kg',     'wheat',      4),
  ('Milho',            72.50,   71.22,   1.80,   'Agro Norte',          'Saca 60kg',     'wheat',      5),
  ('Café Arábica',     1480.00, 1434.11, 3.20,   'Fazenda Altitude',    'Saca 60kg',     'coffee',     6),
  ('Algodão',          135.00,  135.68,  -0.50,  'Fazenda Fibra',       'Arroba',        'cloud',      7),
  ('Feijão Carioca',   280.00,  286.01,  -2.10,  'Sítio Grãos',        'Saca 60kg',     'circle-dot', 8),
  ('Arroz',            98.00,   97.71,   0.30,   'Arrozeira Delta',     'Saca 50kg',     'wheat',      9),
  ('Laranja',          32.00,   30.62,   4.50,   'Citrus Vale',         'Caixa 40.8kg',  'apple',      10),
  ('Cana-de-Açúcar',   125.00,  125.00,  0.00,   'Usina Central',       'Tonelada',      'leaf',       11),
  ('Mandioca',         450.00,  456.85,  -1.50,  'Raízes do Sul',       'Tonelada',      'leaf',       12);

-- 9. SEED: Notícias temporárias (serão substituídas pelo sync automático via /api/noticias)
insert into noticias (texto) values
  ('Café arábica atinge maior valor dos últimos 12 meses na bolsa de NY'),
  ('Safra de pimenta-do-reino deve aumentar 15% este ano no ES'),
  ('Governo anuncia novo programa de financiamento para pequenos produtores'),
  ('Exportações de café brasileiro crescem 8% no primeiro trimestre'),
  ('Preço da soja se estabiliza após semanas de volatilidade'),
  ('Chuvas no Sul beneficiam safra de milho da região');
