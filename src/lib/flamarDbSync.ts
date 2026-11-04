import { supabase } from './supabase';
import { Product, CustomerRecord, ErpOrder, CashTransaction, PayableAccount, ReceivableAccount, SupplierRecord, VisitRecord } from '../types/database';
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

// 6. VISITAS
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
