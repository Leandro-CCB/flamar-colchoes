import React, { useState } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import {
  Product,
  PaymentMethod,
  OrderDeliveryStatus,
  ProductCategory
} from '../../types/database';
import {
  Calculator, Package, Truck, Users, Building2, Plus, Minus,
  Trash2, CheckCircle2, Search, Edit3, AlertTriangle, ShoppingBag,
  Upload, Image as ImageIcon, Loader2, X
} from 'lucide-react';
import { otimizarImagem, uploadFotoProduto } from '../../lib/supabase';

// ── 1. PDV FRENTE DE CAIXA (BALCÃO RUA JOTACÁ, 378) ────────────────────────
export const PdvView: React.FC = () => {
  const { products, createOrder } = useFlamar();

  const [pdvSearch, setPdvSearch] = useState('');
  const [pdvItems, setPdvItems] = useState<{ product: Product; qty: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNeighborhood, setCustomerNeighborhood] = useState('Vila Picinin');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [installments, setInstallments] = useState(1);
  const [lastOrderCreated, setLastOrderCreated] = useState<string | null>(null);

  const isCash = paymentMethod === 'pix' || paymentMethod === 'dinheiro' || paymentMethod === 'cartao_debito';

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(pdvSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(pdvSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(pdvSearch.toLowerCase())
  );

  const addItem = (prod: Product) => {
    setPdvItems((prev) => {
      const ex = prev.find((i) => i.product.id === prod.id);
      if (ex) {
        return prev.map((i) => (i.product.id === prod.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { product: prod, qty: 1 }];
    });
  };

  const changeQty = (prodId: string, delta: number) => {
    setPdvItems((prev) =>
      prev
        .map((i) => (i.product.id === prodId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const subtotalTable = pdvItems.reduce((acc, i) => acc + i.product.price * i.qty, 0);
  const subtotalCash = pdvItems.reduce((acc, i) => acc + i.product.cash_price * i.qty, 0);
  const finalTotal = isCash ? subtotalCash : subtotalTable;
  const discountVal = isCash ? subtotalTable - subtotalCash : 0;

  const handleFinishSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (pdvItems.length === 0 || !customerName.trim() || !customerPhone.trim()) return;

    const order = createOrder({
      channel: 'Balcão (Rua Jotacá)',
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_cpf_cnpj: customerCpf.trim(),
      customer_cep: '02930-050',
      customer_address: customerAddress.trim() || 'Retirada Loja Rua Jotacá, 378',
      customer_neighborhood: customerNeighborhood.trim() || 'Vila Picinin',
      customer_city: 'São Paulo',
      items: pdvItems.map((i) => {
        const unit = isCash ? i.product.cash_price : i.product.price;
        return {
          product_id: i.product.id,
          sku: i.product.sku,
          product_name: i.product.name,
          quantity: i.qty,
          unit_price: unit,
          cost_price: i.product.cost_price,
          subtotal: unit * i.qty
        };
      }),
      subtotal: subtotalTable,
      discount: discountVal,
      shipping_fee: 0,
      total: finalTotal,
      payment_method: paymentMethod,
      installments: isCash ? 1 : installments,
      payment_status: isCash ? 'pago' : 'pendente',
      delivery_status: customerAddress.trim() ? 'aguardando_separacao' : 'retirada_balcao',
      seller_name: 'Balcão Flamar'
    });

    setLastOrderCreated(order.id);
    setPdvItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerCpf('');
    setCustomerAddress('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#82260E]">
            FRENTE DE CAIXA • RUA JOTACÁ, 378
          </span>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            PDV Balcão & Emissão Rápida de Pedidos
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Baixa o estoque na hora, cadastra o cliente e lança automaticamente no Fluxo de Caixa ou Contas a Receber.
          </p>
        </div>

        {lastOrderCreated && (
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Venda {lastOrderCreated} faturada e integrada ao Caixa/Estoque!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grade de Produtos para Seleção */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 p-5 shadow-soft space-y-4">
          <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-2.5 bg-[#FAF7F4]">
            <Search size={17} className="text-[#82260E] mr-2" />
            <input
              type="text"
              value={pdvSearch}
              onChange={(e) => setPdvSearch(e.target.value)}
              placeholder="Pesquisar produto por nome, SKU ou marca..."
              className="w-full bg-transparent text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addItem(p)}
                className="p-3 rounded-2xl border border-gray-200 hover:border-[#82260E] bg-[#FAF7F4]/60 hover:bg-[#FFF7F4] cursor-pointer transition-all flex items-center gap-3"
              >
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-14 h-14 object-contain bg-white rounded-xl p-1 border border-gray-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-[#82260E] uppercase block">
                    {p.sku} • Est: {p.stock_qty}
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 truncate">{p.name}</h4>
                  <div className="text-xs font-extrabold text-emerald-700 mt-0.5">
                    R$ {p.cash_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} à vista
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cupom de Venda & Fechamento */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 p-6 shadow-soft flex flex-col justify-between">
          <form onSubmit={handleFinishSale} className="space-y-4 text-xs">
            <h3 className="text-base font-serif font-bold text-gray-900 border-b border-gray-100 pb-2">
              Resumo da Venda no Balcão
            </h3>

            {pdvItems.length === 0 ? (
              <div className="py-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                Clique nos produtos ao lado para adicionar à venda
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {pdvItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF7F4] border border-gray-200"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 truncate">{item.product.name}</div>
                      <div className="text-[11px] text-gray-500">
                        Unit: R$ {(isCash ? item.product.cash_price : item.product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => changeQty(item.product.id, -1)}
                        className="p-1 rounded bg-white border border-gray-300"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold w-5 text-center">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.product.id, 1)}
                        className="p-1 rounded bg-white border border-gray-300"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nome do Cliente *"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Telefone / WhatsApp *"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
                <input
                  type="text"
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(e.target.value)}
                  placeholder="CPF / CNPJ (Opcional)"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
              </div>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Endereço de Entrega (vazio = Retirada Balcão)"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="pix">PIX (-5% à Vista)</option>
                    <option value="dinheiro">Dinheiro (-5% à Vista)</option>
                    <option value="cartao_debito">Cartão Débito (-5%)</option>
                    <option value="cartao_credito_10x">Cartão Crédito (até 10x)</option>
                    <option value="boleto_faturado">Boleto / Crediário</option>
                  </select>
                </div>
                {!isCash && (
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Nº de Parcelas</label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}x de R$ {(finalTotal / n).toFixed(2).replace('.', ',')} sem juros
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF7F4] border border-[#FCD5C8] space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal Tabela:</span>
                <span>R$ {subtotalTable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Desconto 5% à Vista:</span>
                  <span>- R$ {discountVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-[#82260E] pt-1 border-t border-[#FCD5C8]">
                <span>Total Líquido a Pagar:</span>
                <span>R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={pdvItems.length === 0}
              className="w-full py-3.5 rounded-xl bg-[#82260E] hover:bg-[#681E0B] disabled:opacity-40 text-white font-bold uppercase tracking-wider shadow"
            >
              Finalizar Venda no PDV
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── 2. CONTROLE DE ESTOQUE & TABELA DE PREÇOS (LOJA RUA JOTACÁ) ─────────
export const InventoryView: React.FC = () => {
  const { products, adjustStock, upsertProduct } = useFlamar();
  const [stockSearch, setStockSearch] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('');
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // Estados de Edição Avançada
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editBrand, setEditBrand] = useState<Product['brand']>('Luckspuma');
  const [editCategory, setEditCategory] = useState<ProductCategory>('colchoes');
  const [editDimensions, setEditDimensions] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCashPrice, setEditCashPrice] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editMinStock, setEditMinStock] = useState('2');
  const [editShortDesc, setEditShortDesc] = useState('');
  const [editFullDesc, setEditFullDesc] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const openEditModal = (p: Product) => {
    setEditingProd(p);
    setEditName(p.name);
    setEditSku(p.sku);
    setEditBrand(p.brand);
    setEditCategory(p.category);
    setEditDimensions(p.dimensions);
    setEditPrice(p.price.toString());
    setEditCashPrice(p.cash_price.toString());
    setEditCost(p.cost_price.toString());
    setEditStock(p.stock_qty.toString());
    setEditMinStock(p.min_stock.toString());
    setEditShortDesc(p.short_description || '');
    setEditFullDesc(p.full_description || '');
    setEditImageUrl(p.image_url);
    setUploadError(null);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setUploadError(null);
      // Reduz dimensões e comprime em WebP com alta qualidade sem gerar arquivos pesados
      const blobOtimizado = await otimizarImagem(file, 1200, 0.88);
      // Upload para o bucket dedicado 'flamar-colchoes'
      const publicUrl = await uploadFotoProduto(blobOtimizado, editSku || editingProd?.id || 'prod');
      setEditImageUrl(publicUrl);
    } catch (err: any) {
      console.error('Erro no upload da foto:', err);
      setUploadError(err.message || 'Erro ao processar e enviar foto');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;

    const priceNum = parseFloat(editPrice.replace(',', '.')) || editingProd.price;
    const cashPriceNum = editCashPrice ? parseFloat(editCashPrice.replace(',', '.')) : Number((priceNum * 0.95).toFixed(2));
    const costNum = parseFloat(editCost.replace(',', '.')) || editingProd.cost_price;
    const stockNum = parseInt(editStock, 10);

    const updated: Product = {
      ...editingProd,
      name: editName.trim() || editingProd.name,
      sku: editSku.trim() || editingProd.sku,
      brand: editBrand,
      category: editCategory,
      dimensions: editDimensions.trim() || editingProd.dimensions,
      price: priceNum,
      cash_price: cashPriceNum,
      cost_price: costNum,
      stock_qty: isNaN(stockNum) ? editingProd.stock_qty : stockNum,
      min_stock: parseInt(editMinStock, 10) || editingProd.min_stock,
      short_description: editShortDesc.trim(),
      full_description: editFullDesc.trim(),
      image_url: editImageUrl || editingProd.image_url,
      gallery: editImageUrl ? [editImageUrl, ...(editingProd.gallery.filter(g => g !== editImageUrl))] : editingProd.gallery,
    };

    upsertProduct(updated);
    setEditingProd(null);
  };

  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState<Product['brand']>('Luckspuma');
  const [newCategory, setNewCategory] = useState<ProductCategory>('colchoes');
  const [newDimensions, setNewDimensions] = useState('138 x 188 x 24 cm');
  const [newPrice, setNewPrice] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newStock, setNewStock] = useState('5');

  const totalUnits = products.reduce((acc, p) => acc + p.stock_qty, 0);
  const totalCostValue = products.reduce((acc, p) => acc + p.cost_price * p.stock_qty, 0);
  const totalRetailValue = products.reduce((acc, p) => acc + p.price * p.stock_qty, 0);

  const filteredProducts = products.filter((p) => {
    if (selectedProductFilter && p.id !== selectedProductFilter) return false;
    if (!stockSearch.trim()) return true;
    const q = stockSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.dimensions.toLowerCase().includes(q) ||
      p.size_label.toLowerCase().includes(q)
    );
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice.replace(',', '.'));
    const costNum = parseFloat(newCost.replace(',', '.')) || priceNum * 0.6;
    if (!newName.trim() || isNaN(priceNum)) return;

    const prod: Product = {
      id: `prod-${Date.now().toString().slice(-5)}`,
      sige_id: `manual-${Date.now()}`,
      sku: newSku.trim() || `FLM-${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      brand: newBrand,
      category: newCategory,
      tags: ['todos', newCategory],
      dimensions: newDimensions,
      size_label: newDimensions.includes('88')
        ? 'Solteiro (88x188)'
        : newDimensions.includes('158')
        ? 'Queen (158x198)'
        : 'Casal (138x188)',
      density_or_spring: 'Estrutura Homologada Inmetro',
      price: priceNum,
      cash_price: Number((priceNum * 0.95).toFixed(2)),
      cost_price: costNum,
      stock_qty: parseInt(newStock, 10) || 1,
      min_stock: 2,
      image_url: '/images/products/prod-02-1.jpg',
      gallery: ['/images/products/prod-02-1.jpg'],
      short_description: `${newName.trim()} (${newDimensions}) com garantia oficial.`,
      full_description: `${newName.trim()} comercializado pela Flamar Colchões.`,
      certifications: ['Inmetro', 'Abicol'],
      warranty_months: 12
    };

    upsertProduct(prod);
    setNewName('');
    setNewPrice('');
    setNewCost('');
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-soft">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#82260E]">
            ALMOXARIFADO & PRECIFICAÇÃO • 11 ITENS REAIS SIGE LOJA
          </span>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Controle de Estoque Físico & Margens
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ajuste quantidades na loja, preço à vista (-5%), tabela 10x e custo de fábrica.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-5 py-3 rounded-xl bg-[#82260E] hover:bg-[#681E0B] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
          <span className="text-xs font-extrabold uppercase text-gray-500 block">
            Peças em Estoque Físico
          </span>
          <div className="text-2xl font-black text-gray-900 mt-1">{totalUnits} unidades</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
          <span className="text-xs font-extrabold uppercase text-gray-500 block">
            Custo Imobilizado (Preço Fábrica)
          </span>
          <div className="text-2xl font-black text-[#82260E] mt-1">
            R$ {totalCostValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
          <span className="text-xs font-extrabold uppercase text-gray-500 block">
            Valor Potencial de Venda (Varejo)
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            R$ {totalRetailValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Barra de Filtro e Busca de Produtos no Estoque */}
        <div className="p-4 border-b border-gray-200 bg-[#FAF7F4] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Campo Dropbox (Select) para escolher produto cadastrado */}
            <div className="relative min-w-[220px] max-w-xs">
              <select
                value={selectedProductFilter}
                onChange={(e) => setSelectedProductFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#82260E] font-medium"
              >
                <option value="">▼ Todos os Produtos Cadastrados</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.brand})
                  </option>
                ))}
              </select>
            </div>

            {/* Campo de Busca Texto */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Buscar por nome, SKU, medida..."
                className="w-full pl-9 pr-7 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#82260E]"
              />
              {stockSearch && (
                <button
                  onClick={() => setStockSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {(selectedProductFilter || stockSearch) && (
              <button
                onClick={() => {
                  setSelectedProductFilter('');
                  setStockSearch('');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold transition-colors"
                title="Limpar todos os filtros"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-gray-500">
            Exibindo <strong>{filteredProducts.length}</strong> de {products.length} produtos
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F4] border-b border-gray-200 text-gray-600 uppercase">
                <th className="py-3.5 px-4 font-bold">Produto / SKU</th>
                <th className="py-3.5 px-4 font-bold">Marca / Medida</th>
                <th className="py-3.5 px-4 font-bold text-right">Custo (R$)</th>
                <th className="py-3.5 px-4 font-bold text-right">À Vista -5%</th>
                <th className="py-3.5 px-4 font-bold text-right">Tabela 10x</th>
                <th className="py-3.5 px-4 font-bold text-center">Saldo na Loja</th>
                <th className="py-3.5 px-4 font-bold text-center">Ajuste Rápido</th>
                <th className="py-3.5 px-4 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-11 h-11 object-contain rounded-lg border border-gray-200 bg-white p-0.5 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{p.name}</div>
                        <span className="text-[11px] text-gray-500">SKU: {p.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#82260E] block">{p.brand}</span>
                    <span className="text-gray-500">{p.dimensions}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    R$ {p.cost_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    R$ {p.cash_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-gray-900">
                    R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        p.stock_qty <= p.min_stock
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {p.stock_qty} un.
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => adjustStock(p.id, -1, 'Saída Manual')}
                        className="px-2.5 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 font-bold"
                        title="Baixar 1 unidade"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => adjustStock(p.id, 1, 'Entrada Manual')}
                        className="px-2.5 py-1 rounded-lg bg-[#82260E] text-white font-bold"
                        title="Adicionar 1 unidade"
                      >
                        +1
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => openEditModal(p)}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF7F4] hover:bg-[#82260E] text-[#82260E] hover:text-white border border-[#82260E]/20 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs"
                      title="Editar detalhes do produto"
                    >
                      <Edit3 size={13} />
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-gray-900">
              Novo Produto no Catálogo & Estoque
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do Colchão / Cama Box *"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  placeholder="Código SKU"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
                <input
                  type="text"
                  value={newDimensions}
                  onChange={(e) => setNewDimensions(e.target.value)}
                  placeholder="Medida (ex: 138x188x24cm)"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value as Product['brand'])}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="Luckspuma">Luckspuma</option>
                  <option value="Castor">Castor</option>
                  <option value="FA Maringá">FA Maringá</option>
                  <option value="Liderflex">Liderflex</option>
                  <option value="Flamar">Flamar</option>
                </select>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="colchoes">Colchões</option>
                  <option value="cama_box">Cama Box</option>
                  <option value="box_bau">Box Baú</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Preço Venda *"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
                <input
                  type="number"
                  step="0.01"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  placeholder="Preço Custo"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="Qtd Estoque"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#82260E] text-white font-bold"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO AVANÇADA (TÍTULO, FOTO, DESCRIÇÃO, VALORES E ESTOQUE) */}
      {editingProd && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#82260E]">
                  MANUTENÇÃO DE CADASTRO
                </span>
                <h3 className="text-xl font-serif font-bold text-gray-900">
                  Editar Produto: {editingProd.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProd(null)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5 text-xs">
              {/* SEÇÃO FOTO DO PRODUTO (SUPABASE BUCKET) */}
              <div className="p-4 bg-[#FAF7F4] rounded-2xl border border-[#82260E]/15 space-y-3">
                <label className="font-bold text-gray-800 flex items-center gap-2">
                  <ImageIcon size={15} className="text-[#82260E]" />
                  Foto Principal do Produto (Armazenamento Otimizado WebP)
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#82260E]/30 bg-white p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-xs relative">
                    {editImageUrl ? (
                      <img
                        src={editImageUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-400 text-center">Sem foto</span>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-[10px]">
                        <Loader2 size={18} className="animate-spin mb-1" />
                        Otimizando...
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#82260E] hover:bg-[#681e0b] text-white font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-sm">
                        <Upload size={14} />
                        {uploadingImage ? 'Enviando...' : 'Trocar Foto (Upload)'}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-gray-500">
                        Otimização automática para WebP com zero perda de nitidez
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 shrink-0">URL:</span>
                      <input
                        type="text"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[11px] text-gray-600"
                      />
                    </div>

                    {uploadError && (
                      <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                        <AlertTriangle size={12} /> {uploadError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* IDENTIFICAÇÃO E CATEGORIA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-gray-700">Título / Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Código SKU</label>
                  <input
                    type="text"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Marca</label>
                  <select
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value as Product['brand'])}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="Luckspuma">Luckspuma</option>
                    <option value="Castor">Castor</option>
                    <option value="FA Maringá">FA Maringá</option>
                    <option value="Liderflex">Liderflex</option>
                    <option value="Flamar">Flamar</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Categoria</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="colchoes">Colchões</option>
                    <option value="cama_box">Cama Box</option>
                    <option value="box_bau">Box Baú</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Medida (Dimensões)</label>
                  <input
                    type="text"
                    value={editDimensions}
                    onChange={(e) => setEditDimensions(e.target.value)}
                    placeholder="Ex: 138 x 188 x 34 cm"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              {/* VALORES E ESTOQUE */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Tabela 10x (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => {
                      setEditPrice(e.target.value);
                      const p = parseFloat(e.target.value);
                      if (!isNaN(p)) {
                        setEditCashPrice((p * 0.95).toFixed(2));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-gray-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-emerald-800">À Vista -5% (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCashPrice}
                    onChange={(e) => setEditCashPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white font-bold text-emerald-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Custo Fábrica (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Saldo na Loja</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white"
                  />
                </div>
              </div>

              {/* DESCRIÇÕES */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Descrição Curta (Vitrine)</label>
                  <input
                    type="text"
                    value={editShortDesc}
                    onChange={(e) => setEditShortDesc(e.target.value)}
                    placeholder="Breve resumo exibido nos cards"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Descrição Completa e Detalhes Técnicos</label>
                  <textarea
                    rows={3}
                    value={editFullDesc}
                    onChange={(e) => setEditFullDesc(e.target.value)}
                    placeholder="Detalhes de certificação, estrutura de molas ou densidade da espuma..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingProd(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 font-bold text-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-[#82260E] hover:bg-[#681e0b] text-white font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── 3. PEDIDOS & EXPEDIÇÃO LOGÍSTICA ──────────────────────────────────────
export const OrdersExpeditionView: React.FC = () => {
  const { orders, updateOrderDeliveryStatus, deleteOrder, setErpSection } = useFlamar();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-soft">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#82260E]">
            LOGÍSTICA & ROTEIRIZAÇÃO GRANDE SÃO PAULO
          </span>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Pedidos & Expedição de Entregas
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Acompanhe separação no galpão, conferência, rota de caminhão e confirmação de entrega.
          </p>
        </div>

        <button
          onClick={() => setErpSection('pdv')}
          className="px-5 py-3 rounded-xl bg-[#82260E] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Emitir Novo Pedido no PDV</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-soft">
        {orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Truck size={38} className="text-[#82260E] mx-auto opacity-60" />
            <h3 className="text-base font-bold text-gray-900">
              Nenhum pedido registrado no momento
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Emita uma venda pelo PDV Balcão ou finalize um pedido na Loja Virtual para acompanhar a expedição aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F4] border-b border-gray-200 text-gray-600 uppercase">
                  <th className="py-3.5 px-4 font-bold">Pedido / Data</th>
                  <th className="py-3.5 px-4 font-bold">Canal</th>
                  <th className="py-3.5 px-4 font-bold">Cliente & Destino</th>
                  <th className="py-3.5 px-4 font-bold">Itens</th>
                  <th className="py-3.5 px-4 font-bold text-right">Total (R$)</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status Logístico</th>
                  <th className="py-3.5 px-4 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-[#82260E]">{o.id}</div>
                      <span className="text-[11px] text-gray-400">{o.created_at}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-700">{o.channel}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{o.customer_name}</div>
                      <div className="text-gray-500">{o.customer_address} — {o.customer_neighborhood}</div>
                    </td>
                    <td className="py-3 px-4">
                      {o.items.map((i, idx) => (
                        <div key={idx} className="text-gray-700">
                          {i.quantity}x {i.product_name}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-gray-900">
                      R$ {o.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={o.delivery_status}
                        onChange={(e) =>
                          updateOrderDeliveryStatus(o.id, e.target.value as OrderDeliveryStatus)
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-xs"
                      >
                        <option value="aguardando_separacao">1. Aguardando Separação</option>
                        <option value="em_conferencia_galpao">2. Em Conferência Galpão</option>
                        <option value="em_rota_entrega">3. Em Rota de Entrega</option>
                        <option value="entregue">4. Entregue ao Cliente</option>
                        <option value="retirada_balcao">Retirada no Balcão</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteOrder(o.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ── 4. CADASTRO DE CLIENTES (ZERO DADOS FICTÍCIOS) & FORNECEDORES ──────────
export const CustomersAndSuppliersView: React.FC<{ mode: 'customers' | 'suppliers' }> = ({
  mode
}) => {
  const { customers, addCustomer, deleteCustomer, suppliers, addSupplier, deleteSupplier } =
    useFlamar();

  const [showCustModal, setShowCustModal] = useState(false);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cCpf, setCCpf] = useState('');
  const [cCep, setCCep] = useState('02930-050');
  const [cAddress, setCAddress] = useState('');
  const [cNeighborhood, setCNeighborhood] = useState('Vila Picinin');

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim() || !cPhone.trim()) return;
    addCustomer({
      full_name: cName.trim(),
      phone: cPhone.trim(),
      cpf_cnpj: cCpf.trim(),
      cep: cCep.trim(),
      address: cAddress.trim(),
      neighborhood: cNeighborhood.trim(),
      city: 'São Paulo',
      state: 'SP'
    });
    setCName('');
    setCPhone('');
    setCCpf('');
    setCAddress('');
    setShowCustModal(false);
  };

  if (mode === 'suppliers') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-soft">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#82260E]">
            PARCEIROS INDUSTRIAIS HOMOLOGADOS
          </span>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Fornecedores e Fábricas de Colchões
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Indústrias oficiais representadas pela Flamar Colchões.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white p-5 rounded-3xl border border-gray-200 shadow-soft space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF7F4] text-[#82260E] font-extrabold uppercase">
                  {sup.trade_name}
                </span>
                <span className="text-gray-400 font-mono">CNPJ: {sup.cnpj}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900">{sup.corporate_name}</h3>
              <p className="text-gray-600"><strong>Linhas:</strong> {sup.brand_represented}</p>
              <p className="text-gray-600"><strong>Prazo Faturamento:</strong> {sup.payment_terms}</p>
              <p className="text-gray-600"><strong>Contato:</strong> {sup.phone} • {sup.email} ({sup.city_uf})</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-soft">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#82260E]">
            BASE DE CLIENTES 100% GENUÍNA
          </span>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Clientes Cadastrados • Flamar Colchões
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Base limpa de registros fictícios — alimentada apenas por cadastros reais ou vendas concluídas.
          </p>
        </div>

        <button
          onClick={() => setShowCustModal(true)}
          className="px-5 py-3 rounded-xl bg-[#82260E] hover:bg-[#681E0B] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Cadastrar Cliente Real</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-soft">
        {customers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users size={38} className="text-[#82260E] mx-auto opacity-60" />
            <h3 className="text-base font-bold text-gray-900">
              Nenhum cliente cadastrado ainda
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Não inserimos clientes fictícios. Clique abaixo para cadastrar um cliente manualmente ou realize uma venda pelo PDV/Catálogo.
            </p>
            <button
              onClick={() => setShowCustModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#82260E] text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Adicionar Primeiro Cliente</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F4] border-b border-gray-200 text-gray-600 uppercase">
                  <th className="py-3.5 px-4 font-bold">Nome do Cliente</th>
                  <th className="py-3.5 px-4 font-bold">WhatsApp / Telefone</th>
                  <th className="py-3.5 px-4 font-bold">Endereço / Bairro</th>
                  <th className="py-3.5 px-4 font-bold text-center">Pedidos</th>
                  <th className="py-3.5 px-4 font-bold text-right">Total Comprado</th>
                  <th className="py-3.5 px-4 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">{c.full_name}</td>
                    <td className="py-3 px-4 text-gray-700">{c.phone}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {c.address} — {c.neighborhood} ({c.city}/{c.state})
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{c.total_orders}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#82260E]">
                      R$ {c.total_spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteCustomer(c.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCustModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-gray-900">
              Novo Cadastro de Cliente
            </h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                placeholder="Nome completo *"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={cPhone}
                  onChange={(e) => setCPhone(e.target.value)}
                  placeholder="Telefone / WhatsApp *"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
                <input
                  type="text"
                  value={cCpf}
                  onChange={(e) => setCCpf(e.target.value)}
                  placeholder="CPF / CNPJ"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
              </div>
              <input
                type="text"
                value={cAddress}
                onChange={(e) => setCAddress(e.target.value)}
                placeholder="Rua e Número"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={cNeighborhood}
                  onChange={(e) => setCNeighborhood(e.target.value)}
                  placeholder="Bairro"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
                <input
                  type="text"
                  value={cCep}
                  onChange={(e) => setCCep(e.target.value)}
                  placeholder="CEP"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#82260E] text-white font-bold"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
