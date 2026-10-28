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
          {erpSection === 'inventory' && <InventoryView />}
          {erpSection === 'customers' && <CustomersModuleView />}
          {erpSection === 'analytics' && <AnalyticsModuleView />}
        </main>
      </div>
    </div>
  );
};
