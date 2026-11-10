import { supabase } from './supabase';
import {
  Product,
  CustomerRecord,
  ErpOrder,
  CashTransaction,
  PayableAccount,
  ReceivableAccount,
  SupplierRecord,
  VisitRecord,
  ProductClickRecord,
  LeadRecord,
  BlogPost
} from '../types/database';
import { FLAMAR_AUTHENTIC_PRODUCTS, FLAMAR_AUTHENTIC_SUPPLIERS } from './flamarCatalog';

/**
 * Serviço de sincronização híbrida com o Supabase (Prefix: flamar_)
 * - Carrega do Supabase; se o banco estiver vazio ou offline, utiliza o fallback local.
 * - Salva no Supabase e mantém o localStorage sincronizado para navegação ultra-rápida.
 */

// 1. PRODUTOS
export async function carregarProdutosSupabase(): Promise<Product[] | null> {
  try {
    const { data, error } = await supabase
      .from('flamar_produtos')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.warn('[Flamar Supabase] Aviso ao buscar produtos:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        sige_id: row.sige_id || '',
        sku: row.sku,
        name: row.name,
        brand: row.brand,
        category: row.category,
        tags: Array.isArray(row.tags) ? row.tags : [],
        dimensions: row.dimensions,
        size_label: row.size_label,
        density_or_spring: row.density_or_spring || '',
        max_weight_kg: row.max_weight_kg ? Number(row.max_weight_kg) : undefined,
        price: Number(row.price),
        cash_price: Number(row.cash_price),
        cost_price: Number(row.cost_price || 0),
        on_consultation: Boolean(row.on_consultation),
        stock_qty: Number(row.stock_qty || 0),
        min_stock: Number(row.min_stock || 2),
        image_url: row.image_url,
        gallery: Array.isArray(row.gallery) ? row.gallery : [row.image_url],
        short_description: row.short_description || '',
        full_description: row.full_description || '',
        certifications: Array.isArray(row.certifications) ? row.certifications : [],
        warranty_months: Number(row.warranty_months || 12),
        is_featured: Boolean(row.is_featured)
      }));
    }

    // Se a tabela no Supabase estiver vazia, faz o seed inicial com os produtos autênticos da Flamar
    console.info('[Flamar Supabase] Tabela flamar_produtos vazia. Realizando seed inicial...');
    const rows = FLAMAR_AUTHENTIC_PRODUCTS.map(p => ({
      id: p.id,
      sige_id: p.sige_id,
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      category: p.category,
      tags: p.tags,
      dimensions: p.dimensions,
      size_label: p.size_label,
      density_or_spring: p.density_or_spring,
      max_weight_kg: p.max_weight_kg,
      price: p.price,
      cash_price: p.cash_price,
      cost_price: p.cost_price,
      on_consultation: p.on_consultation || false,
      stock_qty: p.stock_qty,
      min_stock: p.min_stock,
      image_url: p.image_url,
      gallery: p.gallery,
      short_description: p.short_description,
      full_description: p.full_description,
      certifications: p.certifications,
      warranty_months: p.warranty_months,
      is_featured: p.is_featured || false
    }));

    await supabase.from('flamar_produtos').upsert(rows);
    return FLAMAR_AUTHENTIC_PRODUCTS;
  } catch (err) {
    console.warn('[Flamar Supabase] Falha de conexão ao carregar produtos:', err);
    return null;
  }
}

export async function salvarProdutoSupabase(p: Product): Promise<void> {
  try {
    const payload = {
      id: p.id,
      sige_id: p.sige_id,
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      category: p.category,
      tags: p.tags,
      dimensions: p.dimensions,
      size_label: p.size_label,
      density_or_spring: p.density_or_spring,
      max_weight_kg: p.max_weight_kg,
      price: p.price,
      cash_price: p.cash_price,
      cost_price: p.cost_price,
      on_consultation: p.on_consultation || false,
      stock_qty: p.stock_qty,
      min_stock: p.min_stock,
      image_url: p.image_url,
      gallery: p.gallery,
      short_description: p.short_description,
      full_description: p.full_description,
      certifications: p.certifications,
      warranty_months: p.warranty_months,
      is_featured: p.is_featured || false,
      atualizado_em: new Date().toISOString()
    };
    const { error } = await supabase.from('flamar_produtos').upsert(payload);
    if (error) console.error('[Flamar Supabase] Erro ao salvar produto:', error.message);
  } catch (err) {
    console.error('[Flamar Supabase] Exceção ao salvar produto:', err);
  }
}

