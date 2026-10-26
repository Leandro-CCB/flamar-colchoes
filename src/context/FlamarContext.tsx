import React, { createContext, useContext, useState, useEffect } from 'react';
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
  PaymentMethod,
  OrderDeliveryStatus
} from '../types/database';
import { FLAMAR_AUTHENTIC_PRODUCTS, FLAMAR_AUTHENTIC_SUPPLIERS } from '../lib/flamarCatalog';

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
}

const STORAGE_KEYS = {
  PRODUCTS: 'flamar_erp_products_v1',
  ORDERS: 'flamar_erp_orders_v1',
  CASHFLOW: 'flamar_erp_cashflow_v1',
  PAYABLES: 'flamar_erp_payables_v1',
  RECEIVABLES: 'flamar_erp_receivables_v1',
  CUSTOMERS: 'flamar_erp_customers_v1',
  SUPPLIERS: 'flamar_erp_suppliers_v1',
  CART: 'flamar_store_cart_v1'
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
  const [erpSection, setErpSection] = useState<ErpSection>('dashboard');

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
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const adjustStock = (productId: string, delta: number, _reason: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, stock_qty: Math.max(0, p.stock_qty + delta) }
          : p
      )
    );
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

    // 1. Baixar estoque automaticamente
    orderData.items.forEach(item => {
      adjustStock(item.product_id, -item.quantity, `Venda ${newOrder.id}`);
    });

    // 2. Atualizar ou cadastrar cliente genuíno
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
                last_order_date: dateStr
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
        last_order_date: dateStr,
        created_at: dateStr
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
        deleteSupplier
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
