// ==========================================
// FLAMAR COLCHÕES - ERP & E-COMMERCE TYPES
// ==========================================

export type AppEnvironment = 'storefront' | 'erp';

export type ErpSection =
  | 'dashboard'
  | 'pdv'
  | 'cashflow'
  | 'payables'
  | 'receivables'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'suppliers'
  | 'dre'
  | 'settings';

export type ProductCategory =
  | 'todos'
  | 'colchoes'
  | 'cama_box'
  | 'box_bau'
  | 'luckspuma'
  | 'castor'
  | 'fa_maringa'
  | 'casal'
  | 'solteiro'
  | 'queen';

export interface Product {
  id: string;
  sige_id: string;
  sku: string;
  name: string;
  brand: 'Luckspuma' | 'Castor' | 'FA Maringá' | 'Ícaro' | 'Liderflex' | 'Flamar';
  category: ProductCategory;
  tags: ProductCategory[];
  dimensions: string; // ex: '138x188x34cm'
  size_label: 'Solteiro (88x188)' | 'Casal (138x188)' | 'Queen (158x198)';
  density_or_spring: string; // ex: 'Molas Ensacadas Pocket', 'Espuma D33 Certificada', 'Box Baú Blindado c/ Pistão a Gás'
  max_weight_kg?: number;
  price: number;          // Preço tabela (10x sem juros)
  cash_price: number;     // Preço à vista (-5%)
  cost_price: number;     // Preço de custo de fábrica (para DRE/Margem)
  on_consultation?: boolean;
  stock_qty: number;
  min_stock: number;
  image_url: string;
  gallery: string[];
  short_description: string;
  full_description: string;
  certifications: string[];
  warranty_months: number;
  is_featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type CashTransactionType = 'entrada' | 'saida';

export type PaymentMethod =
  | 'pix'
  | 'cartao_credito_10x'
  | 'cartao_debito'
  | 'dinheiro'
  | 'boleto_faturado'
  | 'transferencia_ted';

export interface CashTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: CashTransactionType;
  category:
    | 'Venda Loja Física'
    | 'Venda Catálogo Digital'
    | 'Recebimento Parcela'
    | 'Fornecedor de Colchões'
    | 'Frete & Logística'
    | 'Aluguel & IPTU'
    | 'Energia / Água / Internet'
    | 'Folha & Comissões'
    | 'Impostos / DAS'
    | 'Outras Despesas';
  description: string;
  amount: number;
  payment_method: PaymentMethod;
  account: 'Caixa Loja (Rua Jotacá)' | 'Conta Corrente Empresarial' | 'Asaas / PIX Digital';
  reference_id?: string; // Pedido ou Conta vinculada
  operator: string;
}

export type BillStatus = 'pendente' | 'pago' | 'atrasado';

export interface PayableAccount {
  id: string;
  supplier_name: string;
  document_number: string;
  category:
    | 'Fornecedor de Colchões'
    | 'Frete & Combustível'
    | 'Aluguel & Encargos'
    | 'Energia / Telecom'
    | 'Folha & Comissões'
    | 'Impostos & Tributos'
    | 'Marketing & Sistema';
  description: string;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  amount: number;
  status: BillStatus;
  payment_method: PaymentMethod;
  notes?: string;
}

export interface ReceivableAccount {
  id: string;
  customer_name: string;
  customer_phone: string;
  order_id: string;
  installment_label: string; // ex: '1/10', 'À Vista PIX'
  due_date: string;
  received_date?: string;
  amount: number;
  status: 'a_receber' | 'recebido' | 'atrasado';
  payment_method: PaymentMethod;
}

export type OrderDeliveryStatus =
  | 'aguardando_separacao'
  | 'em_conferencia_galpao'
  | 'em_rota_entrega'
  | 'entregue'
  | 'retirada_balcao'
  | 'cancelado';

export interface ErpOrder {
  id: string; // ex: 'FLM-2026-001'
  created_at: string;
  channel: 'Balcão (Rua Jotacá)' | 'Catálogo Online' | 'WhatsApp Direto';
  customer_name: string;
  customer_phone: string;
  customer_cpf_cnpj?: string;
  customer_cep: string;
  customer_address: string;
  customer_neighborhood: string;
  customer_city: string;
  items: {
    product_id: string;
    sku: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    cost_price: number;
    subtotal: number;
  }[];
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  payment_method: PaymentMethod;
  installments: number;
  payment_status: 'pago' | 'pendente' | 'parcial';
  delivery_status: OrderDeliveryStatus;
  scheduled_delivery_date?: string;
  driver_notes?: string;
  seller_name: string;
}

export interface CustomerRecord {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  cpf_cnpj?: string;
  cep: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  notes?: string;
  created_at: string;
}

export interface SupplierRecord {
  id: string;
  corporate_name: string;
  trade_name: string;
  cnpj: string;
  brand_represented: string;
  contact_name: string;
  phone: string;
  email: string;
  city_uf: string;
  payment_terms: string;
  lead_time_days: number;
}