// 2. PEDIDOS
export async function carregarPedidosSupabase(): Promise<ErpOrder[] | null> {
  try {
    const { data, error } = await supabase
      .from('flamar_pedidos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) return null;
    return (data || []).map((row: any) => ({
      id: row.id,
      created_at: row.created_at,
      channel: row.channel,
      customer_name: row.customer_name,
      customer_phone: row.customer_phone,
      customer_cpf_cnpj: row.customer_cpf_cnpj,
      customer_cep: row.customer_cep,
      customer_address: row.customer_address,
      customer_neighborhood: row.customer_neighborhood,
      customer_city: row.customer_city,
      items: Array.isArray(row.items) ? row.items : [],
      subtotal: Number(row.subtotal),
      discount: Number(row.discount),
      shipping_fee: Number(row.shipping_fee),
      total: Number(row.total),
      payment_method: row.payment_method,
      installments: Number(row.installments || 1),
      payment_status: row.payment_status,
      delivery_status: row.delivery_status,
      scheduled_delivery_date: row.scheduled_delivery_date,
      driver_notes: row.driver_notes,
      seller_name: row.seller_name
    }));
  } catch {
    return null;
  }
}

export async function salvarPedidoSupabase(o: ErpOrder): Promise<void> {
  try {
    await supabase.from('flamar_pedidos').upsert(o);
  } catch (err) {
    console.error('[Flamar Supabase] Erro ao salvar pedido:', err);
  }
}

// 3. CLIENTES (100% Genuínos)
export async function carregarClientesSupabase(): Promise<CustomerRecord[] | null> {
  try {
    const { data, error } = await supabase
      .from('flamar_clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return null;
    return (data || []).map((row: any) => ({
      id: row.id,
      full_name: row.full_name,
      phone: row.phone,
      email: row.email,
      cpf_cnpj: row.cpf_cnpj,
      cep: row.cep,
      address: row.address,
      neighborhood: row.neighborhood,
      city: row.city,
      state: row.state || 'SP',
      total_orders: Number(row.total_orders || 0),
      total_spent: Number(row.total_spent || 0),
      last_order_date: row.last_order_date,
      last_payment_method: row.last_payment_method,
      last_products: row.last_products,
      notes: row.notes,
      created_at: row.created_at
    }));
  } catch {
    return null;
  }
}

export async function salvarClienteSupabase(c: CustomerRecord): Promise<void> {
  try {
    await supabase.from('flamar_clientes').upsert(c);
  } catch (err) {
    console.error('[Flamar Supabase] Erro ao salvar cliente:', err);
  }
}

// 4. FORNECEDORES
export async function carregarFornecedoresSupabase(): Promise<SupplierRecord[] | null> {
  try {
    const { data, error } = await supabase
      .from('flamar_fornecedores')
      .select('*');

    if (error) return null;
    if (data && data.length > 0) {
      return data;
    }
    // Seed fornecedores iniciais
    await supabase.from('flamar_fornecedores').upsert(FLAMAR_AUTHENTIC_SUPPLIERS);
    return FLAMAR_AUTHENTIC_SUPPLIERS;
  } catch {
    return null;
  }
}

// 5. FLUXO DE CAIXA
export async function salvarFluxoCaixaSupabase(tx: CashTransaction): Promise<void> {
  try {
    await supabase.from('flamar_fluxo_caixa').upsert(tx);
  } catch (err) {
    console.error('[Flamar Supabase] Erro ao salvar fluxo de caixa:', err);
  }
}

// 6. VISITAS (Carregar e Salvar no Supabase)
export async function carregarVisitasSupabase(): Promise<VisitRecord[] | null> {
  try {
    const { data, error } = await supabase
      .from('flamar_visitas')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5000);

    if (error || !data) return null;
    return data.map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      date: row.date,
      month: row.month,
      hour: row.hour,
      dayOfWeek: row.day_of_week ?? row.dayOfWeek ?? 0,
      path: row.path || '/',
      referrer: row.referrer || 'Direto',
      userAgent: row.user_agent || row.userAgent || ''
    }));
  } catch {
    return null;
  }
}

export async function salvarVisitaSupabase(v: VisitRecord): Promise<void> {
  try {
    await supabase.from('flamar_visitas').insert({
      id: v.id,
      timestamp: v.timestamp,
      date: v.date,
      month: v.month,
      hour: v.hour,
      day_of_week: v.dayOfWeek,
      path: v.path,
      referrer: v.referrer,
      user_agent: v.userAgent
    });
  } catch (err) {
    console.error('[Flamar Supabase] Erro ao salvar visita:', err);
  }
}

