import React, { useState } from 'react';
import { useFlamar } from '../../context/FlamarContext';
import { FlamarLogo } from '../common/FlamarLogo';
import { FLAMAR_COMPANY_INFO } from '../../lib/flamarCatalog';
import { ErpSection } from '../../types/database';
import { InventoryView } from './ErpOperationsModules';
import { CustomersModuleView } from './CustomersModuleView';
import { AnalyticsModuleView } from './AnalyticsModuleView';
import {
  Package,
  ShoppingBag,
  Users,
  Eye,
  Menu,
  X
} from 'lucide-react';

export const ErpLayout: React.FC = () => {
  const {
    erpSection,
    setErpSection,
    setEnvironment,
    products,
    customers,
    visits,
  } = useFlamar();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems: { id: ErpSection; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'inventory',
      label: 'Estoque & Preços',
      icon: <Package size={16} />,
      badge: String(products.length)
    },
    {
      id: 'customers',
      label: 'Clientes & Compras',
      icon: <Users size={16} />,
      badge: customers.length > 0 ? String(customers.length) : undefined
    },
    {
      id: 'analytics',
      label: 'Visitas & Métricas',
      icon: <Eye size={16} />,
      badge: visits.length > 0 ? String(visits.length) : undefined
    },
  ];

  return (
    <div className="flex-1 flex min-h-[calc(100vh-45px)] bg-[#F5F1ED]">
      {/* ── SIDEBAR COMPACTA SEM SCROLL VISÍVEL (TODOS OS 11 MÓDULOS VISÍVEIS) ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#1C110E] text-white flex flex-col justify-between border-r border-[#82260E]/40 transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <FlamarLogo variant="light" size="sm" showTagline={true} />
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = erpSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setErpSection(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#B83918] text-white shadow-sm ring-1 ring-[#D4AF37]/70'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#FBF1D6]' : 'text-[#D4AF37]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                        isActive ? 'bg-black/30 text-[#FBF1D6]' : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-3.5 border-t border-white/10 bg-[#140B09] space-y-2">
          <button
            onClick={() => setEnvironment('storefront')}
            className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#FBF1D6] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingBag size={14} className="text-[#D4AF37]" />
            <span>Ver Loja Virtual</span>
          </button>
          <div className="text-[10px] text-gray-400 text-center leading-tight">
            CNPJ {FLAMAR_COMPANY_INFO.cnpj}<br />Rua Jotacá, 378 • Pirituba/SP
          </div>
        </div>
      </aside>

      {/* ── ÁREA DE CONTEÚDO PRINCIPAL DO ERP ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Mobile do ERP */}
        <div className="lg:hidden bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-[#82260E] px-3 py-1.5 rounded-lg bg-[#FFF7F4] border border-[#FCD5C8]"
          >
            <Menu size={16} />
            <span>Menu ERP ({navItems.find((n) => n.id === erpSection)?.label})</span>
          </button>
          <span className="text-xs font-bold text-gray-600">Flamar ERP v2.5</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {erpSection === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Banner Executivo */}
              <div className="bg-gradient-to-r from-[#2E0C04] via-[#82260E] to-[#9B2E11] text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="inline-block px-3 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#FBF1D6] text-[10px] font-extrabold uppercase tracking-widest mb-2">
                    PAINEL ADMINISTRATIVO & ERP CORPORATIVO • FLAMAR COLCHÕES
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-black">
                    Gestão Integrada: Loja, Estoque, Caixa & Contas
                  </h1>
                  <p className="text-xs sm:text-sm text-[#FCD5C8] mt-1">
                    {FLAMAR_COMPANY_INFO.address_street}, {FLAMAR_COMPANY_INFO.neighborhood} — CNPJ {FLAMAR_COMPANY_INFO.cnpj}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 shrink-0">
                  <button
                    onClick={() => setErpSection('pdv')}
                    className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c59f2d] text-[#1C110E] font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
                  >
                    <Calculator size={15} />
                    <span>Abrir PDV Balcão</span>
                  </button>
                  <button
                    onClick={() => setErpSection('cashflow')}
                    className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Wallet size={15} />
                    <span>Fluxo de Caixa</span>
                  </button>
                </div>
              </div>

              {/* 4 KPIs Principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setErpSection('cashflow')}
                  className="bg-white p-5 rounded-3xl border border-gray-200 hover:border-[#82260E] cursor-pointer shadow-soft transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase text-gray-500">
                    <span>Saldo em Caixa</span>
                    <Wallet size={18} className="text-[#82260E]" />
                  </div>
                  <div className="text-2xl font-black text-gray-900 mt-2">
                    R$ {saldoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    Entradas: R$ {totalEntradasCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div
                  onClick={() => setErpSection('payables')}
                  className="bg-white p-5 rounded-3xl border border-gray-200 hover:border-[#82260E] cursor-pointer shadow-soft transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase text-gray-500">
                    <span>Contas a Pagar</span>
                    <FileSpreadsheet size={18} className="text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-700 mt-2">
                    R$ {totalContasPagarAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {payables.filter((b) => b.status !== 'pago').length} título(s) pendente(s)
                  </p>
                </div>

                <div
                  onClick={() => setErpSection('receivables')}
                  className="bg-white p-5 rounded-3xl border border-gray-200 hover:border-[#82260E] cursor-pointer shadow-soft transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase text-gray-500">
                    <span>Contas a Receber</span>
                    <DollarSign size={18} className="text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-blue-700 mt-2">
                    R$ {totalContasReceberAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {receivables.filter((r) => r.status !== 'recebido').length} parcela(s) em aberto
                  </p>
                </div>

                <div
                  onClick={() => setErpSection('inventory')}
                  className="bg-white p-5 rounded-3xl border border-gray-200 hover:border-[#82260E] cursor-pointer shadow-soft transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase text-gray-500">
                    <span>Estoque Loja SP</span>
                    <Package size={18} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-gray-900 mt-2">
                    {totalStockUnits} peças
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    Varejo: R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Atalhos dos Módulos ERP & Alertas de Estoque */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 p-6 shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-serif font-bold text-gray-900">
                      Acesso Rápido aos Módulos do ERP
                    </h3>
                    <span className="text-[11px] text-gray-400">100% Integrado</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      {
                        sec: 'pdv' as ErpSection,
                        title: 'PDV Frente de Caixa',
                        desc: 'Venda rápida no balcão com baixa imediata no estoque e entrada no caixa.'
                      },
                      {
                        sec: 'cashflow' as ErpSection,
                        title: 'Fluxo de Caixa Diário',
                        desc: 'Entradas, saídas, saldo por conta (Caixa Rua Jotacá, Banco e PIX).'
                      },
                      {
                        sec: 'payables' as ErpSection,
                        title: 'Contas a Pagar',
                        desc: 'Boletos de fábrica (Luckspuma, Castor, FA Maringá), aluguel e fretes.'
                      },
                      {
                        sec: 'receivables' as ErpSection,
                        title: 'Contas a Receber',
                        desc: 'Controle de vendas parceladas em até 10x e conciliação.'
                      },
                      {
                        sec: 'inventory' as ErpSection,
                        title: 'Estoque & Precificação',
                        desc: 'Os 11 produtos oficiais da Flamar com custo, margem e saldo.'
                      },
                      {
                        sec: 'dre' as ErpSection,
                        title: 'DRE Gerencial',
                        desc: 'Apuração automática de Receita Líquida, CMV, Margem Bruta e EBITDA.'
                      }
                    ].map((m) => (
                      <button
                        key={m.sec}
                        onClick={() => setErpSection(m.sec)}
                        className="p-4 rounded-2xl border border-gray-200 hover:border-[#82260E] bg-[#FAF7F4]/60 hover:bg-[#FFF7F4] text-left transition-all group"
                      >
                        <div className="flex items-center justify-between font-bold text-gray-900 group-hover:text-[#82260E]">
                          <span>{m.title}</span>
                          <ArrowUpRight size={15} />
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Posição de Estoque por Marca */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 p-6 shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-serif font-bold text-gray-900">
                      Resumo de Estoque por Produto
                    </h3>
                    <button
                      onClick={() => setErpSection('inventory')}
                      className="text-xs font-bold text-[#82260E] hover:underline"
                    >
                      Gerenciar →
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F4] border border-gray-200"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-gray-900 truncate">{p.name}</div>
                          <span className="text-[10px] text-gray-500">
                            {p.brand} • R$ {p.cash_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} à vista
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full font-extrabold shrink-0 ${
                            p.stock_qty <= p.min_stock
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {p.stock_qty} un.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {erpSection === 'pdv' && <PdvView />}
          {erpSection === 'cashflow' && <CashFlowView />}
          {erpSection === 'payables' && <PayablesView />}
          {erpSection === 'receivables' && <ReceivablesView />}
          {erpSection === 'inventory' && <InventoryView />}
          {erpSection === 'orders' && <OrdersExpeditionView />}
          {erpSection === 'customers' && <CustomersAndSuppliersView mode="customers" />}
          {erpSection === 'suppliers' && <CustomersAndSuppliersView mode="suppliers" />}
          {erpSection === 'dre' && <DreReportView />}

          {erpSection === 'settings' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-soft space-y-6 animate-fade-in text-xs sm:text-sm">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#82260E]">
                  PARÂMETROS CORPORATIVOS & FISCAIS
                </span>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mt-0.5">
                  Configurações da Empresa • Flamar Colchões
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-gray-200">
                  <span className="text-xs text-gray-500 block">Razão Social / Nome Fantasia</span>
                  <strong className="text-gray-900">{FLAMAR_COMPANY_INFO.legal_name}</strong>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-gray-200">
                  <span className="text-xs text-gray-500 block">CNPJ Oficial</span>
                  <strong className="text-gray-900">{FLAMAR_COMPANY_INFO.cnpj}</strong>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-gray-200">
                  <span className="text-xs text-gray-500 block">Endereço da Loja</span>
                  <strong className="text-gray-900">
                    {FLAMAR_COMPANY_INFO.address_street} — {FLAMAR_COMPANY_INFO.neighborhood}, {FLAMAR_COMPANY_INFO.city}/{FLAMAR_COMPANY_INFO.state} ({FLAMAR_COMPANY_INFO.cep})
                  </strong>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-gray-200">
                  <span className="text-xs text-gray-500 block">Canais de Atendimento</span>
                  <strong className="text-gray-900">
                    {FLAMAR_COMPANY_INFO.phone_landline} • {FLAMAR_COMPANY_INFO.email}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
