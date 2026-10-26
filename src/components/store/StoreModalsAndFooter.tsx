import React, { useState } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import { FLAMAR_COMPANY_INFO } from '../../lib/flamarCatalog';
import { FlamarLogo } from '../common/FlamarLogo';
import { PaymentMethod } from '../../types/database';
import {
  X, ShoppingCart, MessageCircle, ShieldCheck, CheckCircle2,
  Trash2, Plus, Minus, MapPin, Phone, Mail, Building2, Award
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { selectedProductModal, setSelectedProductModal, addToCart, setIsCartDrawerOpen } = useFlamar();
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  if (!selectedProductModal) return null;

  const gallery = selectedProductModal.gallery.length > 0
    ? selectedProductModal.gallery
    : [selectedProductModal.image_url];

  const currentImg = gallery[activeImgIdx] || selectedProductModal.image_url;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-gray-200 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAF7F4] border-b border-gray-200">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#82260E]">
              {selectedProductModal.brand} • SKU {selectedProductModal.sku}
            </span>
            <h3 className="text-lg font-bold text-gray-900">{selectedProductModal.name}</h3>
          </div>
          <button
            onClick={() => {
              setSelectedProductModal(null);
              setActiveImgIdx(0);
            }}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Galeria de Fotos Reais */}
          <div>
            <div className="h-72 bg-[#FAF7F4] rounded-2xl border border-gray-200 flex items-center justify-center p-4 mb-3">
              <img
                src={currentImg}
                alt={selectedProductModal.name}
                className="w-full h-full object-contain"
              />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImgIdx(i)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden p-1 bg-[#FAF7F4] shrink-0 ${
                      activeImgIdx === i ? 'border-[#82260E]' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes Técnicos e Preço */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {selectedProductModal.certifications.map((cert, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200"
                  >
                    <CheckCircle2 size={12} />
                    <span>{cert}</span>
                  </span>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {selectedProductModal.full_description}
              </p>

              <div className="bg-[#FAF7F4] rounded-2xl p-4 border border-gray-200 space-y-1.5 text-xs text-gray-700">
                <div><strong>Dimensões Oficiais:</strong> {selectedProductModal.dimensions} ({selectedProductModal.size_label})</div>
                <div><strong>Estrutura / Densidade:</strong> {selectedProductModal.density_or_spring}</div>
                {selectedProductModal.max_weight_kg && (
                  <div><strong>Suporte de Peso:</strong> Até {selectedProductModal.max_weight_kg} kg por pessoa</div>
                )}
                <div><strong>Garantia Oficial:</strong> {selectedProductModal.warranty_months} meses de fábrica</div>
                <div><strong>Disponibilidade:</strong> {selectedProductModal.stock_qty} unidade(s) no estoque Flamar SP</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="mb-4">
                <span className="text-xs text-gray-400 line-through block">
                  Tabela: R$ {selectedProductModal.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-2xl font-black text-[#82260E]">
                  R$ {selectedProductModal.cash_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  <small className="text-xs font-semibold text-emerald-700 ml-1.5">(-5% à vista no PIX)</small>
                </span>
                <span className="block text-xs text-gray-600 mt-0.5">
                  ou em até <strong>10x de R$ {(selectedProductModal.price / 10).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> sem juros no cartão
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    addToCart(selectedProductModal, 1);
                    setSelectedProductModal(null);
                    setIsCartDrawerOpen(true);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#82260E] hover:bg-[#681E0B] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                >
                  <ShoppingCart size={16} />
                  <span>Adicionar ao Pedido</span>
                </button>

                <a
                  href={`https://wa.me/${FLAMAR_COMPANY_INFO.whatsapp_e164}?text=${encodeURIComponent(`Olá Flamar Colchões! Tenho interesse no produto: ${selectedProductModal.name} (SKU ${selectedProductModal.sku}) por R$ ${selectedProductModal.cash_price.toFixed(2)} à vista.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                >
                  <MessageCircle size={16} />
                  <span>Negociar no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CartCheckoutDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    updateCartQty,
    removeFromCart,
    clearCart,
    createOrder
  } = useFlamar();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCep, setCustomerCep] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNeighborhood, setCustomerNeighborhood] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  if (!isCartDrawerOpen) return null;

  const isCash = paymentMethod === 'pix' || paymentMethod === 'dinheiro' || paymentMethod === 'cartao_debito';
  const subtotalTable = cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const subtotalCash = cart.reduce((acc, i) => acc + i.product.cash_price * i.quantity, 0);
  const finalTotal = isCash ? subtotalCash : subtotalTable;
  const discountTotal = isCash ? subtotalTable - subtotalCash : 0;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !customerName.trim() || !customerPhone.trim()) return;

    const created = createOrder({
      channel: 'Catálogo Online',
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_cep: customerCep.trim() || '02930-050',
      customer_address: customerAddress.trim() || 'A combinar entrega / retirada',
      customer_neighborhood: customerNeighborhood.trim() || 'São Paulo',
      customer_city: 'São Paulo',
      items: cart.map((i) => {
        const unit = isCash ? i.product.cash_price : i.product.price;
        return {
          product_id: i.product.id,
          sku: i.product.sku,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: unit,
          cost_price: i.product.cost_price,
          subtotal: unit * i.quantity
        };
      }),
      subtotal: subtotalTable,
      discount: discountTotal,
      shipping_fee: 0,
      total: finalTotal,
      payment_method: paymentMethod,
      installments: paymentMethod === 'cartao_credito_10x' ? 10 : 1,
      payment_status: isCash ? 'pago' : 'pendente',
      delivery_status: 'aguardando_separacao',
      seller_name: 'E-commerce Flamar'
    });

    setOrderSuccessId(created.id);
    clearCart();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl animate-fade-in">
        <div className="px-6 py-4 bg-[#82260E] text-white flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg">Seu Pedido • Flamar Colchões</h3>
            <p className="text-xs text-[#FCD5C8]">Integrado ao Estoque e Expedição Rua Jotacá, 378</p>
          </div>
          <button
            onClick={() => {
              setIsCartDrawerOpen(false);
              setOrderSuccessId(null);
            }}
            className="p-1.5 rounded-lg hover:bg-white/15"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {orderSuccessId ? (
            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
              <CheckCircle2 size={44} className="text-emerald-600 mx-auto" />
              <h4 className="text-xl font-serif font-bold text-gray-900">
                Pedido {orderSuccessId} Registrado no ERP!
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                Seu pedido já deu entrada automática no ERP da Flamar Colchões (estoque reservado e financeiro registrado).
              </p>
              <a
                href={`https://wa.me/${FLAMAR_COMPANY_INFO.whatsapp_e164}?text=${encodeURIComponent(`Olá Flamar Colchões! Acabei de registrar o pedido ${orderSuccessId} em nome de ${customerName}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                <span>Confirmar Entrega no WhatsApp</span>
              </a>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-14 space-y-3">
              <ShoppingCart size={40} className="text-gray-300 mx-auto" />
              <p className="font-bold text-gray-700">Seu carrinho está vazio</p>
              <p className="text-xs text-gray-500">
                Adicione colchões ou camas box do catálogo para fazer seu pedido.
              </p>
            </div>
          ) : (
            <>
              {/* Lista de Itens */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7F4] border border-gray-200"
                  >
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 object-contain bg-white rounded-xl p-1 border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.product.name}</h4>
                      <p className="text-[11px] text-gray-500">SKU: {item.product.sku}</p>
                      <p className="text-xs font-extrabold text-[#82260E] mt-0.5">
                        R$ {(isCash ? item.product.cash_price : item.product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} un.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                        className="p-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-100"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                        className="p-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-100"
                      >
                        <Plus size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-red-500 hover:text-red-700 ml-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulário de Fechamento Integrado ao ERP */}
              <form onSubmit={handleCheckoutSubmit} className="space-y-3 pt-3 border-t border-gray-200">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#82260E]">
                  Dados do Cliente & Entrega
                </h4>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nome completo do cliente *"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#82260E]"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="WhatsApp / Telefone *"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#82260E]"
                  />
                  <input
                    type="text"
                    value={customerCep}
                    onChange={(e) => setCustomerCep(e.target.value)}
                    placeholder="CEP (ex: 02930-050)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#82260E]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Rua e Número"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#82260E]"
                  />
                  <input
                    type="text"
                    value={customerNeighborhood}
                    onChange={(e) => setCustomerNeighborhood(e.target.value)}
                    placeholder="Bairro (ex: Pirituba)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#82260E]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#82260E]"
                  >
                    <option value="pix">PIX à Vista (5% de Desconto Aplicado)</option>
                    <option value="cartao_credito_10x">Cartão de Crédito em até 10x Sem Juros</option>
                    <option value="cartao_debito">Cartão de Débito (-5% à Vista)</option>
                    <option value="dinheiro">Dinheiro na Entrega / Balcão (-5%)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF7F4] border border-[#FCD5C8] space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal Tabela:</span>
                    <span>R$ {subtotalTable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Desconto 5% à Vista:</span>
                      <span>- R$ {discountTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-[#82260E] pt-1 border-t border-[#FCD5C8]">
                    <span>Total do Pedido:</span>
                    <span>R$ {finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#82260E] hover:bg-[#681E0B] text-white font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  Finalizar Pedido & Registrar no ERP
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const StoreFooter: React.FC = () => {
  return (
    <footer className="bg-[#1C110E] text-white border-t-4 border-[#82260E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
        <div className="space-y-3">
          <FlamarLogo variant="light" size="md" />
          <p className="text-gray-300 leading-relaxed mt-2">
            Há 37 anos proporcionando noites de sono reparadoras com as melhores marcas de colchões e camas box de São Paulo.
          </p>
          <p className="text-[#D4AF37] font-bold">
            CNPJ: {FLAMAR_COMPANY_INFO.cnpj}
          </p>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-sm font-serif font-bold text-[#FBF1D6] uppercase tracking-wider">
            Loja Física & Galpão SP
          </h4>
          <p className="flex items-start gap-2 text-gray-300">
            <MapPin size={15} className="text-[#D4AF37] shrink-0 mt-0.5" />
            <span>{FLAMAR_COMPANY_INFO.address_street} — {FLAMAR_COMPANY_INFO.neighborhood}<br />{FLAMAR_COMPANY_INFO.city} - {FLAMAR_COMPANY_INFO.state} • CEP {FLAMAR_COMPANY_INFO.cep}</span>
          </p>
          <p className="flex items-center gap-2 text-gray-300">
            <Phone size={15} className="text-[#D4AF37] shrink-0" />
            <span>Fone: {FLAMAR_COMPANY_INFO.phone_landline}</span>
          </p>
          <p className="flex items-center gap-2 text-gray-300">
            <Mail size={15} className="text-[#D4AF37] shrink-0" />
            <span>{FLAMAR_COMPANY_INFO.email}</span>
          </p>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-sm font-serif font-bold text-[#FBF1D6] uppercase tracking-wider">
            Marcas Trabalhadas
          </h4>
          <ul className="space-y-1.5 text-gray-300">
            <li>• Luckspuma Colchões (Molas Roma & Dream)</li>
            <li>• Colchões Castor (Pocket Premium Gel)</li>
            <li>• FA Maringá (Maxx Firme Pillow Duplo)</li>
            <li>• Linha Ícaro D33 Homologada INER</li>
            <li>• Liderflex & Box Baú Blindado Flamar</li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-sm font-serif font-bold text-[#FBF1D6] uppercase tracking-wider">
            Condições & Selos Oficiais
          </h4>
          <p className="text-gray-300">
            • Parcele em até <strong>10x sem juros</strong> nos cartões Elo, Visa, Mastercard e Hipercard.
          </p>
          <p className="text-gray-300">
            • <strong>5% de desconto</strong> para pagamentos à vista via PIX ou Dinheiro.
          </p>
          <div className="pt-2 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded bg-white/10 text-[#FBF1D6] font-bold">INMETRO</span>
            <span className="px-2.5 py-1 rounded bg-white/10 text-[#FBF1D6] font-bold">PRÓ-ESPUMA</span>
            <span className="px-2.5 py-1 rounded bg-white/10 text-[#FBF1D6] font-bold">ABICOL</span>
          </div>
        </div>
      </div>

      <div className="bg-[#120A08] py-4 px-4 text-center text-[11px] text-gray-400 border-t border-white/10">
        © {new Date().getFullYear()} {FLAMAR_COMPANY_INFO.name} — CNPJ {FLAMAR_COMPANY_INFO.cnpj} — Todos os direitos reservados. Plataforma E-commerce & ERP Corporativo Integrado.
      </div>
    </footer>
  );
};
