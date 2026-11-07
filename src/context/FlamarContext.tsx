import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppEnvironment,
  ErpSection,
  Product,
  ProductCategory,
  CartItem,
  CashTransaction,
  PayableAccount,
  ReceivableAccount,
  ErpOrder,
  CustomerRecord,
  SupplierRecord,
  VisitRecord,
  ProductClickRecord,
  BlogPost,
  LeadRecord,
  LeadStatus,
  PaymentMethod,
  OrderDeliveryStatus
} from '../types/database';
import { FLAMAR_AUTHENTIC_PRODUCTS, FLAMAR_AUTHENTIC_SUPPLIERS } from '../lib/flamarCatalog';
import { INITIAL_BLOG_POSTS } from '../lib/flamarBlogData';
import {
  carregarProdutosSupabase,
  salvarProdutoSupabase,
  carregarClientesSupabase,
  salvarClienteSupabase,
  carregarPedidosSupabase,
  salvarPedidoSupabase,
  carregarFornecedoresSupabase,
  salvarFluxoCaixaSupabase,
  salvarVisitaSupabase
} from '../lib/flamarDbSync';

interface FlamarContextType {
  environment: AppEnvironment;
  setEnvironment: (env: AppEnvironment) => void;
  erpSection: ErpSection;
  setErpSection: (sec: ErpSection) => void;

  // Catálogo & Filtros
  products: Product[];
  selectedCategory: ProductCategory;
  setSelectedCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedProductModal: Product | null;
  setSelectedProductModal: (p: Product | null) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Carrinho do Cliente
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;

  // Operações de Produtos & Estoque
  upsertProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  adjustStock: (productId: string, delta: number, reason: string) => void;

  // ERP: Pedidos & Vendas (PDV e Online)
  orders: ErpOrder[];
  createOrder: (orderData: Omit<ErpOrder, 'id' | 'created_at'>) => ErpOrder;
  updateOrderDeliveryStatus: (orderId: string, status: OrderDeliveryStatus) => void;
  deleteOrder: (orderId: string) => void;

  // ERP: Fluxo de Caixa
  cashTransactions: CashTransaction[];
  addCashTransaction: (tx: Omit<CashTransaction, 'id'>) => void;
  deleteCashTransaction: (id: string) => void;

  // ERP: Contas a Pagar
  payables: PayableAccount[];
  addPayable: (bill: Omit<PayableAccount, 'id'>) => void;
  markPayableAsPaid: (billId: string, account: CashTransaction['account']) => void;
  deletePayable: (billId: string) => void;

  // ERP: Contas a Receber
  receivables: ReceivableAccount[];
  addReceivable: (rec: Omit<ReceivableAccount, 'id'>) => void;
  markReceivableAsReceived: (recId: string, account: CashTransaction['account']) => void;
  deleteReceivable: (recId: string) => void;

  // ERP: Clientes & Fornecedores (100% Genuínos - Sem dados fictícios)
  customers: CustomerRecord[];
  addCustomer: (cust: Omit<CustomerRecord, 'id' | 'created_at' | 'total_orders' | 'total_spent'>) => CustomerRecord;
  deleteCustomer: (id: string) => void;
  suppliers: SupplierRecord[];
  addSupplier: (sup: Omit<SupplierRecord, 'id'>) => void;
  deleteSupplier: (id: string) => void;

  // Analítica & Contador de Visitas & Cliques
  visits: VisitRecord[];
  recordVisit: (path?: string) => void;
  clearVisits: () => void;
  productClicks: ProductClickRecord[];
  recordProductClick: (product: Product, action?: ProductClickRecord['action']) => void;
  clearProductClicks: () => void;

  // Blog Flamar
  blogPosts: BlogPost[];
  addBlogPost: (post: Omit<BlogPost, 'id' | 'publishedAt'>) => BlogPost;
  updateBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (id: string) => void;

  // CRM / Leads & Orçamentos (Chatbot Comercial)
  leads: LeadRecord[];
  addOrUpdateLead: (lead: LeadRecord) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus, notes?: string) => void;
  deleteLead: (leadId: string) => void;
  convertLeadToOrder: (leadId: string) => ErpOrder | null;
}