// 7. CLIQUES EM PRODUTOS (Mais Clicados / Populares no Supabase)
export async function carregarCliquesSupabase(): Promise<ProductClickRecord[] | null> {
  try {
    const { data, error } = await supabase
      .from('flamar_cliques')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10000);

    if (error || !data) return null;
    return data.map((row: any) => ({
      id: row.id,
      productId: row.product_id || row.productId,
      productName: row.product_name || row.productName,
      category: row.category,
      action: row.action,
      timestamp: row.timestamp,
      date: row.date
    }));
  } catch {
    return null;
  }
}

export async function salvarCliqueSupabase(c: ProductClickRecord): Promise<void> {
  try {
    await supabase.from('flamar_cliques').insert({
      id: c.id,
      product_id: c.productId,
      product_name: c.productName,
      category: c.category,
      action: c.action,
      timestamp: c.timestamp,
      date: c.date
    });
  } catch (err) {
    console.error('[Flamar Supabase] Erro ao salvar clique:', err);
  }
}

// 8. LEADS COMERCIAIS (CRM Chatbot no Supabase)
export async function carregarLeadsSupabase(): Promise<LeadRecord[] | null> {
  try {
    const { data, error } = await supabase
      .from('flamar_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function salvarLeadSupabase(l: LeadRecord): Promise<void> {
  try {
    await supabase.from('flamar_leads').upsert(l);
  } catch (err) {
    console.error('[Flamar Supabase] Erro ao salvar lead:', err);
  }
}

// 9. BLOG POSTS (Supabase)
export async function carregarBlogPostsSupabase(): Promise<BlogPost[] | null> {
  try {
    const { data, error } = await supabase
      .from('flamar_blog_posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) return null;
    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      content: row.content,
      category: row.category,
      author: row.author,
      readTimeMinutes: row.read_time_minutes ?? row.readTimeMinutes ?? 4,
      imageUrl: row.image_url ?? row.imageUrl,
      published: row.published ?? true,
      publishedAt: row.published_at ?? row.publishedAt,
      viewsCount: row.views_count ?? row.viewsCount ?? 0
    }));
  } catch {
    return null;
  }
}

export async function salvarBlogPostSupabase(post: BlogPost): Promise<void> {
  try {
    await supabase.from('flamar_blog_posts').upsert({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      category: post.category,
      author: post.author,
      read_time_minutes: post.readTimeMinutes,
      image_url: post.imageUrl,
      published: post.published,
      published_at: post.publishedAt,
      views_count: post.viewsCount
    });
  } catch (err) {
    console.error('[Flamar Supabase] Erro ao salvar post blog:', err);
  }
}

// 10. CONFIGURAÇÕES GERAIS (WhatsApp, Contato, Empresa no Supabase)
export interface FlamarConfiguracoes {
  whatsapp_number: string; // ex: 5511942239108
  whatsapp_display: string; // ex: (11) 94223-9108
  usuarios_json?: string; // JSON serializado de UserAccount[]
}

export async function carregarConfiguracoesSupabase(): Promise<FlamarConfiguracoes | null> {
  try {
    const { data, error } = await supabase
      .from('flamar_configuracoes')
      .select('chave, valor');

    if (error || !data || data.length === 0) return null;
    const configMap: Record<string, string> = {};
    data.forEach((row: any) => {
      configMap[row.chave] = row.valor;
    });

    if (configMap['whatsapp_number'] || configMap['usuarios_json']) {
      return {
        whatsapp_number: configMap['whatsapp_number'] || '5511942239108',
        whatsapp_display: configMap['whatsapp_display'] || '(11) 94223-9108',
        usuarios_json: configMap['usuarios_json']
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function salvarConfiguracoesSupabase(cfg: FlamarConfiguracoes): Promise<void> {
  try {
    const rows = [
      { chave: 'whatsapp_number', valor: cfg.whatsapp_number, atualizado_em: new Date().toISOString() },
      { chave: 'whatsapp_display', valor: cfg.whatsapp_display, atualizado_em: new Date().toISOString() }
    ];
    if (cfg.usuarios_json !== undefined) {
      rows.push({ chave: 'usuarios_json', valor: cfg.usuarios_json, atualizado_em: new Date().toISOString() });
    }
    await supabase.from('flamar_configuracoes').upsert(rows, { onConflict: 'chave' });
  } catch (err) {
    console.error('[Flamar Supabase] Erro ao salvar configuracoes:', err);
  }
}
