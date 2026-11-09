-- ==============================================================================
-- SCHEMA SUPABASE: FLAMAR COLCHÕES & BOX (Prefix: flamar_)
-- ==============================================================================
-- Executar no SQL Editor do projeto Supabase (https://supabase.com/dashboard/project/bvijihrulhxagnvqudaw/sql)
-- Todas as tabelas utilizam o prefixo flamar_
-- Políticas RLS permissivas para frontend com anon key (padrão LMA / Bertoni)
-- ==============================================================================

-- Extensão UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABELA DE PRODUTOS & ESTOQUE
CREATE TABLE IF NOT EXISTS flamar_produtos (
  id TEXT PRIMARY KEY,
  sige_id TEXT,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  dimensions TEXT NOT NULL,
  size_label TEXT NOT NULL,
  density_or_spring TEXT,
  max_weight_kg NUMERIC,
  price NUMERIC(10,2) NOT NULL,
  cash_price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  on_consultation BOOLEAN DEFAULT FALSE,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 2,
  image_url TEXT NOT NULL,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  short_description TEXT,
  full_description TEXT,
  certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  warranty_months INTEGER DEFAULT 12,
  is_featured BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flamar_produtos_categoria ON flamar_produtos(category);
CREATE INDEX IF NOT EXISTS idx_flamar_produtos_marca ON flamar_produtos(brand);
CREATE INDEX IF NOT EXISTS idx_flamar_produtos_sku ON flamar_produtos(sku);

-- 2. TABELA DE PEDIDOS & VENDAS (ERP & Loja)
CREATE TABLE IF NOT EXISTS flamar_pedidos (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_cpf_cnpj TEXT,
  customer_cep TEXT,
  customer_address TEXT,
  customer_neighborhood TEXT,
  customer_city TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  installments INTEGER NOT NULL DEFAULT 1,
  payment_status TEXT NOT NULL DEFAULT 'pago',
  delivery_status TEXT NOT NULL DEFAULT 'retirada_balcao',
  scheduled_delivery_date TEXT,
  driver_notes TEXT,
  seller_name TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flamar_pedidos_cliente ON flamar_pedidos(customer_phone);
CREATE INDEX IF NOT EXISTS idx_flamar_pedidos_data ON flamar_pedidos(created_at);

-- 3. TABELA DE CLIENTES (100% Genuínos)
CREATE TABLE IF NOT EXISTS flamar_clientes (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  cpf_cnpj TEXT,
  cep TEXT,
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT DEFAULT 'SP',
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_order_date TEXT,
  last_payment_method TEXT,
  last_products TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flamar_clientes_telefone ON flamar_clientes(phone);

-- 4. TABELA DE FORNECEDORES
CREATE TABLE IF NOT EXISTS flamar_fornecedores (
  id TEXT PRIMARY KEY,
  corporate_name TEXT NOT NULL,
  trade_name TEXT NOT NULL,
  cnpj TEXT,
  brand_represented TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  city_uf TEXT,
  payment_terms TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABELA DE FLUXO DE CAIXA
CREATE TABLE IF NOT EXISTS flamar_fluxo_caixa (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  account TEXT NOT NULL,
  reference_id TEXT,
  operator TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flamar_fluxo_data ON flamar_fluxo_caixa(date);

-- 6. TABELA DE CONTAS A PAGAR
CREATE TABLE IF NOT EXISTS flamar_contas_pagar (
  id TEXT PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  document_number TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  paid_date TEXT,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  payment_method TEXT NOT NULL,
  notes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flamar_contas_pagar_venc ON flamar_contas_pagar(due_date);

-- 7. TABELA DE CONTAS A RECEBER
CREATE TABLE IF NOT EXISTS flamar_contas_receber (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  order_id TEXT,
  installment_label TEXT,
  due_date TEXT NOT NULL,
  received_date TEXT,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'a_receber',
  payment_method TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flamar_contas_rec_venc ON flamar_contas_receber(due_date);

-- 8. TABELA DE VISITAS & ANALYTICS
CREATE TABLE IF NOT EXISTS flamar_visitas (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date TEXT NOT NULL,
  month TEXT NOT NULL,
  hour INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL,
  path TEXT NOT NULL DEFAULT '/',
  referrer TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_flamar_visitas_data ON flamar_visitas(date);
CREATE INDEX IF NOT EXISTS idx_flamar_visitas_mes ON flamar_visitas(month);

-- ==============================================================================
-- BUCKET DE STORAGE PARA FOTOS DOS PRODUTOS: flamar-colchoes
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'flamar-colchoes',
  'flamar-colchoes',
  true,
  10485760, -- 10MB
  ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];

-- Políticas de Storage para bucket flamar-colchoes
DROP POLICY IF EXISTS "Flamar Storage Acesso Publico Leitura" ON storage.objects;
CREATE POLICY "Flamar Storage Acesso Publico Leitura"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'flamar-colchoes');

DROP POLICY IF EXISTS "Flamar Storage Insercao Publica" ON storage.objects;
CREATE POLICY "Flamar Storage Insercao Publica"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'flamar-colchoes');

DROP POLICY IF EXISTS "Flamar Storage Atualizacao Publica" ON storage.objects;
CREATE POLICY "Flamar Storage Atualizacao Publica"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'flamar-colchoes');

DROP POLICY IF EXISTS "Flamar Storage Delecao Publica" ON storage.objects;
CREATE POLICY "Flamar Storage Delecao Publica"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'flamar-colchoes');

-- ==============================================================================
-- HABILITAR RLS COM POLÍTICAS DE ACESSO TOTAL (PADRÃO LMA ANON KEY)
-- ==============================================================================
ALTER TABLE flamar_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE flamar_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE flamar_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flamar_fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE flamar_fluxo_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE flamar_contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE flamar_contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE flamar_visitas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total flamar_produtos" ON flamar_produtos;
CREATE POLICY "Acesso total flamar_produtos" ON flamar_produtos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total flamar_pedidos" ON flamar_pedidos;
CREATE POLICY "Acesso total flamar_pedidos" ON flamar_pedidos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total flamar_clientes" ON flamar_clientes;
CREATE POLICY "Acesso total flamar_clientes" ON flamar_clientes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total flamar_fornecedores" ON flamar_fornecedores;
CREATE POLICY "Acesso total flamar_fornecedores" ON flamar_fornecedores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total flamar_fluxo_caixa" ON flamar_fluxo_caixa;
CREATE POLICY "Acesso total flamar_fluxo_caixa" ON flamar_fluxo_caixa FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total flamar_contas_pagar" ON flamar_contas_pagar;
CREATE POLICY "Acesso total flamar_contas_pagar" ON flamar_contas_pagar FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total flamar_contas_receber" ON flamar_contas_receber;
CREATE POLICY "Acesso total flamar_contas_receber" ON flamar_contas_receber FOR ALL USING (true) WITH CHECK (true);

-- 9. TABELA DE CLIQUES EM PRODUTOS (PRODUTOS MAIS CLICADOS / TELEMETRIA)
CREATE TABLE IF NOT EXISTS flamar_cliques (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'view_details',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_flamar_cliques_prod ON flamar_cliques(product_id);
CREATE INDEX IF NOT EXISTS idx_flamar_cliques_data ON flamar_cliques(date);

-- 10. TABELA DE LEADS & ORÇAMENTOS (CRM COMERCIAL CHATBOT LEADSTER)
CREATE TABLE IF NOT EXISTS flamar_leads (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  cep TEXT,
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'novo',
  product_id TEXT,
  product_name TEXT,
  sku TEXT,
  size_label TEXT,
  dimensions TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cash_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method_preference TEXT,
  biotype_weight TEXT,
  biotype_height TEXT,
  sleeping_position TEXT,
  back_pain TEXT,
  chat_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  converted_order_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_flamar_leads_status ON flamar_leads(status);
CREATE INDEX IF NOT EXISTS idx_flamar_leads_phone ON flamar_leads(phone);

-- 11. TABELA DE POSTS DO BLOG FLAMAR
CREATE TABLE IF NOT EXISTS flamar_blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  read_time_minutes INTEGER NOT NULL DEFAULT 4,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TEXT NOT NULL,
  views_count INTEGER NOT NULL DEFAULT 0
);

-- 12. TABELA DE CONFIGURAÇÕES GERAIS (WhatsApp Comercial, etc.)
CREATE TABLE IF NOT EXISTS flamar_configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir o WhatsApp padrão se não existir
INSERT INTO flamar_configuracoes (chave, valor)
VALUES 
  ('whatsapp_number', '5511942239108'),
  ('whatsapp_display', '(11) 94223-9108')
ON CONFLICT (chave) DO NOTHING;

ALTER TABLE flamar_cliques ENABLE ROW LEVEL SECURITY;
ALTER TABLE flamar_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE flamar_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE flamar_configuracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total flamar_cliques" ON flamar_cliques;
CREATE POLICY "Acesso total flamar_cliques" ON flamar_cliques FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total flamar_leads" ON flamar_leads;
CREATE POLICY "Acesso total flamar_leads" ON flamar_leads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total flamar_blog_posts" ON flamar_blog_posts;
CREATE POLICY "Acesso total flamar_blog_posts" ON flamar_blog_posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total flamar_configuracoes" ON flamar_configuracoes;
CREATE POLICY "Acesso total flamar_configuracoes" ON flamar_configuracoes FOR ALL USING (true) WITH CHECK (true);