const STORAGE_KEYS = {
  PRODUCTS: 'flamar_erp_products_v1',
  ORDERS: 'flamar_erp_orders_v1',
  CASHFLOW: 'flamar_erp_cashflow_v1',
  PAYABLES: 'flamar_erp_payables_v1',
  RECEIVABLES: 'flamar_erp_receivables_v1',
  CUSTOMERS: 'flamar_erp_customers_v1',
  SUPPLIERS: 'flamar_erp_suppliers_v1',
  CART: 'flamar_store_cart_v1',
  VISITS: 'flamar_site_visits_v1',
  PRODUCT_CLICKS: 'flamar_site_product_clicks_v1',
  BLOG_POSTS: 'flamar_blog_posts_v1',
  LEADS: 'flamar_leads_crm_v1',
  LAST_VISIT_SESSION: 'flamar_last_visit_session_v1'
};

const FlamarContext = createContext<FlamarContextType | undefined>(undefined);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const FlamarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [environment, setEnvironment] = useState<AppEnvironment>('storefront');
  const [erpSection, setErpSection] = useState<ErpSection>('inventory');

  const [products, setProducts] = useState<Product[]>(() =>
    loadStorage<Product[]>(STORAGE_KEYS.PRODUCTS, FLAMAR_AUTHENTIC_PRODUCTS)
  );
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() =>
    loadStorage<CartItem[]>(STORAGE_KEYS.CART, [])
  );

  // Zero dados fictícios: tabelas financeiras e de clientes iniciam limpas para lançamentos reais
  const [orders, setOrders] = useState<ErpOrder[]>(() =>
    loadStorage<ErpOrder[]>(STORAGE_KEYS.ORDERS, [])
  );
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() =>
    loadStorage<CashTransaction[]>(STORAGE_KEYS.CASHFLOW, [])
  );
  const [payables, setPayables] = useState<PayableAccount[]>(() =>
    loadStorage<PayableAccount[]>(STORAGE_KEYS.PAYABLES, [])
  );
  const [receivables, setReceivables] = useState<ReceivableAccount[]>(() =>
    loadStorage<ReceivableAccount[]>(STORAGE_KEYS.RECEIVABLES, [])
  );
  const [customers, setCustomers] = useState<CustomerRecord[]>(() =>
    loadStorage<CustomerRecord[]>(STORAGE_KEYS.CUSTOMERS, [])
  );
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(() =>
    loadStorage<SupplierRecord[]>(STORAGE_KEYS.SUPPLIERS, FLAMAR_AUTHENTIC_SUPPLIERS)
  );

  const [visits, setVisits] = useState<VisitRecord[]>(() =>
    loadStorage<VisitRecord[]>(STORAGE_KEYS.VISITS, [])
  );

  const [productClicks, setProductClicks] = useState<ProductClickRecord[]>(() =>
    loadStorage<ProductClickRecord[]>(STORAGE_KEYS.PRODUCT_CLICKS, [])
  );

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() =>
    loadStorage<BlogPost[]>(STORAGE_KEYS.BLOG_POSTS, INITIAL_BLOG_POSTS)
  );

  const [leads, setLeads] = useState<LeadRecord[]>(() =>
    loadStorage<LeadRecord[]>(STORAGE_KEYS.LEADS, [])
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASHFLOW, JSON.stringify(cashTransactions));
  }, [cashTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYABLES, JSON.stringify(payables));
  }, [payables]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECEIVABLES, JSON.stringify(receivables));
  }, [receivables]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCT_CLICKS, JSON.stringify(productClicks));
  }, [productClicks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(blogPosts));
  }, [blogPosts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  }, [leads]);

  // Sincronização inicial com o Supabase ao carregar
  useEffect(() => {
    async function carregarDadosIniciais() {
      const [prodsSupabase, custsSupabase, ordsSupabase, supsSupabase] = await Promise.all([
        carregarProdutosSupabase(),
        carregarClientesSupabase(),
        carregarPedidosSupabase(),
        carregarFornecedoresSupabase()
      ]);

      if (prodsSupabase && prodsSupabase.length > 0) {
        setProducts(prodsSupabase);
      }
      if (custsSupabase && custsSupabase.length > 0) {
        setCustomers(custsSupabase);
      }
      if (ordsSupabase && ordsSupabase.length > 0) {
        setOrders(ordsSupabase);
      }
      if (supsSupabase && supsSupabase.length > 0) {
        setSuppliers(supsSupabase);
      }
    }

    carregarDadosIniciais();
  }, []);

  // Registro de Visita com throttling por sessão (não infla com F5 imediato)
  const recordVisit = useCallback((path: string = '/') => {
    try {
      const now = new Date();
      const lastSessionTime = Number(sessionStorage.getItem(STORAGE_KEYS.LAST_VISIT_SESSION) || '0');
      const nowMs = now.getTime();
      // Registra 1 visita por sessão a cada 15 minutos de navegação contínua
      if (nowMs - lastSessionTime < 15 * 60 * 1000) {
        return;
      }
      sessionStorage.setItem(STORAGE_KEYS.LAST_VISIT_SESSION, String(nowMs));

      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const monthStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
      const hourNum = now.getHours();
      const dayOfWeekNum = now.getDay();

      const newRecord: VisitRecord = {
        id: `VISIT-${nowMs}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: now.toISOString(),
        date: dateStr,
        month: monthStr,
        hour: hourNum,
        dayOfWeek: dayOfWeekNum,
        path: path || window.location.pathname,
        referrer: typeof document !== 'undefined' ? (document.referrer || 'Direto') : 'Direto',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
      };

      setVisits(prev => [newRecord, ...prev].slice(0, 10000));
      salvarVisitaSupabase(newRecord);
    } catch {
      // safe fallback
    }
  }, []);

  const clearVisits = () => {
    setVisits([]);
    sessionStorage.removeItem(STORAGE_KEYS.LAST_VISIT_SESSION);
  };

  // Registro de Cliques nos Itens do Catálogo
  const recordProductClick = useCallback((product: Product, action: ProductClickRecord['action'] = 'view_details') => {
    try {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

      const clickRecord: ProductClickRecord = {
        id: `CLICK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product.id,
        productName: product.name,
        category: product.category,
        action,
        timestamp: now.toISOString(),
        date: dateStr
      };

      setProductClicks(prev => [clickRecord, ...prev].slice(0, 15000));
    } catch {
      // safe fallback
    }
  }, []);

  const clearProductClicks = () => {
    setProductClicks([]);
  };

  // Operações do Blog Flamar
  const addBlogPost = (postData: Omit<BlogPost, 'id' | 'publishedAt'>): BlogPost => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    
    const newPost: BlogPost = {
      ...postData,
      id: `POST-${Date.now()}`,
      publishedAt: dateStr,
      viewsCount: 0
    };

    setBlogPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  const updateBlogPost = (updatedPost: BlogPost) => {
    setBlogPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts(prev => prev.filter(p => p.id !== id));
  };

  // Gerenciamento de Leads e Orçamentos Comerciais
  const addOrUpdateLead = (lead: LeadRecord) => {
    setLeads(prev => {
      const idx = prev.findIndex(l => l.id === lead.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = lead;
        return copy;
      }
      return [lead, ...prev];
    });
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus, notes?: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status,
          notes: notes !== undefined ? notes : l.notes
        };
      }
      return l;
    }));
  };

  const deleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const convertLeadToOrder = (leadId: string): ErpOrder | null => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead || !lead.product_id) return null;

    const prod = products.find(p => p.id === lead.product_id);
    const unitPrice = lead.unit_price || (prod ? prod.cash_price : 0);
    const total = lead.total_amount || (unitPrice * (lead.quantity || 1));

    // 1. Cadastra ou atualiza o cliente caso não exista
    const existingCust = customers.find(c => c.phone.replace(/\D/g, '') === lead.phone.replace(/\D/g, ''));
    let customerId = existingCust?.id;
    if (!existingCust && lead.name) {
      const newCust = addCustomer({
        full_name: lead.name,
        phone: lead.phone,
        cep: lead.cep || '01000-000',
        address: lead.address || 'São Paulo',
        neighborhood: lead.neighborhood || 'Centro',
        city: lead.city || 'São Paulo',
        state: 'SP',
        notes: `Criado via Leadster Chatbot (Lead #${lead.id.slice(0, 6)})`
      });
      customerId = newCust.id;
    }

    // 2. Cria o Pedido ERP
    const costPrice = prod ? prod.cost_price : unitPrice * 0.6;
    const qty = lead.quantity || 1;
    const subtotal = unitPrice * qty;

    const newOrder: ErpOrder = {
      id: `FLM-${Date.now().toString().slice(-6)}`,
      created_at: new Date().toISOString(),
      channel: 'Catálogo Online',
      customer_name: lead.name || 'Cliente Chat',
      customer_phone: lead.phone,
      customer_cep: lead.cep || '01000-000',
      customer_address: lead.address || 'A combinar',
      customer_neighborhood: lead.neighborhood || 'Centro',
      customer_city: lead.city || 'São Paulo',
      seller_name: 'Chatbot Consultor Flamar',
      items: [
        {
          product_id: lead.product_id,
          sku: lead.sku || prod?.sku || 'FLAMAR',
          product_name: lead.product_name || prod?.name || 'Colchão Flamar',
          quantity: qty,
          unit_price: unitPrice,
          cost_price: costPrice,
          subtotal: subtotal
        }
      ],
      subtotal: subtotal,
      discount: lead.discount || 0,
      shipping_fee: lead.shipping_fee || 0,
      total: total,
      payment_method: 'pix',
      installments: 1,
      payment_status: 'pendente',
      delivery_status: 'aguardando_separacao',
      notes: `Orçamento comercial gerado pelo chat. Medida: ${lead.dimensions || 'Padrão'}.`
    };

    setOrders(prev => [newOrder, ...prev]);

    // Atualiza status do lead para convertido
    updateLeadStatus(leadId, 'convertido_venda', `Convertido no Pedido ERP #${newOrder.id}`);

    return newOrder;
  };

  // Efeito inicial para registrar a visita do usuário ao carregar a página
  useEffect(() => {
    recordVisit(window.location.pathname);
  }, [recordVisit]);

  // Carrinho
  const addToCart = (product: Product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(i => (i.product.id === productId ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => setCart([]);

  // Produtos & Estoque
  const upsertProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.map(p => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
    // Salva imediatamente no Supabase
    salvarProdutoSupabase(product);
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const adjustStock = (productId: string, delta: number, _reason: string) => {
    setProducts(prev => {
      const updated = prev.map(p =>
        p.id === productId
          ? { ...p, stock_qty: Math.max(0, p.stock_qty + delta) }
          : p
      );
      const target = updated.find(p => p.id === productId);
      if (target) {
        salvarProdutoSupabase(target);
      }
      return updated;
    });
  };

  // Clientes
  const addCustomer = (
    custData: Omit<CustomerRecord, 'id' | 'created_at' | 'total_orders' | 'total_spent'>
  ): CustomerRecord => {
    const newCust: CustomerRecord = {
      ...custData,
      id: `CUST-${Date.now().toString().slice(-6)}`,
      total_orders: 0,
      total_spent: 0,
      created_at: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCust, ...prev]);
    // Sincroniza cliente com Supabase
    salvarClienteSupabase(newCust);
    return newCust;
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Fornecedores
  const addSupplier = (sup: Omit<SupplierRecord, 'id'>) => {
    const newSup: SupplierRecord = {
      ...sup,
      id: `SUP-${Date.now().toString().slice(-6)}`
    };
    setSuppliers(prev => [newSup, ...prev]);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Fluxo de Caixa
  const addCashTransaction = (tx: Omit<CashTransaction, 'id'>) => {
    const newTx: CashTransaction = {
      ...tx,
      id: `CX-${Date.now().toString().slice(-6)}`
    };
    setCashTransactions(prev => [newTx, ...prev]);
    salvarFluxoCaixaSupabase(newTx);
  };

  const deleteCashTransaction = (id: string) => {
    setCashTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Contas a Pagar
  const addPayable = (bill: Omit<PayableAccount, 'id'>) => {
    const newBill: PayableAccount = {
      ...bill,
      id: `CP-${Date.now().toString().slice(-6)}`
    };
    setPayables(prev => [newBill, ...prev]);
  };

  const markPayableAsPaid = (billId: string, account: CashTransaction['account']) => {
    const bill = payables.find(b => b.id === billId);
    if (!bill || bill.status === 'pago') return;

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    setPayables(prev =>
      prev.map(b =>
        b.id === billId ? { ...b, status: 'pago', paid_date: today } : b
      )
    );

    addCashTransaction({
      date: today,
      time: nowTime,
      type: 'saida',
      category:
        bill.category === 'Fornecedor de Colchões'
          ? 'Fornecedor de Colchões'
          : bill.category === 'Frete & Combustível'
          ? 'Frete & Logística'
          : bill.category === 'Aluguel & Encargos'
          ? 'Aluguel & IPTU'
          : bill.category === 'Folha & Comissões'
          ? 'Folha & Comissões'
          : bill.category === 'Impostos & Tributos'
          ? 'Impostos / DAS'
          : 'Outras Despesas',
      description: `Baixa Conta a Pagar [${bill.document_number}] - ${bill.supplier_name}: ${bill.description}`,
      amount: bill.amount,
      payment_method: bill.payment_method,
      account,
      reference_id: bill.id,
      operator: 'Financeiro Flamar'
    });
  };

  const deletePayable = (billId: string) => {
    setPayables(prev => prev.filter(b => b.id !== billId));
  };

  // Contas a Receber
  const addReceivable = (rec: Omit<ReceivableAccount, 'id'>) => {
    const newRec: ReceivableAccount = {
      ...rec,
      id: `CR-${Date.now().toString().slice(-6)}`
    };
    setReceivables(prev => [newRec, ...prev]);
  };

  const markReceivableAsReceived = (recId: string, account: CashTransaction['account']) => {
    const rec = receivables.find(r => r.id === recId);
    if (!rec || rec.status === 'recebido') return;

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    setReceivables(prev =>
      prev.map(r =>
        r.id === recId ? { ...r, status: 'recebido', received_date: today } : r
      )
    );

    addCashTransaction({
      date: today,
      time: nowTime,
      type: 'entrada',
      category: 'Recebimento Parcela',
      description: `Recebimento Pedido ${rec.order_id} (${rec.installment_label}) - Cliente: ${rec.customer_name}`,
      amount: rec.amount,
      payment_method: rec.payment_method,
      account,
      reference_id: rec.order_id,
      operator: 'Financeiro Flamar'
    });
  };

  const deleteReceivable = (recId: string) => {
    setReceivables(prev => prev.filter(r => r.id !== recId));
  };

  // Criação de Pedido Integrada ao Estoque, Caixa/Recebíveis e Cadastro de Clientes
  const createOrder = (orderData: Omit<ErpOrder, 'id' | 'created_at'>): ErpOrder => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    const seq = (orders.length + 1).toString().padStart(3, '0');
    const newOrder: ErpOrder = {
      ...orderData,
      id: `FLM-2026-${seq}`,
      created_at: `${dateStr} ${timeStr}`
    };

    setOrders(prev => [newOrder, ...prev]);
    salvarPedidoSupabase(newOrder);

    // 1. Baixar estoque automaticamente
    orderData.items.forEach(item => {
      adjustStock(item.product_id, -item.quantity, `Venda ${newOrder.id}`);
    });

    // 2. Atualizar ou cadastrar cliente genuíno com histórico completo de compras
    const productsSummary = orderData.items
      .map(i => `${i.quantity}x ${i.product_name} (R$ ${i.unit_price.toFixed(2)})`)
      .join(', ');

    const paymentLabel =
      orderData.payment_method === 'pix'
        ? 'PIX à Vista (-10%)'
        : orderData.payment_method === 'cartao_credito_10x'
        ? `Cartão de Crédito (${orderData.installments || 1}x)`
        : orderData.payment_method === 'cartao_debito'
        ? 'Cartão de Débito'
        : orderData.payment_method === 'dinheiro'
        ? 'Dinheiro à Vista'
        : orderData.payment_method;

    setCustomers(prev => {
      const existing = prev.find(
        c =>
          c.phone.replace(/\D/g, '') === orderData.customer_phone.replace(/\D/g, '') ||
          c.full_name.toLowerCase() === orderData.customer_name.toLowerCase()
      );
      if (existing) {
        return prev.map(c =>
          c.id === existing.id
            ? {
                ...c,
                total_orders: c.total_orders + 1,
                total_spent: c.total_spent + orderData.total,
                last_order_date: `${dateStr} ${timeStr}`,
                last_payment_method: paymentLabel,
                last_products: productsSummary
              }
            : c
        );
      }
      const created: CustomerRecord = {
        id: `CUST-${Date.now().toString().slice(-6)}`,
        full_name: orderData.customer_name,
        phone: orderData.customer_phone,
        cpf_cnpj: orderData.customer_cpf_cnpj || '',
        cep: orderData.customer_cep || '02930-050',
        address: orderData.customer_address || 'Retirada na Loja - Rua Jotacá, 378',
        neighborhood: orderData.customer_neighborhood || 'Vila Picinin',
        city: orderData.customer_city || 'São Paulo',
        state: 'SP',
        total_orders: 1,
        total_spent: orderData.total,
        last_order_date: `${dateStr} ${timeStr}`,
        last_payment_method: paymentLabel,
        last_products: productsSummary,
        created_at: `${dateStr} ${timeStr}`
      };
      return [created, ...prev];
    });

    // 3. Lançar no Fluxo de Caixa (se pago à vista) ou em Contas a Receber
    if (orderData.payment_status === 'pago') {
      addCashTransaction({
        date: dateStr,
        time: timeStr,
        type: 'entrada',
        category:
          orderData.channel === 'Balcão (Rua Jotacá)'
            ? 'Venda Loja Física'
            : 'Venda Catálogo Digital',
        description: `Pedido ${newOrder.id} - ${orderData.customer_name} (${orderData.items.length} item(ns))`,
        amount: orderData.total,
        payment_method: orderData.payment_method,
        account:
          orderData.payment_method === 'dinheiro'
            ? 'Caixa Loja (Rua Jotacá)'
            : orderData.payment_method === 'pix'
            ? 'Asaas / PIX Digital'
            : 'Conta Corrente Empresarial',
        reference_id: newOrder.id,
        operator: orderData.seller_name
      });
    } else {
      const installmentsCount = Math.max(1, orderData.installments || 1);
      const installmentValue = Number((orderData.total / installmentsCount).toFixed(2));
      for (let i = 1; i <= installmentsCount; i++) {
        const due = new Date(now);
        due.setMonth(due.getMonth() + (i - 1));
        addReceivable({
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          order_id: newOrder.id,
          installment_label: `${i}/${installmentsCount}`,
          due_date: due.toISOString().split('T')[0],
          amount: installmentValue,
          status: 'a_receber',
          payment_method: orderData.payment_method
        });
      }
    }

    return newOrder;
  };

  const updateOrderDeliveryStatus = (orderId: string, status: OrderDeliveryStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, delivery_status: status } : o))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  return (
    <FlamarContext.Provider
      value={{
        environment,
        setEnvironment,
        erpSection,
        setErpSection,
        products,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedProductModal,
        setSelectedProductModal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        upsertProduct,
        deleteProduct,
        adjustStock,
        orders,
        createOrder,
        updateOrderDeliveryStatus,
        deleteOrder,
        cashTransactions,
        addCashTransaction,
        deleteCashTransaction,
        payables,
        addPayable,
        markPayableAsPaid,
        deletePayable,
        receivables,
        addReceivable,
        markReceivableAsReceived,
        deleteReceivable,
        customers,
        addCustomer,
        deleteCustomer,
        suppliers,
        addSupplier,
        deleteSupplier,
        visits,
        recordVisit,
        clearVisits,
        productClicks,
        recordProductClick,
        clearProductClicks,
        blogPosts,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        leads,
        addOrUpdateLead,
        updateLeadStatus,
        deleteLead,
        convertLeadToOrder
      }}
    >
      {children}
    </FlamarContext.Provider>
  );
};

export const useFlamar = () => {
  const ctx = useContext(FlamarContext);
  if (!ctx) throw new Error('useFlamar must be used within FlamarProvider');
  return ctx;
};
