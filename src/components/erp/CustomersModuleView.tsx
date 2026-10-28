import React, { useState, useMemo } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import {
  Users,
  Search,
  ShoppingBag,
  CreditCard,
  Calendar,
  Phone,
  MapPin,
  Trash2,
  DollarSign,
  Package,
  Plus,
  X,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CustomerRecord, PaymentMethod } from '../../types/database';

export const CustomersModuleView: React.FC = () => {
  const { customers, orders, addCustomer, deleteCustomer } = useFlamar();

  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'com_compras' | 'sem_compras'>('todos');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form novo cliente
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
    setShowAddModal(false);
  };

  // Filtragem da lista
  const clientesFiltrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return customers.filter((c) => {
      const matchBusca =
        !q ||
        c.full_name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.cpf_cnpj && c.cpf_cnpj.includes(q)) ||
        (c.last_products && c.last_products.toLowerCase().includes(q));

      if (!matchBusca) return false;

      if (filtroTipo === 'com_compras') return c.total_orders > 0;
      if (filtroTipo === 'sem_compras') return c.total_orders === 0;
      return true;
    });
  }, [customers, busca, filtroTipo]);

  // Métricas do topo
  const totalClientes = customers.length;
  const clientesCompradores = customers.filter((c) => c.total_orders > 0).length;
  const totalFaturadoClientes = customers.reduce((acc, c) => acc + (c.total_spent || 0), 0);
  const ticketMedio = clientesCompradores > 0 ? totalFaturadoClientes / clientesCompradores : 0;

  // Pedidos associados ao cliente selecionado
  const pedidosDoCliente = useMemo(() => {
    if (!selectedCustomer) return [];
    const phoneClean = selectedCustomer.phone.replace(/\D/g, '');
    const nomeClean = selectedCustomer.full_name.toLowerCase().trim();
    return orders.filter(
      (o) =>
        (o.customer_phone && o.customer_phone.replace(/\D/g, '') === phoneClean) ||
        (o.customer_name && o.customer_name.toLowerCase().trim() === nomeClean)
    );
  }, [orders, selectedCustomer]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Banner Superior do Módulo ───────────────────────────── */}
      <div className="bg-gradient-to-r from-[#1C110E] via-[#2E1610] to-[#82260E] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#D4AF37]/30">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
            <Users size={14} /> GESTÃO DE CLIENTES & PEDIDOS • FLAMAR COLCHÕES
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black mt-1">
            Clientes Cadastrados & Histórico de Compras
          </h1>
          <p className="text-xs text-gray-300 mt-1.5 max-w-2xl leading-relaxed">
            Consulte todas as informações dos clientes que preencheram cadastro para comprar: produtos adquiridos, valor total pago, forma de pagamento e data exata da compra.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c59f2d] text-[#1C110E] font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow shrink-0"
        >
          <Plus size={16} />
          <span>Novo Cliente Manual</span>
        </button>
      </div>

      {/* ── 4 Cartões Analíticos de Clientes ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase text-gray-500">
            <span>Total na Base</span>
            <Users size={18} className="text-[#82260E]" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalClientes}</div>
          <p className="text-[11px] text-gray-500 mt-1">Clientes genuínos cadastrados</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase text-gray-500">
            <span>Clientes Compradores</span>
            <ShoppingBag size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{clientesCompradores}</div>
          <p className="text-[11px] text-emerald-800 font-semibold mt-1">
            {totalClientes > 0 ? Math.round((clientesCompradores / totalClientes) * 100) : 0}% de conversão
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase text-gray-500">
            <span>Total Faturado</span>
            <DollarSign size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">
            R$ {totalFaturadoClientes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Soma de todas as compras</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-soft">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase text-gray-500">
            <span>Ticket Médio</span>
            <CreditCard size={18} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Por cliente comprador</p>
        </div>
      </div>

      {/* ── Filtros e Barra de Busca ─────────────────────────────── */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, telefone, CPF ou produto..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#82260E]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {(
            [
              { id: 'todos', label: 'Todos os Clientes' },
              { id: 'com_compras', label: 'Com Compras Realizadas' },
              { id: 'sem_compras', label: 'Apenas Cadastro' }
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFiltroTipo(t.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filtroTipo === t.id
                  ? 'bg-[#82260E] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabela Detalhada de Clientes & Compras ───────────────── */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-soft">
        {clientesFiltrados.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users size={44} className="text-[#82260E] mx-auto opacity-50" />
            <h3 className="text-base font-bold text-gray-900">
              Nenhum cliente encontrado
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Quando um cliente preencher o cadastro para comprar no carrinho ou na loja física, todos os dados, produtos comprados e valores pagos aparecerão aqui automaticamente.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-[#82260E] text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Cadastrar Cliente Manual</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F4] border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <th className="py-4 px-4">Cliente / Contato</th>
                  <th className="py-4 px-4">Endereço de Entrega</th>
                  <th className="py-4 px-4">Último(s) Produto(s) Comprado(s)</th>
                  <th className="py-4 px-4 text-center">Forma de Pagto</th>
                  <th className="py-4 px-4 text-center">Data da Compra</th>
                  <th className="py-4 px-4 text-right">Total Pago</th>
                  <th className="py-4 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientesFiltrados.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/40 transition-colors">
                    {/* Cliente / Contato */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-gray-900 text-sm">{c.full_name}</div>
                      <div className="flex items-center gap-1.5 text-gray-600 mt-0.5">
                        <Phone size={12} className="text-emerald-700" />
                        <span className="font-mono">{c.phone}</span>
                        {c.cpf_cnpj && <span className="text-gray-400">• {c.cpf_cnpj}</span>}
                      </div>
                    </td>

                    {/* Endereço */}
                    <td className="py-3.5 px-4 text-gray-600 max-w-xs">
                      <div className="flex items-start gap-1">
                        <MapPin size={13} className="text-[#82260E] shrink-0 mt-0.5" />
                        <span>
                          {c.address ? `${c.address}, ` : ''}{c.neighborhood || 'São Paulo'}
                          {c.city ? ` — ${c.city}/${c.state || 'SP'}` : ''}
                        </span>
                      </div>
                      {c.cep && <span className="text-[10px] text-gray-400 ml-4 font-mono">CEP: {c.cep}</span>}
                    </td>

                    {/* O que comprou */}
                    <td className="py-3.5 px-4 max-w-sm">
                      {c.last_products ? (
                        <div className="bg-[#FAF7F4] p-2 rounded-xl border border-gray-200/80">
                          <p className="font-semibold text-gray-800 line-clamp-2 leading-relaxed">
                            {c.last_products}
                          </p>
                          <span className="text-[10px] text-[#82260E] font-bold mt-1 inline-block">
                            {c.total_orders} pedido(s) registrado(s)
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Nenhum produto comprado ainda</span>
                      )}
                    </td>

                    {/* Forma de Pagamento */}
                    <td className="py-3.5 px-4 text-center">
                      {c.last_payment_method ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                          {c.last_payment_method}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Data da Compra */}
                    <td className="py-3.5 px-4 text-center font-mono text-gray-700">
                      {c.last_order_date || c.created_at ? (
                        <div>
                          <span className="font-semibold">{c.last_order_date || c.created_at}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Quanto Pagou */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="text-base font-black text-[#82260E]">
                        R$ {(c.total_spent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      {c.total_orders > 1 && (
                        <span className="text-[10px] text-gray-500">
                          Média: R$ {Math.round((c.total_spent || 0) / c.total_orders).toLocaleString('pt-BR')}
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-[#82260E] hover:text-white text-gray-700 font-bold text-[11px] transition-colors"
                          title="Ver ficha completa"
                        >
                          Detalhes
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remover cliente ${c.full_name}?`)) {
                              deleteCustomer(c.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Detalhes do Cliente e Histórico Completo ──────── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#82260E] uppercase tracking-wider">
                  Ficha do Cliente • Flamar Colchões
                </span>
                <h3 className="text-2xl font-serif font-black text-gray-900 mt-0.5">
                  {selectedCustomer.full_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-gray-200">
                <span className="text-gray-500 block">WhatsApp / Telefone</span>
                <strong className="text-sm text-gray-900">{selectedCustomer.phone}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-gray-200">
                <span className="text-gray-500 block">CPF / CNPJ</span>
                <strong className="text-sm text-gray-900">{selectedCustomer.cpf_cnpj || 'Não informado'}</strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-gray-200 sm:col-span-2">
                <span className="text-gray-500 block">Endereço de Entrega</span>
                <strong className="text-sm text-gray-900">
                  {selectedCustomer.address} — {selectedCustomer.neighborhood} ({selectedCustomer.city}/{selectedCustomer.state}) • CEP {selectedCustomer.cep}
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-gray-200">
                <span className="text-gray-500 block">Total de Compras</span>
                <strong className="text-lg text-[#82260E] font-black">
                  {selectedCustomer.total_orders} pedido(s)
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-gray-200">
                <span className="text-gray-500 block">Total Pago Acumulado</span>
                <strong className="text-lg text-emerald-700 font-black">
                  R$ {(selectedCustomer.total_spent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {/* Lista dos pedidos vinculados no ERP */}
            <div className="space-y-3">
              <h4 className="text-sm font-serif font-bold text-gray-900 flex items-center gap-1.5">
                <ShoppingBag size={16} className="text-[#82260E]" />
                Histórico de Pedidos Registrados
              </h4>

              {pedidosDoCliente.length === 0 ? (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-500">
                  {selectedCustomer.last_products ? (
                    <div>
                      <p className="font-semibold text-gray-800">Último registro de compra:</p>
                      <p className="mt-1">{selectedCustomer.last_products}</p>
                      <p className="text-[#82260E] font-bold mt-1">
                        Forma: {selectedCustomer.last_payment_method} • Data: {selectedCustomer.last_order_date}
                      </p>
                    </div>
                  ) : (
                    'Nenhum pedido completo arquivado.'
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {pedidosDoCliente.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl border border-gray-200 bg-[#FAF7F4] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{p.id}</span>
                        <span className="font-mono text-gray-500">{p.created_at}</span>
                      </div>
                      <div className="text-gray-700">
                        {p.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between py-0.5">
                            <span>{it.quantity}x {it.product_name}</span>
                            <span className="font-mono font-bold">R$ {it.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex items-center justify-between font-bold">
                        <span className="text-blue-800 uppercase text-[10px] px-2 py-0.5 bg-blue-100 rounded-full">
                          {p.payment_method}
                        </span>
                        <span className="text-sm font-black text-[#82260E]">
                          Total: R$ {p.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 font-bold text-xs text-gray-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Cadastro Manual de Cliente ───────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-gray-900">
                Novo Cadastro de Cliente
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#82260E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">WhatsApp / Tel *</label>
                  <input
                    type="text"
                    required
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#82260E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">CPF / CNPJ</label>
                  <input
                    type="text"
                    value={cCpf}
                    onChange={(e) => setCCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#82260E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Endereço de Entrega</label>
                <input
                  type="text"
                  value={cAddress}
                  onChange={(e) => setCAddress(e.target.value)}
                  placeholder="Rua, Número, Complemento"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#82260E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Bairro</label>
                  <input
                    type="text"
                    value={cNeighborhood}
                    onChange={(e) => setCNeighborhood(e.target.value)}
                    placeholder="Bairro"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#82260E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">CEP</label>
                  <input
                    type="text"
                    value={cCep}
                    onChange={(e) => setCCep(e.target.value)}
                    placeholder="00000-000"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#82260E]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 font-bold text-gray-700 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#82260E] hover:bg-[#681E0B] text-white font-bold"
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
